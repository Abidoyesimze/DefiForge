import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  console.log("🚀 Starting deployment of FIXED DeFiUtils contract...");

  try {
    const { deployer } = await (hre as any).getNamedAccounts();
    const { deploy } = (hre as any).deployments;

    console.log("Deploying FIXED DeFiUtils with the account:", deployer);
    console.log("Network:", hre.network.name);
    console.log("Chain ID:", hre.network.config.chainId);
    console.log("Deployer address:", deployer);

    // Deploy the FIXED DeFiUtils contract
    console.log("📦 Deploying FIXED DeFiUtils...");
    const defiUtils = await deploy("DeFiUtils", {
      from: deployer,
      args: [],
      log: true,
      autoMine: true,
    });
    
    console.log("✅ FIXED DeFiUtils deployed to:", defiUtils.address);
    console.log("🔧 This contract has the following fixes:");
    console.log("   - Fixed calculateCompoundYield time scaling issue");
    console.log("   - Fixed calculateImpermanentLoss logic bug");
    console.log("   - All 5 functions should now work correctly!");
    
    // Verify the contract on block explorer
    console.log("🔍 Verifying contract on block explorer...");
    try {
      await hre.run("verify:verify", {
        address: defiUtils.address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error) {
      console.log("⚠️ Verification failed (contract might already be verified):", error);
    }

    console.log("🎉 FIXED DeFiUtils deployment completed!");
    console.log("📝 New contract address:", defiUtils.address);
    console.log("🔗 Update your frontend ABI/index.ts file with this new address!");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
};

func.id = "02_deploy_fixed_defiutils";
func.tags = ["DeFiUtils", "Fixed"];

export default func; 