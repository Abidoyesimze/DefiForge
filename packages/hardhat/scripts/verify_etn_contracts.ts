import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

// Blockscout verification API endpoints
const BLOCKSCOUT_API_ENDPOINTS = {
  etn: "https://testnet-explorer.electroneum.com/api/v2/smart-contracts",
  // Add alternative endpoints if the main one doesn't work
  alternative: "https://explorer.electroneum.com/api/v2/smart-contracts"
};

// API Keys for verification
const API_KEYS = {
  etherscan: "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW",
  alchemy: "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF",
  basescan: "ZZZEIPMT1MNJ8526VV2Y744CA7TNZR64G6"
};

// Contract verification data
interface ContractVerificationData {
  address: string;
  name: string;
  constructorArguments: any[];
  licenseType: string;
  compilerVersion: string;
  optimizationEnabled: boolean;
  optimizationRuns: number;
  evmVersion: string;
}

async function main() {
  console.log("🔍 Verifying ETN Contracts using Blockscout API...\n");

  // Get the current network
  const network = await ethers.provider.getNetwork();
  console.log(`🌐 Connected to network: ${network.name} (Chain ID: ${network.chainId})`);

  if (network.chainId !== BigInt(5201420)) {
    console.log("❌ Not connected to ETN testnet. Please connect to ETN testnet first.");
    return;
  }

  // Contract verification data
  const contracts: ContractVerificationData[] = [
    {
      address: "0xdB34E8611333Fd6dd3a57C59F125ebA8878378Cd",
      name: "ERC20Factory",
      constructorArguments: [],
      licenseType: "mit",
      compilerVersion: "v0.8.20+commit.a1b79de6",
      optimizationEnabled: true,
      optimizationRuns: 200,
      evmVersion: "paris"
    },
    {
      address: "0xB818Da67ccb75651556Fd301BCE23c6d094EFD0b",
      name: "ERC721Factory",
      constructorArguments: [],
      licenseType: "mit",
      compilerVersion: "v0.8.20+commit.a1b79de6",
      optimizationEnabled: true,
      optimizationRuns: 200,
      evmVersion: "paris"
    },
    {
      address: "0x57999eC2a3a01D5212b1D4302991B57E98aA4CC5",
      name: "ERC1155Factory",
      constructorArguments: [],
      licenseType: "mit",
      compilerVersion: "v0.8.20+commit.a1b79de6",
      optimizationEnabled: true,
      optimizationRuns: 200,
      evmVersion: "paris"
    },
    {
      address: "0x2d03D266204c1c5c4B29A36c499CA15a72b1C2A0",
      name: "DeFiUtils",
      constructorArguments: [],
      licenseType: "mit",
      compilerVersion: "v0.8.20+commit.a1b79de6",
      optimizationEnabled: true,
      optimizationRuns: 200,
      evmVersion: "paris"
    },
    {
      address: "0x4A4EBc7bfb813069e5495fB36B53cc937A31b441",
      name: "ContractAnalyzer",
      constructorArguments: [],
      licenseType: "mit",
      compilerVersion: "v0.8.20+commit.a1b79de6",
      optimizationEnabled: true,
      optimizationRuns: 200,
      evmVersion: "paris"
    },
    {
      address: "0x9f853686c5162A8E210dc9D13a8114f095Fc17F3",
      name: "ContractTemplates",
      constructorArguments: [],
      licenseType: "mit",
      compilerVersion: "v0.8.20+commit.a1b79de6",
      optimizationEnabled: true,
      optimizationRuns: 200,
      evmVersion: "paris"
    },
    {
      address: "0xbF1B2ca2CC17Bd98679D584575d549c62B3214eb",
      name: "MerkleProofX",
      constructorArguments: [],
      licenseType: "mit",
      compilerVersion: "v0.8.20+commit.a1b79de6",
      optimizationEnabled: true,
      optimizationRuns: 200,
      evmVersion: "paris"
    },
    {
      address: "0x88deaBcDDdAD618aBd67eCBdf490f68646c088aD",
      name: "MerkleProofValidator",
      constructorArguments: [],
      licenseType: "mit",
      compilerVersion: "v0.8.20+commit.a1b79de6",
      optimizationEnabled: true,
      optimizationRuns: 200,
      evmVersion: "paris"
    }
  ];

  console.log("📋 Contracts to verify:");
  contracts.forEach(contract => {
    console.log(`  - ${contract.name}: ${contract.address}`);
  });

  console.log("\n🔍 Starting verification process...\n");

  for (const contract of contracts) {
    console.log(`\n🔨 Verifying ${contract.name}...`);
    
    try {
      // Try to get the contract source code from artifacts
      let artifactPath = path.join(__dirname, "../artifacts/contracts", `${contract.name}.sol`, `${contract.name}.json`);
      
      // Handle special cases for Merkle contracts
      if (contract.name === "MerkleProofX") {
        artifactPath = path.join(__dirname, "../artifacts/contracts/MerkleProof.sol/MerkleProofX.json");
      } else if (contract.name === "MerkleProofValidator") {
        artifactPath = path.join(__dirname, "../artifacts/contracts/MerkleValidator.sol/MerkleProofValidator.json");
      }
      
      if (!fs.existsSync(artifactPath)) {
        console.log(`  ❌ Artifact not found: ${artifactPath}`);
        continue;
      }

      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      
      // Prepare verification payload according to Blockscout API
      const verificationPayload = {
        compiler_version: contract.compilerVersion,
        license_type: contract.licenseType,
        source_code: artifact.source,
        is_optimization_enabled: contract.optimizationEnabled,
        optimization_runs: contract.optimizationRuns,
        contract_name: contract.name,
        constructor_args: contract.constructorArguments.length > 0 ? 
          ethers.AbiCoder.defaultAbiCoder().encode(
            artifact.abi.find((item: any) => item.type === 'constructor')?.inputs || [],
            contract.constructorArguments
          ).slice(2) : null, // Remove '0x' prefix
        evm_version: contract.evmVersion
      };

      console.log(`  📝 Verification payload prepared`);
      console.log(`  🔗 Contract: ${contract.address}`);
      console.log(`  📚 Compiler: ${contract.compilerVersion}`);
      console.log(`  📄 License: ${contract.licenseType}`);

      // Try to verify using Blockscout API
      await verifyContract(contract.address, verificationPayload);

    } catch (error) {
      console.log(`  ❌ Verification failed: ${error}`);
    }
  }

  console.log("\n🎯 Verification process completed!");
  console.log("\n📋 Manual Verification Steps:");
  console.log("1. Visit the ETN testnet explorer");
  console.log("2. Search for each contract address");
  console.log("3. Click 'Verify & Publish'");
  console.log("4. Upload the contract source code");
  console.log("5. Fill in compiler settings and constructor arguments");
}

