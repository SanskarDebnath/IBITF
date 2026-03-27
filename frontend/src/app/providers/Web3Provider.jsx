import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_CHAIN_ID,
  SUPPORTED_CHAINS,
  WALLETCONNECT_ENABLED,
  WALLETCONNECT_PROJECT_ID,
  formatNativeValue,
  getChainConfig,
  normalizeChainId
} from "../../config/web3";
import { Web3Context } from "./web3Context";

const LAST_CONNECTOR_KEY = "tripureswari:web3:lastConnector";

function getMetaMaskProvider() {
  if (typeof window === "undefined") return null;
  const { ethereum } = window;
  if (!ethereum) return null;

  if (Array.isArray(ethereum.providers) && ethereum.providers.length > 0) {
    return ethereum.providers.find((provider) => provider?.isMetaMask) || ethereum.providers[0];
  }

  return ethereum;
}

function normalizeAccount(value) {
  return value ? String(value).toLowerCase() : "";
}

function hexToDecimal(value) {
  const normalized = normalizeChainId(value);
  return normalized ?? 0;
}

function buildWalletConnectMetadata() {
  if (typeof window === "undefined") {
    return {
      name: "Tripureswari Marketplace",
      description: "Wallet access for handcrafted asset provenance",
      url: "https://localhost",
      icons: []
    };
  }

  const iconUrl = new URL("/vite.svg", window.location.origin).toString();
  return {
    name: "Tripureswari Marketplace",
    description: "Wallet access for handcrafted asset provenance",
    url: window.location.origin,
    icons: [iconUrl]
  };
}

