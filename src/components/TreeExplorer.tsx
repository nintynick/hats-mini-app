"use client";

import { useState } from "react";
import { useHatTree } from "@/hooks/useHats";
import { HatCard } from "./HatCard";
import { HatDetails } from "./HatDetails";

interface TreeExplorerProps {
  chainId: number;
  treeId: number;
  onBack: () => void;
}

export function TreeExplorer({ chainId, treeId, onBack }: TreeExplorerProps) {
  const { data: tree, isLoading, error } = useHatTree(chainId, treeId);
  const [selectedHatId, setSelectedHatId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="text-hats-purple hover:underline">
          ← Back to trees
        </button>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="hat-card animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-lg bg-gray-700" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="text-hats-purple hover:underline">
          ← Back to trees
        </button>
        <div className="text-center py-8 text-red-400">
          <p>Failed to load tree</p>
          <p className="text-sm text-gray-500 mt-1">
            {(error as Error).message}
          </p>
        </div>
      </div>
    );
  }

  // Show hat details if selected
  if (selectedHatId) {
    return (
      <HatDetails
        chainId={chainId}
        hatId={selectedHatId}
        onBack={() => setSelectedHatId(null)}
      />
    );
  }

  const hats = tree?.hats || [];

  // Sort hats by level
  const sortedHats = [...hats].sort(
    (a, b) => (a.levelAtLocalTree || 0) - (b.levelAtLocalTree || 0)
  );

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-hats-purple hover:underline">
        ← Back to trees
      </button>

      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="font-bold text-lg">Tree #{treeId}</h2>
        <p className="text-sm text-gray-400">{hats.length} hats in this tree</p>
      </div>

      <div className="space-y-3">
        {sortedHats.map((hat) => (
          <div
            key={hat.id}
            style={{ marginLeft: `${(hat.levelAtLocalTree || 0) * 16}px` }}
          >
            <HatCard hat={hat} onClick={() => setSelectedHatId(hat.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