async function verifyContract(address: string, payload: any) {
  console.log(`  🌐 Attempting verification via multiple methods...`);
  
  // Method 1: Try Blockscout API with API keys
  for (const [name, endpoint] of Object.entries(BLOCKSCOUT_API_ENDPOINTS)) {
    try {
      console.log(`  🔗 Trying ${name} endpoint: ${endpoint}`);
      
      // Try with different API key headers
      const headers = {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEYS.etherscan,
        'Authorization': `Bearer ${API_KEYS.etherscan}`,
        'api-key': API_KEYS.etherscan
      };

      const response = await fetch(`${endpoint}/${address}/verification/via/flattened-code`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log(`  ✅ Verification successful via ${name} endpoint!`);
        return;
      } else {
        console.log(`  ❌ ${name} endpoint failed: ${response.status} ${response.statusText}`);
        
        // Try to get more details about the error
        try {
          const errorText = await response.text();
          console.log(`  📝 Error details: ${errorText}`);
        } catch (e) {
          // Ignore error reading response
        }
      }
    } catch (error) {
      console.log(`  ❌ ${name} endpoint error: ${error}`);
    }
  }

  // Method 2: Try alternative verification endpoints
  console.log(`  🔄 Trying alternative verification methods...`);
  
  // Try Etherscan-style verification
  try {
    const etherscanUrl = `https://api.etherscan.io/api?module=contract&action=verifysourcecode&address=${address}&apikey=${API_KEYS.etherscan}`;
    console.log(`  🔗 Trying Etherscan-style verification...`);
    
    // This is just a test to see if the endpoint responds
    const response = await fetch(etherscanUrl);
    if (response.ok) {
      console.log(`  ℹ️  Etherscan endpoint responds (but won't work for ETN contracts)`);
    }
  } catch (error) {
    console.log(`  ❌ Etherscan test failed: ${error}`);
  }

  // Method 3: Try to find the correct ETN explorer endpoint
  console.log(`  🔍 Attempting to discover correct ETN explorer endpoint...`);
  
  const possibleEndpoints = [
    `https://testnet-explorer.electroneum.com/api/v2/smart-contracts/verification/config?apikey=${API_KEYS.etherscan}`,
    `https://explorer.electroneum.com/api/v2/smart-contracts/verification/config?apikey=${API_KEYS.etherscan}`,
    `https://blockscout.electroneum.com/api/v2/smart-contracts/verification/config?apikey=${API_KEYS.etherscan}`,
    `https://etn-explorer.blockscout.com/api/v2/smart-contracts/verification/config?apikey=${API_KEYS.etherscan}`
  ];

  for (const endpoint of possibleEndpoints) {
    try {
      console.log(`  🔗 Testing endpoint: ${endpoint}`);
      const response = await fetch(endpoint);
      if (response.ok) {
        console.log(`  ✅ Found working endpoint: ${endpoint}`);
        // Try verification with this endpoint
        const verifyUrl = endpoint.replace('/verification/config', `/${address}/verification/via/flattened-code`);
        const verifyResponse = await fetch(verifyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEYS.etherscan
          },
          body: JSON.stringify(payload)
        });
        
        if (verifyResponse.ok) {
          console.log(`  ✅ Verification successful via discovered endpoint!`);
          return;
        }
      }
    } catch (error) {
      console.log(`  ❌ Endpoint test failed: ${error}`);
    }
  }

  console.log(`  ⚠️  All verification methods failed. Manual verification required.`);
  console.log(`  💡 Try using the prepared verification payload manually when explorer is available.`);
}

// Helper function to check if explorer is accessible
async function checkExplorerAccess() {
  console.log("🔍 Checking explorer accessibility...\n");
  
  for (const [name, endpoint] of Object.entries(BLOCKSCOUT_API_ENDPOINTS)) {
    try {
      const baseUrl = endpoint.replace('/api/v2/smart-contracts', '');
      console.log(`  🔗 Testing ${name}: ${baseUrl}`);
      
      const response = await fetch(`${baseUrl}/api/v2/smart-contracts/verification/config`);
      if (response.ok) {
        console.log(`  ✅ ${name} explorer is accessible`);
      } else {
        console.log(`  ❌ ${name} explorer returned: ${response.status}`);
      }
    } catch (error) {
      console.log(`  ❌ ${name} explorer error: ${error}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 