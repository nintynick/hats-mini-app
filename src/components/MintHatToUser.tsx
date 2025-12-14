"use client";

import { useState, useEffect } from "react";
import { useMintHat } from "@/hooks/useHats";
import { useFarcasterUserSearch, FarcasterUser } from "@/hooks/useFarcaster";
import Image from "next/image";

interface MintHatToUserProps {
  chainId: number;
  hatId: string;
  hatName?: string;
  onSuccess?: () => void;
  onCancel: () => void;
}

export function MintHatToUser({
  chainId,
  hatId,
  hatName,
  onSuccess,
  onCancel,
}: MintHatToUserProps) {
  const mintHat = useMintHat();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<FarcasterUser | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: searchResults, isLoading: isSearching } = useFarcasterUserSearch(searchQuery);

  // Debounce search
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectUser = (user: FarcasterUser) => {
    setSelectedUser(user);
    setSearchQuery("");
  };

  const getTargetAddress = (): `0x${string}` | null => {
    if (selectedUser?.verifiedAddresses?.ethAddresses?.[0]) {
      return selectedUser.verifiedAddresses.ethAddresses[0] as `0x${string}`;
    }
    if (manualAddress && /^0x[a-fA-F0-9]{40}$/.test(manualAddress)) {
      return manualAddress as `0x${string}`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const targetAddress = getTargetAddress();
    if (!targetAddress) {
      setError("Please select a user or enter a valid address");
      return;
    }

    try {
      await mintHat.mutateAsync({
        chainId,
        hatId,
        wearer: targetAddress,
      });

      onSuccess?.();
    } catch (err) {
      console.error("Failed to mint hat:", err);
      setError((err as Error).message || "Failed to mint hat");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Mint Hat</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-white">
          &times;
        </button>
      </div>

      {hatName && (
        <p className="text-sm text-gray-400">
          Hat: <span className="text-hats-purple">{hatName}</span>
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selected User Display */}
        {selectedUser && (
          <div className="bg-gray-800 rounded-lg p-3 flex items-center gap-3">
            {selectedUser.pfpUrl && (
              <Image
                src={selectedUser.pfpUrl}
                alt=""
                width={40}
                height={40}
                className="rounded-full"
                unoptimized
              />
            )}
            <div className="flex-1">
              <p className="font-medium">@{selectedUser.username}</p>
              <p className="text-xs text-gray-400 truncate">
                {selectedUser.verifiedAddresses?.ethAddresses?.[0]}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="text-gray-400 hover:text-white"
            >
              &times;
            </button>
          </div>
        )}

        {/* Search for Farcaster User */}
        {!selectedUser && !showManual && (
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Search Farcaster User
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-hats-purple"
            />

            {/* Search Results Dropdown */}
            {debouncedQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden z-10 max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="p-3 text-center text-gray-400">Searching...</div>
                ) : searchResults && searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <button
                      key={user.fid}
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors text-left"
                    >
                      {user.pfpUrl && (
                        <Image
                          src={user.pfpUrl}
                          alt=""
                          width={32}
                          height={32}
                          className="rounded-full"
                          unoptimized
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">@{user.username}</p>
                        {user.verifiedAddresses?.ethAddresses?.[0] && (
                          <p className="text-xs text-gray-400 truncate">
                            {user.verifiedAddresses.ethAddresses[0].slice(0, 6)}...
                            {user.verifiedAddresses.ethAddresses[0].slice(-4)}
                          </p>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-400">No users found</div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowManual(true)}
              className="text-sm text-hats-purple hover:underline mt-2"
            >
              Or enter address manually
            </button>
          </div>
        )}

        {/* Manual Address Input */}
        {!selectedUser && showManual && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Wallet Address
            </label>
            <input
              type="text"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              placeholder="0x..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-hats-purple font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => {
                setShowManual(false);
                setManualAddress("");
              }}
              className="text-sm text-hats-purple hover:underline mt-2"
            >
              Search by username instead
            </button>
          </div>
        )}

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
            disabled={mintHat.isPending || (!selectedUser && !manualAddress)}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mintHat.isPending ? "Minting..." : "Mint Hat"}
          </button>
        </div>
      </form>

      {mintHat.isSuccess && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 text-center">
          <p className="text-green-400 font-medium">Hat Minted!</p>
        </div>
      )}
    </div>
  );
}
