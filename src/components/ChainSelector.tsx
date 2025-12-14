"use client";

import { CHAIN_NAMES, SUPPORTED_CHAINS } from "@/lib/hats";

interface ChainSelectorProps {
  selectedChainId: number;
  onChainChange: (chainId: number) => void;
}

export function ChainSelector({
  selectedChainId,
  onChainChange,
}: ChainSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {Object.entries(SUPPORTED_CHAINS).map(([key, chainId]) => (
        <button
          key={chainId}
          onClick={() => onChainChange(chainId)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selectedChainId === chainId
              ? "bg-hats-purple text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          {CHAIN_NAMES[chainId]}
        </button>
      ))}
    </div>
  );
}
