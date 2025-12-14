"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { ChainSelector } from "./ChainSelector";
import { UserHats } from "./UserHats";
import { TreeList } from "./TreeList";
import { TreeExplorer } from "./TreeExplorer";
import { CreateTopHat } from "./CreateTopHat";
import { useFarcasterContext } from "@/hooks/useFarcaster";
import { shortenAddress, SUPPORTED_CHAINS } from "@/lib/hats";

type Tab = "my-hats" | "explore" | "create";

export function HatsApp() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { user } = useFarcasterContext();

  const [activeTab, setActiveTab] = useState<Tab>("my-hats");
  const [selectedChainId, setSelectedChainId] = useState<number>(
    SUPPORTED_CHAINS.base
  );
  const [selectedTreeId, setSelectedTreeId] = useState<number | null>(null);

  const handleConnect = () => {
    // Connect to Farcaster wallet (first connector)
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎩</span>
            <h1 className="font-bold text-lg">Hats</h1>
          </div>

          {isConnected ? (
            <button
              onClick={() => disconnect()}
              className="flex items-center gap-2 bg-gray-800 rounded-full px-3 py-1.5 text-sm"
            >
              {user?.pfpUrl && (
                <img
                  src={user.pfpUrl}
                  alt=""
                  className="w-5 h-5 rounded-full"
                />
              )}
              <span>{user?.username || shortenAddress(address!)}</span>
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="btn-primary text-sm"
              disabled={isPending}
            >
              {isPending ? "Connecting..." : "Connect"}
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        {/* Chain Selector */}
        <div className="mb-4">
          <ChainSelector
            selectedChainId={selectedChainId}
            onChainChange={(chainId) => {
              setSelectedChainId(chainId);
              setSelectedTreeId(null);
            }}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => {
              setActiveTab("my-hats");
              setSelectedTreeId(null);
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors text-sm ${
              activeTab === "my-hats"
                ? "bg-hats-purple text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            My Hats
          </button>
          <button
            onClick={() => {
              setActiveTab("explore");
              setSelectedTreeId(null);
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors text-sm ${
              activeTab === "explore"
                ? "bg-hats-purple text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => {
              setActiveTab("create");
              setSelectedTreeId(null);
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors text-sm ${
              activeTab === "create"
                ? "bg-hats-purple text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Create
          </button>
        </div>

        {/* Content */}
        {!isConnected ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎩</div>
            <h2 className="text-xl font-bold mb-2">Welcome to Hats</h2>
            <p className="text-gray-400 mb-6">
              Connect your Farcaster wallet to view your hats and explore trees
            </p>
            <button
              onClick={handleConnect}
              className="btn-primary"
              disabled={isPending}
            >
              {isPending ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
        ) : activeTab === "my-hats" ? (
          <UserHats chainId={selectedChainId} />
        ) : activeTab === "create" ? (
          <CreateTopHat
            chainId={selectedChainId}
            onBack={() => setActiveTab("my-hats")}
            onSuccess={() => setActiveTab("my-hats")}
          />
        ) : selectedTreeId ? (
          <TreeExplorer
            chainId={selectedChainId}
            treeId={selectedTreeId}
            onBack={() => setSelectedTreeId(null)}
          />
        ) : (
          <TreeList
            chainId={selectedChainId}
            onTreeSelect={setSelectedTreeId}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-3">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <span>Powered by</span>
          <a
            href="https://hatsprotocol.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-hats-purple hover:underline"
          >
            Hats Protocol
          </a>
        </div>
      </footer>
    </div>
  );
}
