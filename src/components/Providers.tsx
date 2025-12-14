"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, useConnect, useAccount } from "wagmi";
import { config } from "@/lib/wagmi";
import { useState, useEffect, ReactNode } from "react";
import sdk from "@farcaster/miniapp-sdk";

const queryClient = new QueryClient();

interface ProvidersProps {
  children: ReactNode;
}

// Auto-connect to Farcaster wallet
function WalletAutoConnect({ children }: { children: ReactNode }) {
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected && connectors.length > 0) {
      // Auto-connect to the Farcaster connector
      connect({ connector: connectors[0] });
    }
  }, [isConnected, connectors, connect]);

  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      // Signal to Farcaster that the app is ready
      await sdk.actions.ready();
      setIsSDKLoaded(true);
    };
    load();
  }, []);

  if (!isSDKLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hats-purple mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Hats...</p>
        </div>
      </div>
    );
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletAutoConnect>{children}</WalletAutoConnect>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
