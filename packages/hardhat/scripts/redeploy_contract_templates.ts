import { ethers, run } from "hardhat";

async function main() {
  console.log("🚀 Redeploying ContractTemplates with Multi-Sig Best Practices...\n");

  const [deployer] = await ethers.getSigners();
  console.log(`📱 Deploying with account: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH\n`);

  if (balance < ethers.parseEther("0.01")) {
    console.log("⚠️  WARNING: Low balance. You might need more for gas fees.");
  }

  try {
    // Deploy ContractTemplates (Updated with best practices)
    console.log("🔨 Deploying ContractTemplates (Updated with Multi-Sig Best Practices)...");
    console.log("📋 New Features:");
    console.log("  - Enforces minimum 2 owners for multi-sig wallets");
    console.log("  - Requires signatures < total owners for true multi-sig functionality");
    console.log("  - Added helper functions for multi-sig configuration");
    console.log("  - Enhanced documentation and best practices\n");
    
    const ContractTemplates = await ethers.getContractFactory("ContractTemplates");
    const contractTemplates = await ContractTemplates.deploy();
    await contractTemplates.waitForDeployment();
    const contractTemplatesAddress = await contractTemplates.getAddress();
    
    console.log(`✅ ContractTemplates deployed to: ${contractTemplatesAddress}`);
    
    // Get network info
    const network = await ethers.provider.getNetwork();
    const chainId = network.chainId.toString();
    
    if (chainId === "5201420") {
      console.log(`🔗 ETN Explorer: https://testnet-explorer.electroneum.com/address/${contractTemplatesAddress}`);
    } else if (chainId === "50312") {
      console.log(`🔗 Somnia Explorer: https://shannon-explorer.somnia.network/address/${contractTemplatesAddress}`);
    } else {
      console.log(`🔗 Network: ${network.name} (Chain ID: ${chainId})`);
    }

    // Test the new multi-sig validation
    console.log("\n🧪 Testing Multi-Sig Validation...");
    
    // Test 1: Try to deploy with 1 owner (should fail)
    console.log("Test 1: Attempting to deploy multi-sig with 1 owner (should fail)...");
    try {
      const testOwners = [deployer.address];
      const testRequiredSigs = 1;
      await contractTemplates.deployMultiSigWallet(testOwners, testRequiredSigs);
      console.log("❌ ERROR: Contract should have rejected 1-owner multi-sig!");
    } catch (error: any) {
      if (error.message.includes("Multi-sig wallet requires at least 2 owners")) {
        console.log("✅ PASS: Contract correctly rejected 1-owner multi-sig");
      } else {
        console.log("❌ UNEXPECTED ERROR:", error.message);
      }
    }

    // Test 2: Try to deploy with 2 owners, 2 signatures (should fail)
    console.log("Test 2: Attempting to deploy multi-sig with 2 owners, 2 signatures (should fail)...");
    try {
      const testOwners = [deployer.address, "0x1234567890123456789012345678901234567890"];
      const testRequiredSigs = 2;
      await contractTemplates.deployMultiSigWallet(testOwners, testRequiredSigs);
      console.log("❌ ERROR: Contract should have rejected 2-of-2 multi-sig!");
    } catch (error: any) {
      if (error.message.includes("Required signatures must be less than total owners")) {
        console.log("✅ PASS: Contract correctly rejected 2-of-2 multi-sig");
      } else {
        console.log("❌ UNEXPECTED ERROR:", error.message);
      }
    }

    // Test 3: Deploy valid multi-sig (2 owners, 1 signature)
    console.log("Test 3: Deploying valid multi-sig (2 owners, 1 signature)...");
    try {
      const testOwners = [deployer.address, "0x1234567890123456789012345678901234567890"];
      const testRequiredSigs = 1;
      const tx = await contractTemplates.deployMultiSigWallet(testOwners, testRequiredSigs);
      const receipt = await tx.wait();
      console.log("✅ PASS: Successfully deployed valid 1-of-2 multi-sig");
      console.log(`   Transaction hash: ${tx.hash}`);
    } catch (error: any) {
      console.log("❌ ERROR deploying valid multi-sig:", error.message);
    }

    // Save deployment info
    const deploymentInfo = {
      network: network.name,
      chainId: chainId,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contract: {
        ContractTemplates: contractTemplatesAddress,
      },
      features: {
        multiSigBestPractices: true,
        minimumOwners: 2,
        signatureValidation: true,
        helperFunctions: true,
      },
    };

    // Write to file
    const fs = require("fs");
    const path = require("path");
    const deploymentPath = path.join(__dirname, `../deployments/contract-templates-${chainId}.json`);
    
    // Ensure directory exists
    const dir = path.dirname(deploymentPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);

    // Attempt verification
    console.log("\n🔍 Verifying contract...");
    try {
      await run("verify:verify", {
        address: contractTemplatesAddress,
        constructorArguments: [],
      });
      console.log("✅ ContractTemplates verified successfully");
    } catch (error: any) {
      console.log("❌ Verification failed:", error.message);
    }

    console.log("\n🎯 ContractTemplates Redeployment Complete!");
    console.log("\n📋 Next Steps:");
    console.log("1. Update the frontend ABI files with the new address");
    console.log("2. Test the multi-sig deployment from the frontend");
    console.log("3. Verify the new validation works correctly");
    
    console.log("\n🔧 Frontend Integration:");
    console.log(`Update packages/nextjs/ABI/index.ts with:`);
    console.log(`ContractTemplates: "${contractTemplatesAddress}"`);

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
