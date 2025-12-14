"use client";

import { parseIpfsUrl } from "@/lib/hats";
import Image from "next/image";

interface Hat {
  id: string;
  prettyId?: string;
  details?: string;
  imageUri?: string;
  status?: boolean;
  levelAtLocalTree?: number;
  maxSupply?: string;
  currentSupply?: string;
}

interface HatCardProps {
  hat: Hat;
  onClick?: () => void;
}

export function HatCard({ hat, onClick }: HatCardProps) {
  const imageUrl = parseIpfsUrl(hat.imageUri);
  const supplyText =
    hat.currentSupply && hat.maxSupply
      ? `${hat.currentSupply}/${hat.maxSupply}`
      : null;

  return (
    <div
      className="hat-card cursor-pointer hover:border-hats-purple/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
          {hat.imageUri ? (
            <Image
              src={imageUrl}
              alt={hat.prettyId || "Hat"}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              🎩
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">
            {hat.prettyId || `Hat ${hat.id.slice(0, 10)}...`}
          </h3>

          {hat.details && (
            <p className="text-sm text-gray-400 line-clamp-2 mt-1">
              {hat.details}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {hat.status !== undefined && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  hat.status
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {hat.status ? "Active" : "Inactive"}
              </span>
            )}

            {hat.levelAtLocalTree !== undefined && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-hats-purple/20 text-hats-purple">
                Level {hat.levelAtLocalTree}
              </span>
            )}

            {supplyText && (
              <span className="text-xs text-gray-500">{supplyText} worn</span>
            )}
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="text-gray-500 self-center">
          →
        </div>
      </div>
    </div>
  );
}
