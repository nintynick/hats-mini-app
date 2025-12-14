import { HatsClient } from "@hatsprotocol/sdk-v1-core";
import { HatsSubgraphClient } from "@hatsprotocol/sdk-v1-subgraph";
import { PublicClient, WalletClient } from "viem";

// Initialize the subgraph client for reading data
export const hatsSubgraphClient = new HatsSubgraphClient({});

// Create a HatsClient instance for a given chain
export function createHatsClient(
  chainId: number,
  publicClient: PublicClient,
  walletClient?: WalletClient
): HatsClient {
  return new HatsClient({
    chainId,
    publicClient,
    walletClient,
  });
}

// Supported chain IDs for Hats Protocol
export const SUPPORTED_CHAINS = {
  mainnet: 1,
  optimism: 10,
  polygon: 137,
  arbitrum: 42161,
  base: 8453,
} as const;

// Chain names for display
export const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  10: "Optimism",
  137: "Polygon",
  42161: "Arbitrum",
  8453: "Base",
};

// Helper to format hat ID for display
export function formatHatId(hatId: bigint): string {
  return `0x${hatId.toString(16).padStart(64, "0")}`;
}

// Helper to shorten addresses
export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Helper to parse IPFS URLs
export function parseIpfsUrl(url: string | undefined): string {
  if (!url) return "/hat-placeholder.svg";
  if (url.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${url.slice(7)}`;
  }
  return url;
}
