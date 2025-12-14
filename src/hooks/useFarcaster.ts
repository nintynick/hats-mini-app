"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import sdk from "@farcaster/miniapp-sdk";

export interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  verifiedAddresses?: {
    ethAddresses?: string[];
  };
}

export function useFarcasterContext() {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadContext = async () => {
      try {
        const context = await sdk.context;
        if (context?.user) {
          setUser({
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl,
          });
        }
      } catch (error) {
        console.error("Failed to load Farcaster context:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadContext();
  }, []);

  return { user, isLoaded };
}

export function useFarcasterActions() {
  const openUrl = useCallback(async (url: string) => {
    try {
      await sdk.actions.openUrl(url);
    } catch (error) {
      console.error("Failed to open URL:", error);
      window.open(url, "_blank");
    }
  }, []);

  const close = useCallback(async () => {
    try {
      await sdk.actions.close();
    } catch (error) {
      console.error("Failed to close frame:", error);
    }
  }, []);

  return { openUrl, close };
}

// Neynar API for Farcaster user lookups
const NEYNAR_API_URL = "https://api.neynar.com/v2/farcaster";

// Hook to search Farcaster users by username
export function useFarcasterUserSearch(query: string) {
  return useQuery({
    queryKey: ["farcasterUserSearch", query],
    queryFn: async (): Promise<FarcasterUser[]> => {
      if (!query || query.length < 2) return [];

      // Use Neynar's public API endpoint for user search
      const response = await fetch(
        `${NEYNAR_API_URL}/user/search?q=${encodeURIComponent(query)}&limit=10`,
        {
          headers: {
            accept: "application/json",
            api_key: "NEYNAR_API_DOCS", // Public demo key
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to search users");
      }

      const data = await response.json();
      return (data.result?.users || []).map((user: {
        fid: number;
        username?: string;
        display_name?: string;
        pfp_url?: string;
        verified_addresses?: { eth_addresses?: string[] };
      }) => ({
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        pfpUrl: user.pfp_url,
        verifiedAddresses: {
          ethAddresses: user.verified_addresses?.eth_addresses || [],
        },
      }));
    },
    enabled: query.length >= 2,
    staleTime: 30000,
  });
}

// Hook to get Farcaster user by address
export function useFarcasterUserByAddress(address: string | undefined) {
  return useQuery({
    queryKey: ["farcasterUserByAddress", address],
    queryFn: async (): Promise<FarcasterUser | null> => {
      if (!address) return null;

      const response = await fetch(
        `${NEYNAR_API_URL}/user/bulk-by-address?addresses=${address}`,
        {
          headers: {
            accept: "application/json",
            api_key: "NEYNAR_API_DOCS",
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const users = data[address.toLowerCase()];
      if (!users || users.length === 0) return null;

      const user = users[0];
      return {
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        pfpUrl: user.pfp_url,
        verifiedAddresses: {
          ethAddresses: user.verified_addresses?.eth_addresses || [],
        },
      };
    },
    enabled: !!address,
    staleTime: 60000,
  });
}

// Hook to get multiple Farcaster users by addresses
export function useFarcasterUsersByAddresses(addresses: string[]) {
  return useQuery({
    queryKey: ["farcasterUsersByAddresses", addresses],
    queryFn: async (): Promise<Map<string, FarcasterUser>> => {
      if (addresses.length === 0) return new Map();

      const response = await fetch(
        `${NEYNAR_API_URL}/user/bulk-by-address?addresses=${addresses.join(",")}`,
        {
          headers: {
            accept: "application/json",
            api_key: "NEYNAR_API_DOCS",
          },
        }
      );

      if (!response.ok) {
        return new Map();
      }

      const data = await response.json();
      const result = new Map<string, FarcasterUser>();

      for (const [addr, users] of Object.entries(data)) {
        if (Array.isArray(users) && users.length > 0) {
          const user = users[0] as {
            fid: number;
            username?: string;
            display_name?: string;
            pfp_url?: string;
            verified_addresses?: { eth_addresses?: string[] };
          };
          result.set(addr.toLowerCase(), {
            fid: user.fid,
            username: user.username,
            displayName: user.display_name,
            pfpUrl: user.pfp_url,
            verifiedAddresses: {
              ethAddresses: user.verified_addresses?.eth_addresses || [],
            },
          });
        }
      }

      return result;
    },
    enabled: addresses.length > 0,
    staleTime: 60000,
  });
}
