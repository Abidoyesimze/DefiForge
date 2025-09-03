import * as chains from "viem/chains";

export type ScaffoldConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  rpcOverrides?: Record<number, string>;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
};

export const DEFAULT_ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "";

// Define ETN testnet chain
const etnTestnet = {
  id: 5201420,
  name: "ETN Testnet",
  network: "etn-testnet",
  nativeCurrency: {
    name: "ETN Test Token",
    symbol: "ETN",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc.ankr.com/electroneum_testnet"] },
    public: { http: ["https://rpc.ankr.com/electroneum_testnet"] },
  },
  blockExplorers: {
    default: { name: "ETN Explorer", url: "https://testnet-explorer.electroneum.com/" },
  },
} as const;

// Define Somnia testnet chain
const somniaTestnet = {
  id: 50312,
  name: "Somnia Testnet",
  network: "somnia-testnet",
  nativeCurrency: {
    name: "Somnia Test Token",
    symbol: "STT",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://dream-rpc.somnia.network/"] },
    public: { http: ["https://dream-rpc.somnia.network/"] },
  },
  blockExplorers: {
    default: { name: "Shannon Explorer", url: "https://shannon-explorer.somnia.network/" },
  },
} as const;

const scaffoldConfig = {
  // The networks on which your DApp is live
  targetNetworks: [etnTestnet, somniaTestnet],

  // The interval at which your front-end polls the RPC servers for new data
  pollingInterval: 30000,

  // This is the Alchemy API key that we provide to you for free. You can get your own at https://www.alchemy.com/
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY,

  // Override RPC URLs for specific networks
  rpcOverrides: {
    [etnTestnet.id]: "https://rpc.ankr.com/electroneum_testnet",
    [somniaTestnet.id]: "https://dream-rpc.somnia.network/",
  },

  // This is ours WalletConnect's default project ID.
  // You can get your own at https://cloud.walletconnect.com
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",

  // Only show the Burner Wallet when running on hardhat network
  onlyLocalBurnerWallet: true,
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
