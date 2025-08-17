import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying DeFiUtils contract...");

  try {
    // Get the signer
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // Get the balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "STT");

    // Deploy the contract
    console.log("📦 Deploying DeFiUtils...");
    const DeFiUtils = await ethers.getContractFactory("DeFiUtils");
    const defiUtils = await DeFiUtils.deploy();
    
    // Wait for deployment
    await defiUtils.waitForDeployment();
    
    const address = await defiUtils.getAddress();
    console.log("✅ DeFiUtils deployed to:", address);
    
    // Get the network info
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId);
    
    console.log("\n🔧 This contract has the following fixes:");
    console.log("   - Fixed calculateCompoundYield time scaling issue");
    console.log("   - Fixed calculateImpermanentLoss logic bug");
    console.log("   - All 5 functions should now work correctly!");
    
    console.log("\n📝 Update your frontend ABI/index.ts file with this new address:");
    console.log(`export const DeFiUtilsContract = {`);
    console.log(`  abi: DeFiUtilsABI,`);
    console.log(`  address: "${address}"`);
    console.log(`}`);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 