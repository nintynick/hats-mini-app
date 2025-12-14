"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useMintTopHat } from "@/hooks/useHats";

interface CreateTopHatProps {
  chainId: number;
  onSuccess?: (hatId: bigint) => void;
  onBack: () => void;
}

export function CreateTopHat({ chainId, onSuccess, onBack }: CreateTopHatProps) {
  const { address } = useAccount();
  const mintTopHat = useMintTopHat();

  const [details, setDetails] = useState("");
  const [imageURI, setImageURI] = useState("");
  const [targetAddress, setTargetAddress] = useState(address || "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!targetAddress) {
      setError("Target address is required");
      return;
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(targetAddress)) {
      setError("Invalid Ethereum address");
      return;
    }

    try {
      const result = await mintTopHat.mutateAsync({
        chainId,
        target: targetAddress as `0x${string}`,
        details: details || "My Top Hat",
        imageURI: imageURI || "",
      });

      if (result.hash && onSuccess) {
        // Transaction successful - we don't have hatId from direct contract call
        // but we can signal success
        onSuccess(BigInt(0));
      }
    } catch (err) {
      console.error("Failed to mint top hat:", err);
      setError((err as Error).message || "Failed to create top hat");
    }
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-hats-purple hover:underline">
        ← Back
      </button>

      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <span className="text-2xl">🎩</span>
          Create New Top Hat
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Start a new Hats tree by minting a Top Hat
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Top Hat Name / Details
          </label>
          <input
            type="text"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="My Organization"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-hats-purple"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Image URL (optional)
          </label>
          <input
            type="text"
            value={imageURI}
            onChange={(e) => setImageURI(e.target.value)}
            placeholder="ipfs://... or https://..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-hats-purple"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Mint To Address
          </label>
          <input
            type="text"
            value={targetAddress}
            onChange={(e) => setTargetAddress(e.target.value)}
            placeholder="0x..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-hats-purple font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            The address that will wear this Top Hat
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={mintTopHat.isPending}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mintTopHat.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Creating Top Hat...
            </span>
          ) : (
            "Create Top Hat"
          )}
        </button>
      </form>

      {mintTopHat.isSuccess && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">🎉</div>
          <p className="text-green-400 font-medium">Top Hat Created!</p>
          <p className="text-sm text-gray-400 mt-1">
            Your new Hats tree has been created successfully.
          </p>
        </div>
      )}
    </div>
  );
}
