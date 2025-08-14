import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  console.log("🚀 Starting deployment process...");
  
  try {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;

    console.log("Deploying contracts with the account:", deployer);
    console.log("Network:", hre.network.name);
    console.log("Chain ID:", hre.network.config.chainId);
    console.log("Deployer address:", deployer);

    // Deploy ERC20Factory
    console.log("📦 Deploying ERC20Factory...");
    const erc20Factory = await deploy("ERC20Factory", {
      from: deployer,
      args: [],
      log: true,
      autoMine: true,
    });
    console.log("✅ ERC20Factory deployed to:", erc20Factory.address);

    // Deploy DeFiUtils
    console.log("📦 Deploying DeFiUtils...");
    const defiUtils = await deploy("DeFiUtils", {
      from: deployer,
      args: [],
      log: true,
      autoMine: true,
    });
    console.log("✅ DeFiUtils deployed to:", defiUtils.address);

    // Deploy ContractAnalyzer
    console.log("📦 Deploying ContractAnalyzer...");
    const contractAnalyzer = await deploy("ContractAnalyzer", {
      from: deployer,
      args: [],
      log: true,
      autoMine: true,
    });
    console.log("✅ ContractAnalyzer deployed to:", contractAnalyzer.address);

    // Deploy ContractTemplates
    console.log("📦 Deploying ContractTemplates...");
    const contractTemplates = await deploy("ContractTemplates", {
      from: deployer,
      args: [],
      log: true,
      autoMine: true,
    });
    console.log("✅ ContractTemplates deployed to:", contractTemplates.address);

    // Deploy MerkleProofValidator
    console.log("📦 Deploying MerkleProofValidator...");
    const merkleProofValidator = await deploy("MerkleProofValidator", {
      from: deployer,
      args: [],
      log: true,
      autoMine: true,
    });
    console.log("✅ MerkleProofValidator deployed to:", merkleProofValidator.address);

    // Deploy MerkleProof
    console.log("📦 Deploying MerkleProof...");
    const merkleProof = await deploy("MerkleProof", {
      from: deployer,
      args: [deployer], // Set deployer as treasury
      log: true,
      autoMine: true,
    });
    console.log("✅ MerkleProof deployed to:", merkleProof.address);

    console.log("🎉 All contracts deployed successfully!");
    console.log("=== Contract Addresses ===");
    console.log("ERC20Factory:", erc20Factory.address);
    console.log("DeFiUtils:", defiUtils.address);
    console.log("ContractAnalyzer:", contractAnalyzer.address);
    console.log("ContractTemplates:", contractTemplates.address);
    console.log("MerkleProofValidator:", merkleProofValidator.address);
    console.log("MerkleProof:", merkleProof.address);
    console.log("==========================");

    // Only attempt verification on supported networks (not localhost/hardhat)
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
      console.log("⏳ Waiting for a few confirmations before verification...");
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

      try {
        console.log("🔎 Verifying contracts on block explorer...");
        
        // Verify ERC20Factory
        await hre.run("verify:verify", {
          address: erc20Factory.address,
          constructorArguments: [],
        });
        console.log("✅ ERC20Factory verified");

        // Verify DeFiUtils
        await hre.run("verify:verify", {
          address: defiUtils.address,
          constructorArguments: [],
        });
        console.log("✅ DeFiUtils verified");

        // Verify ContractAnalyzer
        await hre.run("verify:verify", {
          address: contractAnalyzer.address,
          constructorArguments: [],
        });
        console.log("✅ ContractAnalyzer verified");

        // Verify ContractTemplates
        await hre.run("verify:verify", {
          address: contractTemplates.address,
          constructorArguments: [],
        });
        console.log("✅ ContractTemplates verified");

        // Verify MerkleProofValidator
        await hre.run("verify:verify", {
          address: merkleProofValidator.address,
          constructorArguments: [],
        });
        console.log("✅ MerkleProofValidator verified");

        // Verify MerkleProof
        await hre.run("verify:verify", {
          address: merkleProof.address,
          constructorArguments: [deployer],
        });
        console.log("✅ MerkleProof verified");

        console.log("🎉 All contracts verified successfully!");
      } catch (error) {
        console.log("⚠️ Verification failed:", error);
        console.log("You can verify manually using the addresses above");
      }
    } else {
      console.log("ℹ️ Skipping verification on local network");
    }
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
};

export default func;
func.tags = ["ERC20Factory", "DeFiUtils", "ContractAnalyzer", "ContractTemplates", "MerkleProofValidator", "MerkleProof"]; 