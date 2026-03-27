import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  Gavel,
  HandCoins,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  Wallet,
  Waypoints
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "../../app/providers/ToastProvider";
import { useWeb3 } from "../../app/providers/useWeb3";
import {
  getCoreContracts,
  getExplorerAddressUrl,
  getExplorerTxUrl,
  shortenAddress,
  shortenHash
} from "../../config/web3";
import "./Web3HubPage.css";

const transactionDateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short"
});

const web3FeatureCards = [
  {
    icon: <Wallet size={22} />,
    title: "Wallet-native access",
    description: "MetaMask and WalletConnect sessions are exposed inside the marketplace shell."
  },
  {
    icon: <ShieldCheck size={22} />,
    title: "Escrow-ready checkout",
    description: "Frontend flows already describe protected settlement through MarketplaceEscrow."
  },
  {
    icon: <HandCoins size={22} />,
    title: "Royalty-aware listings",
    description: "Product detail pages now frame every craft item as a royalty-enabled NFT asset."
  },
  {
    icon: <ScanSearch size={22} />,
    title: "Explorer-linked activity",
    description: "Recent wallet transactions render in-page with direct explorer links per hash."
  }
];

export default function Web3HubPage() {
  const {
    account,
    chainId,
    chainConfig,
    connector,
    connectMetaMask,
    connectWalletConnect,
    disconnectWallet,
    error,
    isConnected,
    scanRecentTransactions,
    status,
    walletConnectEnabled
  } = useWeb3();
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [txStatus, setTxStatus] = useState("idle");
  const [txError, setTxError] = useState("");

  const coreContracts = useMemo(() => getCoreContracts(), []);
  const explorerAddressUrl = getExplorerAddressUrl(chainId, account);

  const handleWalletAction = async (action, successMessage) => {
    try {
      await action();
      if (successMessage) {
        showToast(successMessage, "success");
      }
    } catch (actionError) {
      showToast(actionError?.message || "Wallet action failed.", "error");
    }
  };

  const refreshTransactions = useCallback(
    async (shouldContinue = () => true) => {
      await Promise.resolve();
      if (!shouldContinue()) return;

      if (!isConnected) {
        setTransactions([]);
        setTxStatus("idle");
        setTxError("");
        return;
      }

      setTxStatus("loading");
      setTxError("");

      try {
        const nextTransactions = await scanRecentTransactions(120, 20);
        if (!shouldContinue()) return;
        setTransactions(nextTransactions);
        setTxStatus("ready");
      } catch (scanError) {
        if (!shouldContinue()) return;
        setTransactions([]);
        setTxStatus("error");
        setTxError(scanError?.message || "Failed to scan recent wallet activity.");
      }
    },
    [isConnected, scanRecentTransactions]
  );

  useEffect(() => {
    let isActive = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshTransactions(() => isActive).catch(() => {
      // Handled inside refreshTransactions.
    });

    return () => {
      isActive = false;
    };
  }, [account, chainId, isConnected, refreshTransactions]);

  return (
    <div className="web3-page">
      <section className="web3-hero">
        <div className="web3-hero__content">
          <span className="web3-kicker">Frontend Web3 Upgrade</span>
          <h1>Wallet connect, contract visibility, and explorer access are now first-class UI.</h1>
          <p>
            This frontend layer exposes the six core marketplace contracts, live wallet sessions,
            and recent on-chain activity without changing your existing backend flow.
          </p>

          <div className="web3-hero__actions">
            {!isConnected ? (
              <>
                <button
                  type="button"
                  className="web3-primary-button"
                  onClick={() =>
                    handleWalletAction(connectMetaMask, "MetaMask connected.")
                  }
                  disabled={status === "connecting"}
                >
                  <Wallet size={18} />
                  <span>{status === "connecting" ? "Connecting..." : "Connect MetaMask"}</span>
                </button>
                <button
                  type="button"
                  className="web3-secondary-button"
                  onClick={() =>
                    handleWalletAction(connectWalletConnect, "WalletConnect session opened.")
                  }
                  disabled={status === "connecting" || !walletConnectEnabled}
                >
                  <Waypoints size={18} />
                  <span>{walletConnectEnabled ? "WalletConnect" : "WalletConnect needs project ID"}</span>
                </button>
              </>
            ) : (
              <>
                <a
                  className="web3-primary-button"
                  href={explorerAddressUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={18} />
                  <span>Open Wallet on {chainConfig.explorerName}</span>
                </a>
                <button
                  type="button"
                  className="web3-secondary-button"
                  onClick={() =>
                    handleWalletAction(disconnectWallet, "Wallet session cleared.")
                  }
                >
                  <Wallet size={18} />
                  <span>Disconnect Wallet</span>
                </button>
              </>
            )}
          </div>

          {(error || (!walletConnectEnabled && !isConnected)) && (
            <div className="web3-note">
              {error || "Set VITE_WALLETCONNECT_PROJECT_ID to enable WalletConnect QR sessions."}
            </div>
          )}
        </div>

        <aside className="web3-session-card">
          <div className="web3-session-card__label">Wallet Session</div>
          {isConnected ? (
            <>
              <div className="web3-session-card__value">{shortenAddress(account, 8, 6)}</div>
              <div className="web3-session-card__meta">
                <span>{chainConfig.name}</span>
                <span>{connector === "walletconnect" ? "WalletConnect" : "MetaMask"}</span>
              </div>
              <div className="web3-session-card__stats">
                <div>
                  <strong>6</strong>
                  <span>Core contracts mapped</span>
                </div>
                <div>
                  <strong>{transactions.length}</strong>
                  <span>Recent tx matches</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="web3-session-card__value">No wallet attached</div>
              <div className="web3-session-card__meta">
                <span>Default chain: {chainConfig.shortName}</span>
                <span>Explorer-ready UI only</span>
              </div>
              <div className="web3-session-card__stats">
                <div>
                  <strong>ERC-721</strong>
                  <span>Asset format</span>
                </div>
                <div>
                  <strong>Escrow</strong>
                  <span>Protected settlement rail</span>
                </div>
              </div>
            </>
          )}
        </aside>
      </section>

      <section className="web3-feature-strip">
        {web3FeatureCards.map((feature) => (
          <article key={feature.title} className="web3-feature-card">
            <div className="web3-feature-card__icon">{feature.icon}</div>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>

      <section className="web3-contracts-section">
        <div className="web3-section-heading">
          <div>
            <span className="web3-kicker">Core Contracts</span>
            <h2>Six contract surfaces the frontend already understands</h2>
          </div>
          <Link to="/products" className="web3-inline-link">
            Browse products
          </Link>
        </div>

        <div className="web3-contract-grid">
          {coreContracts.map((contract) => (
            <article key={contract.key} className={`web3-contract-card accent-${contract.accent}`}>
              <div className="web3-contract-card__topline">
                <span>{contract.priority}</span>
                <span>{contract.statusLabel}</span>
              </div>
              <h3>{contract.name}</h3>
              <p>{contract.purpose}</p>
              <div className="web3-contract-card__coverage">{contract.coverage}</div>
              <div className="web3-contract-card__address">
                {contract.address ? shortenAddress(contract.address, 8, 6) : "Contract address pending"}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="web3-activity-section">
        <div className="web3-section-heading">
          <div>
            <span className="web3-kicker">Explorer Feed</span>
            <h2>Recent transactions for the connected wallet</h2>
          </div>
          <button
            type="button"
            className="web3-inline-button"
            onClick={() => refreshTransactions()}
            disabled={!isConnected || txStatus === "loading"}
          >
            <RefreshCw size={16} className={txStatus === "loading" ? "spin" : ""} />
            <span>{txStatus === "loading" ? "Refreshing" : "Refresh feed"}</span>
          </button>
        </div>

        {!isConnected ? (
          <div className="web3-empty-state">
            <Wallet size={22} />
            <p>Connect a wallet to inspect recent transactions and open each hash in the block explorer.</p>
          </div>
        ) : txStatus === "error" ? (
          <div className="web3-empty-state">
            <ScanSearch size={22} />
            <p>{txError}</p>
          </div>
        ) : transactions.length === 0 && txStatus === "ready" ? (
          <div className="web3-empty-state">
            <Gavel size={22} />
            <p>No recent matching transactions were found in the last scanned block window for this wallet.</p>
          </div>
        ) : (
          <div className="web3-transaction-list">
            {transactions.map((transaction) => {
              const txExplorerUrl = getExplorerTxUrl(chainId, transaction.hash);
              const isOutbound = transaction.direction === "outbound";

              return (
                <article key={transaction.hash} className="web3-transaction-card">
                  <div className={`web3-transaction-card__direction ${isOutbound ? "outbound" : "inbound"}`}>
                    {isOutbound ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                    <span>{isOutbound ? "Sent" : "Received"}</span>
                  </div>

                  <div className="web3-transaction-card__body">
                    <div className="web3-transaction-card__row">
                      <span>Hash</span>
                      <strong>{shortenHash(transaction.hash)}</strong>
                    </div>
                    <div className="web3-transaction-card__row">
                      <span>Counterparty</span>
                      <strong>{transaction.counterparty ? shortenAddress(transaction.counterparty, 8, 6) : "Contract creation"}</strong>
                    </div>
                    <div className="web3-transaction-card__row">
                      <span>Value</span>
                      <strong>{transaction.value} {chainConfig.symbol}</strong>
                    </div>
                    <div className="web3-transaction-card__row">
                      <span>Block</span>
                      <strong>#{transaction.blockNumber}</strong>
                    </div>
                    <div className="web3-transaction-card__row">
                      <span>Timestamp</span>
                      <strong>{transaction.timestamp ? transactionDateFormatter.format(new Date(transaction.timestamp * 1000)) : "Unavailable"}</strong>
                    </div>
                  </div>

                  <a
                    className="web3-transaction-card__link"
                    href={txExplorerUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>View on {chainConfig.explorerName}</span>
                    <ExternalLink size={16} />
                  </a>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
