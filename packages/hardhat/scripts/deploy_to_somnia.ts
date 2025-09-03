import { ethers, run } from "hardhat";

async function main() {
  console.log("🚀 Deploying DefiForge Contracts to Somnia Testnet...\n");

  const [deployer] = await ethers.getSigners();
  console.log(`📱 Deploying contracts with account: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} SOM\n`);

  if (balance < ethers.parseEther("0.1")) {
    console.log("⚠️  WARNING: Low SOM balance. You might need more for gas fees.");
  }

  try {
    // Deploy ERC20Factory
    console.log("🔨 Deploying ERC20Factory...");
    const ERC20Factory = await ethers.getContractFactory("ERC20Factory");
    const erc20Factory = await ERC20Factory.deploy();
    await erc20Factory.waitForDeployment();
    const erc20FactoryAddress = await erc20Factory.getAddress();
    console.log(`✅ ERC20Factory deployed to: ${erc20FactoryAddress}`);
    console.log(`🔗 Explorer: https://shannon-explorer.somnia.network/address/${erc20FactoryAddress}\n`);

    // Deploy ERC721Factory
    console.log("🔨 Deploying ERC721Factory...");
    const ERC721Factory = await ethers.getContractFactory("ERC721Factory");
    const erc721Factory = await ERC721Factory.deploy();
    await erc721Factory.waitForDeployment();
    const erc721FactoryAddress = await erc721Factory.getAddress();
    console.log(`✅ ERC721Factory deployed to: ${erc721FactoryAddress}`);
    console.log(`🔗 Explorer: https://shannon-explorer.somnia.network/address/${erc721FactoryAddress}\n`);

    // Deploy ERC1155Factory
    console.log("🔨 Deploying ERC1155Factory...");
    const ERC1155Factory = await ethers.getContractFactory("ERC1155Factory");
    const erc1155Factory = await ERC1155Factory.deploy();
    await erc1155Factory.waitForDeployment();
    const erc1155FactoryAddress = await erc1155Factory.getAddress();
    console.log(`✅ ERC1155Factory deployed to: ${erc1155FactoryAddress}`);
    console.log(`🔗 Explorer: https://shannon-explorer.somnia.network/address/${erc1155FactoryAddress}\n`);

    // Deploy DeFiUtils
    console.log("🔨 Deploying DeFiUtils...");
    const DeFiUtils = await ethers.getContractFactory("DeFiUtils");
    const defiUtils = await DeFiUtils.deploy();
    await defiUtils.waitForDeployment();
    const defiUtilsAddress = await defiUtils.getAddress();
    console.log(`✅ DeFiUtils deployed to: ${defiUtilsAddress}`);
    console.log(`🔗 Explorer: https://shannon-explorer.somnia.network/address/${defiUtilsAddress}\n`);

    // Deploy ContractAnalyzer
    console.log("🔨 Deploying ContractAnalyzer...");
    const ContractAnalyzer = await ethers.getContractFactory("ContractAnalyzer");
    const contractAnalyzer = await ContractAnalyzer.deploy();
    await contractAnalyzer.waitForDeployment();
    const contractAnalyzerAddress = await contractAnalyzer.getAddress();
    console.log(`✅ ContractAnalyzer deployed to: ${contractAnalyzerAddress}`);
    console.log(`🔗 Explorer: https://shannon-explorer.somnia.network/address/${contractAnalyzerAddress}\n`);

    // Deploy ContractTemplates (Updated with best practices)
    console.log("🔨 Deploying ContractTemplates (Updated with Multi-Sig Best Practices)...");
    const ContractTemplates = await ethers.getContractFactory("ContractTemplates");
    const contractTemplates = await ContractTemplates.deploy();
    await contractTemplates.waitForDeployment();
    const contractTemplatesAddress = await contractTemplates.getAddress();
    console.log(`✅ ContractTemplates deployed to: ${contractTemplatesAddress}`);
    console.log(`🔗 Explorer: https://shannon-explorer.somnia.network/address/${contractTemplatesAddress}\n`);

    // Deploy MerkleProof
    console.log("🔨 Deploying MerkleProof...");
    const MerkleProof = await ethers.getContractFactory("MerkleProof");
    const merkleProof = await MerkleProof.deploy();
    await merkleProof.waitForDeployment();
    const merkleProofAddress = await merkleProof.getAddress();
    console.log(`✅ MerkleProof deployed to: ${merkleProofAddress}`);
    console.log(`🔗 Explorer: https://shannon-explorer.somnia.network/address/${merkleProofAddress}\n`);

    // Deploy MerkleProofValidator
    console.log("🔨 Deploying MerkleProofValidator...");
    const MerkleProofValidator = await ethers.getContractFactory("MerkleProofValidator");
    const merkleProofValidator = await MerkleProofValidator.deploy();
    await merkleProofValidator.waitForDeployment();
    const merkleProofValidatorAddress = await merkleProofValidator.getAddress();
    console.log(`✅ MerkleProofValidator deployed to: ${merkleProofValidatorAddress}`);
    console.log(`🔗 Explorer: https://shannon-explorer.somnia.network/address/${merkleProofValidatorAddress}\n`);

    // Summary
    console.log("🎉 All contracts deployed successfully to Somnia Testnet!");
    console.log("\n📋 Deployment Summary:");
    console.log(`ERC20Factory: ${erc20FactoryAddress}`);
    console.log(`ERC721Factory: ${erc721FactoryAddress}`);
    console.log(`ERC1155Factory: ${erc1155FactoryAddress}`);
    console.log(`DeFiUtils: ${defiUtilsAddress}`);
    console.log(`ContractAnalyzer: ${contractAnalyzerAddress}`);
    console.log(`ContractTemplates: ${contractTemplatesAddress}`);
    console.log(`MerkleProof: ${merkleProofAddress}`);
    console.log(`MerkleProofValidator: ${merkleProofValidatorAddress}`);

    // Save deployment info
    const deploymentInfo = {
      network: "Somnia Testnet",
      chainId: 50312,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: {
        ERC20Factory: erc20FactoryAddress,
        ERC721Factory: erc721FactoryAddress,
        ERC1155Factory: erc1155FactoryAddress,
        DeFiUtils: defiUtilsAddress,
        ContractAnalyzer: contractAnalyzerAddress,
        ContractTemplates: contractTemplatesAddress,
        MerkleProof: merkleProofAddress,
        MerkleProofValidator: merkleProofValidatorAddress,
      },
    };

    // Write to file
    const fs = require("fs");
    const path = require("path");
    const deploymentPath = path.join(__dirname, "../deployments/somnia-testnet.json");
    
    // Ensure directory exists
    const dir = path.dirname(deploymentPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);

    // Attempt verification
    console.log("\n🔍 Verifying contracts on Somnia Explorer...");
    try {
      await run("verify:verify", {
        address: erc20FactoryAddress,
        constructorArguments: [],
      });
      console.log("✅ ERC20Factory verified");
    } catch (error: any) {
      console.log("❌ ERC20Factory verification failed:", error.message);
    }

    try {
      await run("verify:verify", {
        address: erc721FactoryAddress,
        constructorArguments: [],
      });
      console.log("✅ ERC721Factory verified");
    } catch (error: any) {
      console.log("❌ ERC721Factory verification failed:", error.message);
    }

    try {
      await run("verify:verify", {
        address: erc1155FactoryAddress,
        constructorArguments: [],
      });
      console.log("✅ ERC1155Factory verified");
    } catch (error: any) {
      console.log("❌ ERC1155Factory verification failed:", error.message);
    }

    try {
      await run("verify:verify", {
        address: defiUtilsAddress,
        constructorArguments: [],
      });
      console.log("✅ DeFiUtils verified");
    } catch (error: any) {
      console.log("❌ DeFiUtils verification failed:", error.message);
    }

    try {
      await run("verify:verify", {
        address: contractAnalyzerAddress,
        constructorArguments: [],
      });
      console.log("✅ ContractAnalyzer verified");
    } catch (error: any) {
      console.log("❌ ContractAnalyzer verification failed:", error.message);
    }

    try {
      await run("verify:verify", {
        address: contractTemplatesAddress,
        constructorArguments: [],
      });
      console.log("✅ ContractTemplates verified");
    } catch (error: any) {
      console.log("❌ ContractTemplates verification failed:", error.message);
    }

    try {
      await run("verify:verify", {
        address: merkleProofAddress,
        constructorArguments: [],
      });
      console.log("✅ MerkleProof verified");
    } catch (error: any) {
      console.log("❌ MerkleProof verification failed:", error.message);
    }

    try {
      await run("verify:verify", {
        address: merkleProofValidatorAddress,
        constructorArguments: [],
      });
      console.log("✅ MerkleProofValidator verified");
    } catch (error: any) {
      console.log("❌ MerkleProofValidator verification failed:", error.message);
    }

    console.log("\n🎯 Deployment to Somnia Testnet Complete!");
    console.log("Next steps:");
    console.log("1. Update the frontend ABI files with new addresses");
    console.log("2. Test the contracts on Somnia testnet");
    console.log("3. Update documentation with Somnia addresses");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
