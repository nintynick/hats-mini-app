"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { hatsSubgraphClient, createHatsClient } from "@/lib/hats";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { base, optimism, mainnet, arbitrum, polygon, type Chain } from "viem/chains";
import sdk from "@farcaster/miniapp-sdk";

const chains: Record<number, Chain> = {
  [base.id]: base,
  [optimism.id]: optimism,
  [mainnet.id]: mainnet,
  [arbitrum.id]: arbitrum,
  [polygon.id]: polygon,
};

// Helper to get a public client for a specific chain
function getPublicClientForChain(chainId: number) {
  const chain = chains[chainId];
  if (!chain) throw new Error(`Unsupported chain: ${chainId}`);

  return createPublicClient({
    chain,
    transport: http(),
  });
}

// Helper to get a wallet client from Farcaster SDK
function getWalletClientForChain(chainId: number, account: `0x${string}`) {
  const chain = chains[chainId];
  if (!chain) throw new Error(`Unsupported chain: ${chainId}`);

  return createWalletClient({
    account,
    chain,
    transport: custom(sdk.wallet.ethProvider),
  });
}

// Hook to get hats worn by the current user
export function useUserHats(chainId: number) {
  const { address } = useAccount();

  return useQuery({
    queryKey: ["userHats", chainId, address],
    queryFn: async () => {
      if (!address) return [];

      const wearer = await hatsSubgraphClient.getWearer({
        chainId,
        wearerAddress: address,
        props: {
          currentHats: {
            props: {
              prettyId: true,
              status: true,
              details: true,
              imageUri: true,
              levelAtLocalTree: true,
              eligibility: true,
              toggle: true,
            },
          },
        },
      });

      return wearer?.currentHats || [];
    },
    enabled: !!address,
  });
}

// Hook to get a specific hat tree
export function useHatTree(chainId: number, treeId: number) {
  return useQuery({
    queryKey: ["hatTree", chainId, treeId],
    queryFn: async () => {
      const tree = await hatsSubgraphClient.getTree({
        chainId,
        treeId,
        props: {
          hats: {
            props: {
              prettyId: true,
              status: true,
              details: true,
              imageUri: true,
              levelAtLocalTree: true,
              maxSupply: true,
              currentSupply: true,
            },
          },
        },
      });
      return tree;
    },
    enabled: !!treeId,
  });
}

// Hook to search for trees
export function useTrees(chainId: number) {
  return useQuery({
    queryKey: ["trees", chainId],
    queryFn: async () => {
      const trees = await hatsSubgraphClient.getTreesPaginated({
        chainId,
        props: {
          hats: {
            props: {
              prettyId: true,
              details: true,
              imageUri: true,
              levelAtLocalTree: true,
            },
          },
        },
        page: 0,
        perPage: 20,
      });
      return trees;
    },
  });
}

// Hook to get hat details
export function useHat(chainId: number, hatId: string) {
  return useQuery({
    queryKey: ["hat", chainId, hatId],
    queryFn: async () => {
      const hat = await hatsSubgraphClient.getHat({
        chainId,
        hatId: BigInt(hatId),
        props: {
          prettyId: true,
          status: true,
          details: true,
          imageUri: true,
          levelAtLocalTree: true,
          maxSupply: true,
          currentSupply: true,
          eligibility: true,
          toggle: true,
          mutable: true,
        },
      });
      return hat;
    },
    enabled: !!hatId,
  });
}

// Hook to check if user is wearer of hat
export function useIsWearerOfHat(chainId: number, hatId: string) {
  const { address } = useAccount();

  return useQuery({
    queryKey: ["isWearerOfHat", chainId, hatId, address],
    queryFn: async () => {
      if (!address) return false;

      const publicClient = getPublicClientForChain(chainId);
      const hatsClient = createHatsClient(chainId, publicClient);
      return await hatsClient.isWearerOfHat({
        wearer: address,
        hatId: BigInt(hatId),
      });
    },
    enabled: !!address && !!hatId,
  });
}

// Hook to claim a hat
export function useClaimHat() {
  const { address } = useAccount();

  return useMutation({
    mutationFn: async ({ chainId, hatId }: { chainId: number; hatId: string }) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      const publicClient = getPublicClientForChain(chainId);
      const walletClient = getWalletClientForChain(chainId, address);
      const hatsClient = createHatsClient(chainId, publicClient, walletClient);

      const result = await hatsClient.claimHat({
        account: address,
        hatId: BigInt(hatId),
      });

      return result;
    },
  });
}

