# Hats Protocol Mini App

A Farcaster mini app for managing [Hats Protocol](https://www.hatsprotocol.xyz/) functionality directly within Farcaster clients.

## Features

- **Create Top Hats** - Create new hat trees with yourself as the top hat wearer
- **Create Child Hats** - Create hats underneath any hat you admin
- **Mint Hats** - Mint hats to other users with Farcaster username search
- **View Hat Details** - See hat info, supply, eligibility, toggle, and status
- **View Wearers** - See who wears a hat with Farcaster profile resolution
- **Explore Trees** - Navigate full hat tree hierarchies
- **Claim Hats** - Claim hats you're eligible for
- **Renounce Hats** - Give up hats you currently wear

## Supported Chains

- Optimism
- Base
- Arbitrum
- Polygon
- Gnosis
- Mainnet
- Sepolia

## Tech Stack

- [Next.js 15](https://nextjs.org/) - React framework
- [Farcaster Mini App SDK](https://www.npmjs.com/package/@farcaster/miniapp-sdk) - Farcaster integration
- [Hats Protocol SDK](https://github.com/Hats-Protocol/sdk-v1-core) - Hat management
- [wagmi](https://wagmi.sh/) + [viem](https://viem.sh/) - Ethereum interactions
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Neynar API](https://neynar.com/) - Farcaster user lookups

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
pnpm build
```

## Deployment

The app is configured for deployment on [Vercel](https://vercel.com/). Push to your repository and Vercel will automatically deploy.

Make sure to update the domain in `public/.well-known/farcaster.json` to match your deployment URL.

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── page.tsx           # Main app page
│   ├── layout.tsx         # Root layout
│   └── api/webhook/       # Farcaster webhook handler
├── components/            # React components
│   ├── HatsApp.tsx        # Main app container
│   ├── UserHats.tsx       # User's hats list
│   ├── HatDetails.tsx     # Hat detail view
│   ├── HatCard.tsx        # Hat card component
│   ├── TreeExplorer.tsx   # Tree navigation
│   ├── TreeList.tsx       # Available trees list
│   ├── CreateTopHat.tsx   # Top hat creation form
│   ├── CreateChildHat.tsx # Child hat creation form
│   ├── MintHatToUser.tsx  # Hat minting form
│   └── HatWearers.tsx     # Wearers list modal
├── hooks/
│   ├── useHats.ts         # Hats Protocol hooks
│   └── useFarcaster.ts    # Farcaster SDK hooks
└── lib/
    ├── hats.ts            # Hats utilities
    ├── wagmi.ts           # Wagmi configuration
    └── connector.ts       # Farcaster wallet connector
```

## License

MIT
