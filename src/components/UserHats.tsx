"use client";

import { useState } from "react";
import { useUserHats } from "@/hooks/useHats";
import { HatCard } from "./HatCard";
import { HatDetails } from "./HatDetails";
import { TreeExplorer } from "./TreeExplorer";

interface UserHatsProps {
  chainId: number;
}

export function UserHats({ chainId }: UserHatsProps) {
  const { data: hats, isLoading, error } = useUserHats(chainId);
  const [selectedHatId, setSelectedHatId] = useState<string | null>(null);
  const [selectedTreeId, setSelectedTreeId] = useState<number | null>(null);

  // Show tree explorer if viewing a tree
  if (selectedTreeId) {
    return (
      <TreeExplorer
        chainId={chainId}
        treeId={selectedTreeId}
        onBack={() => setSelectedTreeId(null)}
      />
    );
  }

  // Show hat details if selected
  if (selectedHatId) {
    return (
      <HatDetails
        chainId={chainId}
        hatId={selectedHatId}
        onBack={() => setSelectedHatId(null)}
        onViewTree={(treeId) => {
          setSelectedHatId(null);
          setSelectedTreeId(treeId);
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="hat-card animate-pulse"
          >
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
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-400">
        <p>Failed to load your hats</p>
        <p className="text-sm text-gray-500 mt-1">{(error as Error).message}</p>
      </div>
    );
  }

  if (!hats || hats.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">🎩</div>
        <p className="text-gray-400">You don&apos;t have any hats yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Explore trees to find hats you can claim
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hats.map((hat) => (
        <HatCard
          key={hat.id}
          hat={hat}
          onClick={() => setSelectedHatId(hat.id)}
        />
      ))}
    </div>
  );
}
