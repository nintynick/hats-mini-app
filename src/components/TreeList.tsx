"use client";

import { useTrees } from "@/hooks/useHats";

interface TreeListProps {
  chainId: number;
  onTreeSelect: (treeId: number) => void;
}

export function TreeList({ chainId, onTreeSelect }: TreeListProps) {
  const { data: trees, isLoading, error } = useTrees(chainId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-gray-800 rounded-lg p-4 animate-pulse"
          >
            <div className="h-5 bg-gray-700 rounded w-1/3 mb-2" />
            <div className="h-3 bg-gray-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-400">
        <p>Failed to load trees</p>
        <p className="text-sm text-gray-500 mt-1">{(error as Error).message}</p>
      </div>
    );
  }

  if (!trees || trees.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">🌳</div>
        <p className="text-gray-400">No trees found on this chain</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {trees.map((tree) => {
        const hatCount = tree.hats?.length || 0;
        const topHat = tree.hats?.find((h) => h.levelAtLocalTree === 0);

        return (
          <button
            key={tree.id}
            onClick={() => onTreeSelect(parseInt(tree.id))}
            className="w-full bg-gray-800 rounded-lg p-4 text-left hover:bg-gray-750 transition-colors border border-transparent hover:border-hats-purple/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">
                  {topHat?.prettyId || `Tree #${tree.id}`}
                </h3>
                <p className="text-sm text-gray-400">
                  {hatCount} hat{hatCount !== 1 ? "s" : ""} in tree
                </p>
              </div>
              <div className="text-hats-purple">→</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
