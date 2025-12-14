"use client";

import { useState } from "react";
import { useCreateHat } from "@/hooks/useHats";

interface CreateChildHatProps {
  chainId: number;
  adminHatId: string;
  adminHatName?: string;
  onSuccess?: () => void;
  onCancel: () => void;
}

export function CreateChildHat({
  chainId,
  adminHatId,
  adminHatName,
  onSuccess,
  onCancel,
}: CreateChildHatProps) {
  const createHat = useCreateHat();

  const [details, setDetails] = useState("");
  const [imageURI, setImageURI] = useState("");
  const [maxSupply, setMaxSupply] = useState("10");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!details.trim()) {
      setError("Hat name is required");
      return;
    }

    const supply = parseInt(maxSupply);
    if (isNaN(supply) || supply < 1) {
      setError("Max supply must be at least 1");
      return;
    }

    try {
      await createHat.mutateAsync({
        chainId,
        adminHatId,
        details: details.trim(),
        maxSupply: supply,
        imageURI: imageURI.trim(),
      });

      onSuccess?.();
    } catch (err) {
      console.error("Failed to create hat:", err);
      setError((err as Error).message || "Failed to create hat");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Create Child Hat</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-white">
          &times;
        </button>
      </div>

      {adminHatName && (
        <p className="text-sm text-gray-400">
          Under: <span className="text-hats-purple">{adminHatName}</span>
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Hat Name / Role *
          </label>
          <input
            type="text"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="e.g., Admin, Contributor, Moderator"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-hats-purple"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Max Supply
          </label>
          <input
            type="number"
            value={maxSupply}
            onChange={(e) => setMaxSupply(e.target.value)}
            min="1"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-hats-purple"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum number of addresses that can wear this hat
          </p>
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

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 bg-gray-700 rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createHat.isPending}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createHat.isPending ? "Creating..." : "Create Hat"}
          </button>
        </div>
      </form>

      {createHat.isSuccess && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 text-center">
          <p className="text-green-400 font-medium">Hat Created!</p>
        </div>
      )}
    </div>
  );
}
