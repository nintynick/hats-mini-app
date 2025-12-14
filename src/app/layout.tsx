import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hats Mini App",
  description: "Manage your hats and explore trees on Farcaster",
  other: {
    "fc:frame": JSON.stringify({
      version: "1",
      imageUrl: "https://hats-mini-app.vercel.app/og-image.png",
      button: {
        title: "Open Hats",
        action: {
          type: "launch_frame",
          url: "https://hats-mini-app.vercel.app",
          splashImageUrl: "https://hats-mini-app.vercel.app/splash.png",
          splashBackgroundColor: "#1A1A2E",
        },
      },
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
