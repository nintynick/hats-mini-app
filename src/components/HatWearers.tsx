"use client";

import { useHatWearers } from "@/hooks/useHats";
import { useFarcasterUsersByAddresses } from "@/hooks/useFarcaster";
import { shortenAddress } from "@/lib/hats";
import Image from "next/image";

interface HatWearersProps {
  chainId: number;
  hatId: string;
  hatName?: string;
  onClose: () => void;
}

export function HatWearers({ chainId, hatId, hatName, onClose }: HatWearersProps) {
  const { data: wearers, isLoading } = useHatWearers(chainId, hatId);

  const wearerAddresses = (wearers || []).map((w: { id: string }) => w.id);
  const { data: fcUsers } = useFarcasterUsersByAddresses(wearerAddresses);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Hat Wearers</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          &times;
        </button>
      </div>

      {hatName && (
        <p className="text-sm text-gray-400">
          Hat: <span className="text-hats-purple">{hatName}</span>
        </p>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-700" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-24 mb-1" />
                  <div className="h-3 bg-gray-700 rounded w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : wearers && wearers.length > 0 ? (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {wearers.map((wearer: { id: string }) => {
            const fcUser = fcUsers?.get(wearer.id.toLowerCase());
            return (
              <div
                key={wearer.id}
                className="bg-gray-800 rounded-lg p-3 flex items-center gap-3"
              >
                {fcUser?.pfpUrl ? (
                  <Image
                    src={fcUser.pfpUrl}
                    alt=""
                    width={40}
                    height={40}
                    className="rounded-full"
                    unoptimized
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg">
                    👤
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {fcUser ? (
                    <>
                      <p className="font-medium">@{fcUser.username}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {shortenAddress(wearer.id)}
                      </p>
                    </>
                  ) : (
                    <p className="font-mono text-sm">{shortenAddress(wearer.id)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p>No one is wearing this hat yet</p>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        {wearers?.length || 0} wearer{wearers?.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
