import * as dotenv from "dotenv";
dotenv.config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomicfoundation/hardhat-verify";
// Only import hardhat-deploy if not in CI environment
if (process.env.CI !== "true") {
  require("hardhat-deploy");
  require("hardhat-deploy-ethers");
}
import { task } from "hardhat/config";
import generateTsAbis from "./scripts/generateTsAbis";

// If not set, it uses ours Alchemy's default API key.
// You can get your own at https://dashboard.alchemyapi.io
const providerApiKey = process.env.ALCHEMY_API_KEY;
// If not set, it uses the hardhat account 0 private key.
// You can generate a random account with `yarn generate` or `yarn account:import` to import your existing PK
const deployerPrivateKey = process.env.__RUNTIME_DEPLOYER_PRIVATE_KEY;
// Somnia testnet private key - use your actual private key from .env
const somniaPrivateKey = process.env.SOMNIA_PRIVATE_KEY;

// ETN testnet private key - use your actual private key from .env
const etnPrivateKey = process.env.ETN_PRIVATE_KEY;
// If not set, it uses our block explorers default API keys.
const etherscanApiKey = process.env.ETHERSCAN_MAINNET_API_KEY;
const etherscanOptimisticApiKey = process.env.ETHERSCAN_OPTIMISTIC_API_KEY;
const basescanApiKey = process.env.BASESCAN_API_KEY;

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            // https://docs.soliditylang.org/en/latest/using-the-compiler.html#optimizer-options
            runs: 200,
          },
        },
      },
    ],
  },
  defaultNetwork: "localhost",
  ...(process.env.CI !== "true" && {
    namedAccounts: {
      deployer: {
        // By default, it will take the first Hardhat account as the deployer
        default: 0,
      },
    },
  }),
  networks: {
    // View the networks that are pre-configured.
    // If the network you are looking for is not here you can add new network settings
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${providerApiKey}`,
        enabled: process.env.MAINNET_FORKING_ENABLED === "true",
      },
    },
    ...(deployerPrivateKey && {
      mainnet: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${providerApiKey}`,
        accounts: [deployerPrivateKey],
      },
      sepolia: {
        url: `https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`,
        accounts: [deployerPrivateKey],
      },
      arbitrum: {
        url: `https://arb-mainnet.g.alchemy.com/v2/${providerApiKey}`,
        accounts: [deployerPrivateKey],
      },
      arbitrumSepolia: {
        url: `https://arb-sepolia.g.alchemy.com/v2/${providerApiKey}`,
        accounts: [deployerPrivateKey],
      },
      optimism: {
        url: `https://opt-mainnet.g.alchemy.com/v2/${providerApiKey}`,
        accounts: [deployerPrivateKey],
      },
      optimismSepolia: {
        url: `https://opt-sepolia.g.alchemy.com/v2/${providerApiKey}`,
        accounts: [deployerPrivateKey],
      },
      polygon: {
        url: `https://polygon-mainnet.g.alchemy.com/v2/${providerApiKey}`,
        accounts: [deployerPrivateKey],
      },
      polygonAmoy: {
        url: `https://polygon-amoy.g.alchemy.com/v2/${providerApiKey}`,
        accounts: [deployerPrivateKey],
      },
      polygonZkEvm: {
        url: `https://polygonzkevm-mainnet.g.alchemy.com/v2/${providerApiKey}`,
        accounts: [deployerPrivateKey],
      },
      polygonZkEvmCardona: {
        url: `https://polygonzkevm-cardona.g.alchemy.com/v2/${providerApiKey}`,
        accounts: [deployerPrivateKey],
      },
      gnosis: {
        url: "https://rpc.gnosischain.com",
        accounts: [deployerPrivateKey],
      },
      chiado: {
        url: "https://rpc.chiadochain.net",
        accounts: [deployerPrivateKey],
      },
      base: {
        url: "https://mainnet.base.org",
        accounts: [deployerPrivateKey],
      },
      baseSepolia: {
        url: "https://sepolia.base.org",
        accounts: [deployerPrivateKey],
      },
      scrollSepolia: {
        url: "https://sepolia-rpc.scroll.io",
        accounts: [deployerPrivateKey],
      },
      scroll: {
        url: "https://rpc.scroll.io",
        accounts: [deployerPrivateKey],
      },
      celo: {
        url: "https://forno.celo.org",
        accounts: [deployerPrivateKey],
      },
      celoAlfajores: {
        url: "https://alfajores-forno.celo-testnet.org",
        accounts: [deployerPrivateKey],
      },
    }),
    ...(somniaPrivateKey && {
      somnia: {
        url: "https://dream-rpc.somnia.network/",
        accounts: [somniaPrivateKey],
        chainId: 50312,
      },
    }),
    ...(etnPrivateKey && {
      etn: {
        url: "https://rpc.ankr.com/electroneum_testnet",
        accounts: [etnPrivateKey],
        chainId: 5201420,
      },
    }),
  },
  // Configuration for harhdat-verify plugin
  etherscan: {
    apiKey: `${etherscanApiKey}`,
    customChains: [
      {
        network: "somnia",
        chainId: 50312,
        urls: {
          apiURL: "https://shannon-explorer.somnia.network/api",
          browserURL: "https://shannon-explorer.somnia.network/",
        },
      },
      {
        network: "etn",
        chainId: 5201420,
        urls: {
          apiURL: "https://testnet-blockexplorer.electroneum.com/api",
          browserURL: "https://testnet-blockexplorer.electroneum.com/",
        },
      },
    ],
  },
  // Configuration for etherscan-verify from hardhat-deploy plugin
  ...(process.env.CI !== "true" && {
    verify: {
      etherscan: {
        apiKey: `${etherscanApiKey}`,
      },
    },
  }),
  sourcify: {
    enabled: false,
  },
};

// Extend the deploy task only if hardhat-deploy is available
if (process.env.CI !== "true") {
  task("deploy").setAction(async (args, hre, runSuper) => {
    // Run the original deploy task
    await runSuper(args);
    // Force run the generateTsAbis script
    await generateTsAbis(hre);
  });
}

export default config;