export function Web3Provider({ children }) {
  const [status, setStatus] = useState("idle");
  const [connector, setConnector] = useState("");
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(DEFAULT_CHAIN_ID);
  const [error, setError] = useState("");

  const providerRef = useRef(null);
  const listenersRef = useRef([]);

  const chainConfig = useMemo(() => getChainConfig(chainId), [chainId]);

  const detachListeners = useCallback(() => {
    listenersRef.current.forEach(({ provider, eventName, handler }) => {
      if (provider?.removeListener) {
        provider.removeListener(eventName, handler);
      }
    });
    listenersRef.current = [];
  }, []);

  const clearConnection = useCallback(
    (nextError = "") => {
      detachListeners();
      providerRef.current = null;
      setStatus("idle");
      setConnector("");
      setAccount("");
      setChainId(DEFAULT_CHAIN_ID);
      setError(nextError);

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(LAST_CONNECTOR_KEY);
      }
    },
    [detachListeners]
  );

  const registerProvider = useCallback(
    (provider, nextConnector) => {
      detachListeners();
      providerRef.current = provider;
      setConnector(nextConnector);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(LAST_CONNECTOR_KEY, nextConnector);
      }

      if (!provider?.on) return;

      const handleAccountsChanged = (accounts) => {
        const nextAccount = accounts?.[0] || "";
        if (!nextAccount) {
          clearConnection("Wallet disconnected.");
          return;
        }

        setAccount(nextAccount);
        setStatus("connected");
        setError("");
      };

      const handleChainChanged = (nextChainId) => {
        setChainId(normalizeChainId(nextChainId) || DEFAULT_CHAIN_ID);
      };

      const handleDisconnect = () => {
        clearConnection("Wallet session ended.");
      };

      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);
      provider.on("disconnect", handleDisconnect);

      listenersRef.current = [
        { provider, eventName: "accountsChanged", handler: handleAccountsChanged },
        { provider, eventName: "chainChanged", handler: handleChainChanged },
        { provider, eventName: "disconnect", handler: handleDisconnect }
      ];
    },
    [clearConnection, detachListeners]
  );

  const syncConnectionState = useCallback(
    async (provider, nextConnector) => {
      const [accounts, rawChainId] = await Promise.all([
        provider.request({ method: "eth_accounts" }),
        provider.request({ method: "eth_chainId" })
      ]);

      const nextAccount = accounts?.[0] || "";
      if (!nextAccount) {
        clearConnection();
        return null;
      }

      registerProvider(provider, nextConnector);
      setStatus("connected");
      setAccount(nextAccount);
      setChainId(normalizeChainId(rawChainId) || DEFAULT_CHAIN_ID);
      setError("");

      return {
        connector: nextConnector,
        account: nextAccount,
        chainId: normalizeChainId(rawChainId) || DEFAULT_CHAIN_ID
      };
    },
    [clearConnection, registerProvider]
  );

  const connectMetaMask = useCallback(async () => {
    const provider = getMetaMaskProvider();
    if (!provider) {
      throw new Error("MetaMask is not available in this browser.");
    }

    setStatus("connecting");
    setError("");

    try {
      await provider.request({ method: "eth_requestAccounts" });
      return await syncConnectionState(provider, "metamask");
    } catch (connectionError) {
      clearConnection(connectionError?.message || "Failed to connect MetaMask.");
      throw connectionError;
    }
  }, [clearConnection, syncConnectionState]);

  const connectWalletConnect = useCallback(async () => {
    if (!WALLETCONNECT_ENABLED) {
      throw new Error("Set VITE_WALLETCONNECT_PROJECT_ID to enable WalletConnect.");
    }

    setStatus("connecting");
    setError("");

    try {
      const { EthereumProvider } = await import("@walletconnect/ethereum-provider");
      const provider = await EthereumProvider.init({
        projectId: WALLETCONNECT_PROJECT_ID,
        showQrModal: true,
        chains: Object.keys(SUPPORTED_CHAINS).map(Number),
        optionalChains: Object.keys(SUPPORTED_CHAINS).map(Number),
        methods: [
          "eth_sendTransaction",
          "personal_sign",
          "eth_signTypedData",
          "eth_signTypedData_v4"
        ],
        metadata: buildWalletConnectMetadata()
      });

      await provider.connect();
      return await syncConnectionState(provider, "walletconnect");
    } catch (connectionError) {
      clearConnection(connectionError?.message || "Failed to connect WalletConnect.");
      throw connectionError;
    }
  }, [clearConnection, syncConnectionState]);

  const disconnectWallet = useCallback(async () => {
    const activeProvider = providerRef.current;
    const activeConnector = connector;

    try {
      if (activeConnector === "walletconnect" && activeProvider?.disconnect) {
        await activeProvider.disconnect();
      }
    } finally {
      clearConnection();
    }
  }, [clearConnection, connector]);

  const scanRecentTransactions = useCallback(
    async (blockWindow = 96, maxResults = 18) => {
      const provider = providerRef.current;
      const activeAccount = normalizeAccount(account);

      if (!provider || !activeAccount) {
        return [];
      }

      const latestBlockHex = await provider.request({ method: "eth_blockNumber" });
      const latestBlockNumber = hexToDecimal(latestBlockHex);
      const earliestBlockNumber = Math.max(0, latestBlockNumber - blockWindow);
      const blockNumbers = [];

      for (let blockNumber = latestBlockNumber; blockNumber >= earliestBlockNumber; blockNumber -= 1) {
        blockNumbers.push(blockNumber);
      }

      const matchedTransactions = [];

      for (let index = 0; index < blockNumbers.length && matchedTransactions.length < maxResults; index += 8) {
        const batch = blockNumbers.slice(index, index + 8);
        const blocks = await Promise.all(
          batch.map((blockNumber) =>
            provider.request({
              method: "eth_getBlockByNumber",
              params: [`0x${blockNumber.toString(16)}`, true]
            })
          )
        );

        blocks.forEach((block) => {
          const timestamp = Number.parseInt(block?.timestamp || "0x0", 16);
          const blockNumber = Number.parseInt(block?.number || "0x0", 16);

          block?.transactions?.forEach((transaction) => {
            const from = normalizeAccount(transaction?.from);
            const to = normalizeAccount(transaction?.to);

            if (from !== activeAccount && to !== activeAccount) {
              return;
            }

            matchedTransactions.push({
              hash: transaction.hash,
              from: transaction.from,
              to: transaction.to,
              direction: from === activeAccount ? "outbound" : "inbound",
              counterparty: from === activeAccount ? transaction.to : transaction.from,
              value: formatNativeValue(transaction.value),
              blockNumber,
              timestamp
            });
          });
        });
      }

      return matchedTransactions
        .sort((left, right) => {
          if (right.blockNumber !== left.blockNumber) {
            return right.blockNumber - left.blockNumber;
          }

          return right.timestamp - left.timestamp;
        })
        .slice(0, maxResults);
    },
    [account]
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const lastConnector = window.localStorage.getItem(LAST_CONNECTOR_KEY);
    if (lastConnector !== "metamask") return undefined;

    const provider = getMetaMaskProvider();
    if (!provider) return undefined;

    syncConnectionState(provider, "metamask").catch(() => {
      clearConnection();
    });

    return () => {
      detachListeners();
    };
  }, [clearConnection, detachListeners, syncConnectionState]);

  const value = useMemo(
    () => ({
      status,
      connector,
      account,
      chainId,
      chainConfig,
      error,
      isConnected: status === "connected" && Boolean(account),
      walletConnectEnabled: WALLETCONNECT_ENABLED,
      connectMetaMask,
      connectWalletConnect,
      disconnectWallet,
      scanRecentTransactions
    }),
    [
      account,
      chainConfig,
      chainId,
      connectMetaMask,
      connectWalletConnect,
      connector,
      disconnectWallet,
      error,
      scanRecentTransactions,
      status
    ]
  );

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}
