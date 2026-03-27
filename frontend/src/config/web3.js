const FALLBACK_CHAIN_ID = 137;
const WEI_DECIMALS = 18n;
const WEI_FACTOR = 10n ** WEI_DECIMALS;

const contractAddressEnvMap = {
  productNFT: "VITE_CONTRACT_PRODUCT_NFT",
  marketplace: "VITE_CONTRACT_MARKETPLACE",
  marketplaceEscrow: "VITE_CONTRACT_MARKETPLACE_ESCROW",
  platformAdmin: "VITE_CONTRACT_PLATFORM_ADMIN",
  marketplaceAuction: "VITE_CONTRACT_MARKETPLACE_AUCTION",
  marketplaceOffers: "VITE_CONTRACT_MARKETPLACE_OFFERS"
};

export function normalizeChainId(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const text = String(value).trim();
  if (!text) return null;

  const parsed = text.startsWith("0x")
    ? Number.parseInt(text, 16)
    : Number.parseInt(text, 10);

  return Number.isFinite(parsed) ? parsed : null;
}

export const SUPPORTED_CHAINS = {
  1: {
    id: 1,
    name: "Ethereum",
    shortName: "ETH Mainnet",
    symbol: "ETH",
    explorerName: "Etherscan",
    explorerUrl: "https://etherscan.io"
  },
  137: {
    id: 137,
    name: "Polygon",
    shortName: "Polygon",
    symbol: "POL",
    explorerName: "PolygonScan",
    explorerUrl: "https://polygonscan.com"
  },
  8453: {
    id: 8453,
    name: "Base",
    shortName: "Base",
    symbol: "ETH",
    explorerName: "BaseScan",
    explorerUrl: "https://basescan.org"
  },
  11155111: {
    id: 11155111,
    name: "Sepolia",
    shortName: "Sepolia",
    symbol: "ETH",
    explorerName: "Etherscan",
    explorerUrl: "https://sepolia.etherscan.io"
  },
  80002: {
    id: 80002,
    name: "Polygon Amoy",
    shortName: "Amoy",
    symbol: "POL",
    explorerName: "PolygonScan",
    explorerUrl: "https://amoy.polygonscan.com"
  },
  84532: {
    id: 84532,
    name: "Base Sepolia",
    shortName: "Base Sepolia",
    symbol: "ETH",
    explorerName: "BaseScan",
    explorerUrl: "https://sepolia.basescan.org"
  }
};

const baseContracts = [
  {
    key: "productNFT",
    name: "ProductNFT",
    purpose: "Mint handicrafts as NFTs with royalties",
    priority: "P0",
    coverage: "Authenticity, provenance, secondary sale royalties",
    accent: "cyan"
  },
  {
    key: "marketplace",
    name: "Marketplace",
    purpose: "Direct buying/selling with platform fees",
    priority: "P0",
    coverage: "Primary checkout and fee routing",
    accent: "amber"
  },
  {
    key: "marketplaceEscrow",
    name: "MarketplaceEscrow",
    purpose: "Hold funds until delivery confirmation",
    priority: "P1",
    coverage: "Buyer protection and release conditions",
    accent: "emerald"
  },
  {
    key: "platformAdmin",
    name: "PlatformAdmin",
    purpose: "Admin controls, fees, user bans",
    priority: "P0",
    coverage: "Governance, moderation, emergency controls",
    accent: "violet"
  },
  {
    key: "marketplaceAuction",
    name: "MarketplaceAuction",
    purpose: "Premium item auctions",
    priority: "P2",
    coverage: "Time-boxed bidding for rare inventory",
    accent: "rose"
  },
  {
    key: "marketplaceOffers",
    name: "MarketplaceOffers",
    purpose: "Make/accept offers on products",
    priority: "P2",
    coverage: "Negotiation rail for premium buyers",
    accent: "sky"
  }
];

export const DEFAULT_CHAIN_ID =
  normalizeChainId(import.meta.env.VITE_WEB3_DEFAULT_CHAIN_ID) || FALLBACK_CHAIN_ID;
export const WALLETCONNECT_PROJECT_ID = String(
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || ""
).trim();
export const WALLETCONNECT_ENABLED = Boolean(WALLETCONNECT_PROJECT_ID);

export function getChainConfig(chainId) {
  const normalized = normalizeChainId(chainId) || DEFAULT_CHAIN_ID;
  return (
    SUPPORTED_CHAINS[normalized] || {
      id: normalized,
      name: `Chain ${normalized}`,
      shortName: `Chain ${normalized}`,
      symbol: "ETH",
      explorerName: "Block Explorer",
      explorerUrl: ""
    }
  );
}

export function getExplorerAddressUrl(chainId, address) {
  const explorerUrl = getChainConfig(chainId).explorerUrl;
  if (!explorerUrl || !address) return "";
  return `${explorerUrl}/address/${address}`;
}

export function getExplorerTxUrl(chainId, hash) {
  const explorerUrl = getChainConfig(chainId).explorerUrl;
  if (!explorerUrl || !hash) return "";
  return `${explorerUrl}/tx/${hash}`;
}

export function shortenAddress(value, leading = 6, trailing = 4) {
  if (!value) return "";
  const text = String(value);
  if (text.length <= leading + trailing + 3) return text;
  return `${text.slice(0, leading)}...${text.slice(-trailing)}`;
}

export function shortenHash(value, leading = 10, trailing = 6) {
  return shortenAddress(value, leading, trailing);
}

export function formatNativeValue(value, precision = 4) {
  try {
    const bigintValue = BigInt(value || 0);
    const whole = bigintValue / WEI_FACTOR;
    const fraction = bigintValue % WEI_FACTOR;
    const fractionText = fraction
      .toString()
      .padStart(Number(WEI_DECIMALS), "0")
      .slice(0, precision)
      .replace(/0+$/u, "");

    return fractionText ? `${whole}.${fractionText}` : whole.toString();
  } catch {
    return "0";
  }
}

export function getCoreContracts() {
  return baseContracts.map((contract) => {
    const envKey = contractAddressEnvMap[contract.key];
    const address = envKey ? String(import.meta.env[envKey] || "").trim() : "";

    return {
      ...contract,
      address,
      isDeployed: Boolean(address),
      statusLabel: address ? "Explorer-ready" : "Awaiting deployment"
    };
  });
}

export function getProductWeb3Profile(product) {
  const numericId = Number(product?.id) || 0;
  const royaltyBps = 750;
  const editionSeed = numericId % 25;

  return {
    tokenStandard: "ERC-721",
    royaltyBps,
    royaltyPercent: (royaltyBps / 100).toFixed(1),
    settlementRail: "Marketplace + Escrow",
    offerRail: "Offers + Auction extensions",
    custodyMode: "Buyer-owned wallet provenance",
    escrowEnabled: true,
    contractKeys: [
      "productNFT",
      "marketplace",
      "marketplaceEscrow",
      "platformAdmin",
      "marketplaceAuction",
      "marketplaceOffers"
    ],
    editionLabel: editionSeed === 0 ? "1/1 provenance-ready" : `Edition profile ${editionSeed}/25`
  };
}
