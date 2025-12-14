"use client";

import dynamic from "next/dynamic";

const HatsApp = dynamic(() => import("@/components/HatsApp").then((mod) => mod.HatsApp), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hats-purple mx-auto mb-4"></div>
        <p className="text-gray-400">Loading Hats...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <HatsApp />;
}
