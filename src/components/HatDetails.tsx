"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import {
  useHat,
  useIsWearerOfHat,
  useIsAdminOfHat,
  useIsEligible,
  useRenounceHat,
  useClaimHat,
} from "@/hooks/useHats";
import { parseIpfsUrl, shortenAddress } from "@/lib/hats";
import { CreateChildHat } from "./CreateChildHat";
import { MintHatToUser } from "./MintHatToUser";
import { HatWearers } from "./HatWearers";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";

interface HatDetailsProps {
  chainId: number;
  hatId: string;
  onBack: () => void;
  onViewTree?: (treeId: number) => void;
}

type Modal = "create-child" | "mint" | "wearers" | null;

// Extract tree ID from hat ID (first 4 bytes / top 32 bits)
function getTreeIdFromHatId(hatId: string): number {
  const hatIdBigInt = BigInt(hatId);
  // Tree ID is the top 32 bits of the 256-bit hat ID
  const treeId = Number(hatIdBigInt >> BigInt(224));
  return treeId;
}

export function HatDetails({ chainId, hatId, onBack, onViewTree }: HatDetailsProps) {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const { data: hat, isLoading } = useHat(chainId, hatId);
  const { data: isWearer } = useIsWearerOfHat(chainId, hatId);
  const { data: isAdmin } = useIsAdminOfHat(chainId, hatId);
  const { data: isEligible } = useIsEligible(chainId, hatId);

  const renounceHat = useRenounceHat();
  const claimHat = useClaimHat();

  const [modal, setModal] = useState<Modal>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRenounce = async () => {
    if (!confirm("Are you sure you want to renounce this hat?")) return;

    setError(null);
    try {
      await renounceHat.mutateAsync({ chainId, hatId });
      queryClient.invalidateQueries({ queryKey: ["isWearerOfHat"] });
      queryClient.invalidateQueries({ queryKey: ["userHats"] });
      queryClient.invalidateQueries({ queryKey: ["hatWearers"] });
    } catch (err) {
      console.error("Failed to renounce hat:", err);
      setError((err as Error).message || "Failed to renounce hat");
    }
  };

  const handleClaim = async () => {
    setError(null);
    try {
      await claimHat.mutateAsync({ chainId, hatId });
      queryClient.invalidateQueries({ queryKey: ["isWearerOfHat"] });
      queryClient.invalidateQueries({ queryKey: ["userHats"] });
      queryClient.invalidateQueries({ queryKey: ["hatWearers"] });
    } catch (err) {
      console.error("Failed to claim hat:", err);
      setError((err as Error).message || "Failed to claim hat");
    }
  };

  const handleModalSuccess = () => {
    setModal(null);
    queryClient.invalidateQueries({ queryKey: ["hatTree"] });
    queryClient.invalidateQueries({ queryKey: ["hatWearers"] });
    queryClient.invalidateQueries({ queryKey: ["userHats"] });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="text-hats-purple hover:underline">
          ← Back
        </button>
        <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
          <div className="w-24 h-24 rounded-lg bg-gray-700 mx-auto mb-4" />
          <div className="h-6 bg-gray-700 rounded w-1/2 mx-auto mb-2" />
          <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto" />
        </div>
      </div>
    );
  }

  if (!hat) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="text-hats-purple hover:underline">
          ← Back
        </button>
        <div className="text-center py-8 text-gray-400">
          <p>Hat not found</p>
        </div>
      </div>
    );
  }

  const imageUrl = parseIpfsUrl(hat.imageUri);
  const canClaim =
    isEligible &&
    !isWearer &&
    hat.maxSupply &&
    hat.currentSupply &&
    parseInt(hat.currentSupply) < parseInt(hat.maxSupply);

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-hats-purple hover:underline">
        ← Back
      </button>

      {/* Hat Header */}
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-700 mx-auto mb-4">
          {hat.imageUri ? (
            <Image
              src={imageUrl}
              alt={hat.prettyId || "Hat"}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              🎩
            </div>
          )}
        </div>

        <h2 className="font-bold text-xl">{hat.prettyId || `Hat ${hatId.slice(0, 10)}...`}</h2>

        {hat.details && <p className="text-gray-400 mt-2">{hat.details}</p>}

        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
          <span
            className={`text-xs px-3 py-1 rounded-full ${
              hat.status
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {hat.status ? "Active" : "Inactive"}
          </span>

          {hat.levelAtLocalTree !== undefined && (
            <span className="text-xs px-3 py-1 rounded-full bg-hats-purple/20 text-hats-purple">
              Level {hat.levelAtLocalTree}
            </span>
          )}

          {hat.mutable && (
            <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
              Mutable
            </span>
          )}
        </div>
      </div>

      {/* Hat Info */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Supply</span>
          <span>
            {hat.currentSupply || 0} / {hat.maxSupply || "∞"}
          </span>
        </div>

        {hat.eligibility && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Eligibility</span>
            <span className="font-mono text-xs">
              {shortenAddress(hat.eligibility)}
            </span>
          </div>
        )}

        {hat.toggle && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Toggle</span>
            <span className="font-mono text-xs">{shortenAddress(hat.toggle)}</span>
          </div>
        )}
      </div>

      {/* User Status */}
      {address && (
        <div className="bg-gray-800 rounded-lg p-4 space-y-2">
          <h3 className="font-medium text-sm text-gray-300">Your Status</h3>
          <div className="flex flex-wrap gap-2">
            {isWearer && (
              <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                You wear this hat
              </span>
            )}
            {isAdmin && (
              <span className="text-xs px-3 py-1 rounded-full bg-hats-purple/20 text-hats-purple">
                You are an admin
              </span>
            )}
            {isEligible && !isWearer && (
              <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
                You are eligible
              </span>
            )}
            {!isWearer && !isAdmin && !isEligible && (
              <span className="text-xs px-3 py-1 rounded-full bg-gray-700 text-gray-400">
                Not eligible
              </span>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {/* View Tree */}
        {onViewTree && (
          <button
            onClick={() => onViewTree(getTreeIdFromHatId(hatId))}
            className="w-full py-2 bg-gray-700 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            <span>🌳</span> View Full Tree
          </button>
        )}

        {/* View Wearers */}
        <button
          onClick={() => setModal("wearers")}
          className="w-full py-2 bg-gray-700 rounded-lg font-medium hover:bg-gray-600 transition-colors"
        >
          View Wearers ({hat.currentSupply || 0})
        </button>

        {/* Claim Hat */}
        {canClaim && (
          <button
            onClick={handleClaim}
            disabled={claimHat.isPending}
            className="btn-primary w-full disabled:opacity-50"
          >
            {claimHat.isPending ? "Claiming..." : "Claim Hat"}
          </button>
        )}

        {/* Admin Actions */}
        {isAdmin && (
          <>
            <button
              onClick={() => setModal("create-child")}
              className="w-full py-2 bg-hats-purple/20 text-hats-purple rounded-lg font-medium hover:bg-hats-purple/30 transition-colors"
            >
              Create Child Hat
            </button>
            <button
              onClick={() => setModal("mint")}
              className="w-full py-2 bg-hats-purple/20 text-hats-purple rounded-lg font-medium hover:bg-hats-purple/30 transition-colors"
            >
              Mint to User
            </button>
          </>
        )}

        {/* Renounce */}
        {isWearer && (
          <button
            onClick={handleRenounce}
            disabled={renounceHat.isPending}
            className="w-full py-2 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
          >
            {renounceHat.isPending ? "Renouncing..." : "Renounce Hat"}
          </button>
        )}
      </div>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-4 w-full max-w-md max-h-[80vh] overflow-y-auto">
            {modal === "create-child" && (
              <CreateChildHat
                chainId={chainId}
                adminHatId={hatId}
                adminHatName={hat.details || hat.prettyId}
                onSuccess={handleModalSuccess}
                onCancel={() => setModal(null)}
              />
            )}
            {modal === "mint" && (
              <MintHatToUser
                chainId={chainId}
                hatId={hatId}
                hatName={hat.details || hat.prettyId}
                onSuccess={handleModalSuccess}
                onCancel={() => setModal(null)}
              />
            )}
            {modal === "wearers" && (
              <HatWearers
                chainId={chainId}
                hatId={hatId}
                hatName={hat.details || hat.prettyId}
                onClose={() => setModal(null)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