// Hook to claim a hat for another address
export function useClaimHatFor() {
  const { address } = useAccount();

  return useMutation({
    mutationFn: async ({
      chainId,
      hatId,
      wearer,
    }: {
      chainId: number;
      hatId: string;
      wearer: `0x${string}`;
    }) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      const publicClient = getPublicClientForChain(chainId);
      const walletClient = getWalletClientForChain(chainId, address);
      const hatsClient = createHatsClient(chainId, publicClient, walletClient);

      const result = await hatsClient.claimHatFor({
        account: address,
        hatId: BigInt(hatId),
        wearer,
      });

      return result;
    },
  });
}

// Hats Protocol contract address (same on all chains)
const HATS_CONTRACT_ADDRESS = "0x3bc1A0Ad72417f2d411118085256fC53CBdDd137" as const;

// Extended ABI for Hats Protocol functions
const HATS_ABI = [
  {
    inputs: [
      { name: "_target", type: "address" },
      { name: "_details", type: "string" },
      { name: "_imageURI", type: "string" },
    ],
    name: "mintTopHat",
    outputs: [{ name: "topHatId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_admin", type: "uint256" },
      { name: "_details", type: "string" },
      { name: "_maxSupply", type: "uint32" },
      { name: "_eligibility", type: "address" },
      { name: "_toggle", type: "address" },
      { name: "_mutable", type: "bool" },
      { name: "_imageURI", type: "string" },
    ],
    name: "createHat",
    outputs: [{ name: "newHatId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_hatId", type: "uint256" },
      { name: "_wearer", type: "address" },
    ],
    name: "mintHat",
    outputs: [{ name: "success", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_hatId", type: "uint256" }],
    name: "renounceHat",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_hatId", type: "uint256" },
      { name: "_from", type: "address" },
      { name: "_to", type: "address" },
    ],
    name: "transferHat",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_wearer", type: "address" },
      { name: "_hatId", type: "uint256" },
    ],
    name: "isWearerOfHat",
    outputs: [{ name: "isWearer", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "_user", type: "address" },
      { name: "_hatId", type: "uint256" },
    ],
    name: "isAdminOfHat",
    outputs: [{ name: "isAdmin", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "_wearer", type: "address" },
      { name: "_hatId", type: "uint256" },
    ],
    name: "isEligible",
    outputs: [{ name: "eligible", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Helper to switch chain before transaction
async function switchChain(chainId: number) {
  try {
    await sdk.wallet.ethProvider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (switchError) {
    console.error("Failed to switch chain:", switchError);
  }
}

// Hook to mint a new top hat (create a new tree)
export function useMintTopHat() {
  const { address } = useAccount();

  return useMutation({
    mutationFn: async ({
      chainId,
      target,
      details,
      imageURI,
    }: {
      chainId: number;
      target: `0x${string}`;
      details: string;
      imageURI: string;
    }) => {
      if (!address) {
        throw new Error("Wallet not connected. Please connect your wallet first.");
      }

      await switchChain(chainId);

      const publicClient = getPublicClientForChain(chainId);
      const walletClient = getWalletClientForChain(chainId, address);

      const { request } = await publicClient.simulateContract({
        account: address,
        address: HATS_CONTRACT_ADDRESS,
        abi: HATS_ABI,
        functionName: "mintTopHat",
        args: [target, details, imageURI],
      });

      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return { hash, receipt };
    },
  });
}

// Hook to create a child hat under an admin hat
export function useCreateHat() {
  const { address } = useAccount();

  return useMutation({
    mutationFn: async ({
      chainId,
      adminHatId,
      details,
      maxSupply,
      eligibility = "0x0000000000000000000000000000000000004A75", // Default: AllowlistEligibility
      toggle = "0x0000000000000000000000000000000000004A75", // Default: always on
      mutable = true,
      imageURI,
    }: {
      chainId: number;
      adminHatId: string;
      details: string;
      maxSupply: number;
      eligibility?: `0x${string}`;
      toggle?: `0x${string}`;
      mutable?: boolean;
      imageURI: string;
    }) => {
      if (!address) {
        throw new Error("Wallet not connected. Please connect your wallet first.");
      }

      await switchChain(chainId);

      const publicClient = getPublicClientForChain(chainId);
      const walletClient = getWalletClientForChain(chainId, address);

      const { request } = await publicClient.simulateContract({
        account: address,
        address: HATS_CONTRACT_ADDRESS,
        abi: HATS_ABI,
        functionName: "createHat",
        args: [BigInt(adminHatId), details, maxSupply, eligibility, toggle, mutable, imageURI],
      });

      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return { hash, receipt };
    },
  });
}

// Hook to mint a hat to another address
export function useMintHat() {
  const { address } = useAccount();

  return useMutation({
    mutationFn: async ({
      chainId,
      hatId,
      wearer,
    }: {
      chainId: number;
      hatId: string;
      wearer: `0x${string}`;
    }) => {
      if (!address) {
        throw new Error("Wallet not connected. Please connect your wallet first.");
      }

      await switchChain(chainId);

      const publicClient = getPublicClientForChain(chainId);
      const walletClient = getWalletClientForChain(chainId, address);

      const { request } = await publicClient.simulateContract({
        account: address,
        address: HATS_CONTRACT_ADDRESS,
        abi: HATS_ABI,
        functionName: "mintHat",
        args: [BigInt(hatId), wearer],
      });

      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return { hash, receipt };
    },
  });
}

// Hook to renounce a hat
export function useRenounceHat() {
  const { address } = useAccount();

  return useMutation({
    mutationFn: async ({
      chainId,
      hatId,
    }: {
      chainId: number;
      hatId: string;
    }) => {
      if (!address) {
        throw new Error("Wallet not connected. Please connect your wallet first.");
      }

      await switchChain(chainId);

      const publicClient = getPublicClientForChain(chainId);
      const walletClient = getWalletClientForChain(chainId, address);

      const { request } = await publicClient.simulateContract({
        account: address,
        address: HATS_CONTRACT_ADDRESS,
        abi: HATS_ABI,
        functionName: "renounceHat",
        args: [BigInt(hatId)],
      });

      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return { hash, receipt };
    },
  });
}

// Hook to transfer a hat to another address
export function useTransferHat() {
  const { address } = useAccount();

  return useMutation({
    mutationFn: async ({
      chainId,
      hatId,
      to,
    }: {
      chainId: number;
      hatId: string;
      to: `0x${string}`;
    }) => {
      if (!address) {
        throw new Error("Wallet not connected. Please connect your wallet first.");
      }

      await switchChain(chainId);

      const publicClient = getPublicClientForChain(chainId);
      const walletClient = getWalletClientForChain(chainId, address);

      const { request } = await publicClient.simulateContract({
        account: address,
        address: HATS_CONTRACT_ADDRESS,
        abi: HATS_ABI,
        functionName: "transferHat",
        args: [BigInt(hatId), address, to],
      });

      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return { hash, receipt };
    },
  });
}

// Hook to check if user is admin of a hat
export function useIsAdminOfHat(chainId: number, hatId: string) {
  const { address } = useAccount();

  return useQuery({
    queryKey: ["isAdminOfHat", chainId, hatId, address],
    queryFn: async () => {
      if (!address) return false;

      const publicClient = getPublicClientForChain(chainId);
      const result = await publicClient.readContract({
        address: HATS_CONTRACT_ADDRESS,
        abi: HATS_ABI,
        functionName: "isAdminOfHat",
        args: [address, BigInt(hatId)],
      });
      return result;
    },
    enabled: !!address && !!hatId,
  });
}

// Hook to check eligibility
export function useIsEligible(chainId: number, hatId: string) {
  const { address } = useAccount();

  return useQuery({
    queryKey: ["isEligible", chainId, hatId, address],
    queryFn: async () => {
      if (!address) return false;

      const publicClient = getPublicClientForChain(chainId);
      const result = await publicClient.readContract({
        address: HATS_CONTRACT_ADDRESS,
        abi: HATS_ABI,
        functionName: "isEligible",
        args: [address, BigInt(hatId)],
      });
      return result;
    },
    enabled: !!address && !!hatId,
  });
}

// Hook to get hat wearers
export function useHatWearers(chainId: number, hatId: string) {
  return useQuery({
    queryKey: ["hatWearers", chainId, hatId],
    queryFn: async () => {
      const hat = await hatsSubgraphClient.getHat({
        chainId,
        hatId: BigInt(hatId),
        props: {
          wearers: {
            props: {},
          },
        },
      });
      return hat?.wearers || [];
    },
    enabled: !!hatId,
  });
}
