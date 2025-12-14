import { createConfig, http } from "wagmi";
import { base, optimism, mainnet, arbitrum, polygon } from "wagmi/chains";
import { frameConnector } from "./connector";

export const config = createConfig({
  chains: [base, optimism, mainnet, arbitrum, polygon],
  transports: {
    [base.id]: http(),
    [optimism.id]: http(),
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
  },
  connectors: [frameConnector()],
});
