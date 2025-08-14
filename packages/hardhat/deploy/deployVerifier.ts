// scripts/deploy-validator.ts
import { ethers, run } from "hardhat";
import { MerkleProofValidator } from "../typechain-types";

async function main(): Promise<void> {
  console.log("Deploying MerkleProofValidator contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy the contract
  const MerkleProofValidator = await ethers.getContractFactory("MerkleProofValidator");
  const validator = (await MerkleProofValidator.deploy()) as MerkleProofValidator;

  await validator.waitForDeployment();

  const contractAddress = await validator.getAddress();

  console.log("✅ MerkleProofValidator deployed to:", contractAddress);

  // Log some contract information
  console.log("Owner set to:", deployer.address);

  console.log("\n⏳ Waiting for a few confirmations before verification...");
  await validator.deploymentTransaction()?.wait(3); // Wait for 3 confirmations

  console.log("🔎 Verifying on Etherscan...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [], // Empty array since there are no constructor arguments
    });
    console.log("✅ Verification complete!");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract already verified!");
    } else {
      console.error("❌ Verification failed:", error);
    }
  }

  // Optional: Log additional information to help with frontend integration
  console.log("\n📝 Frontend Integration:");
  console.log(`Export const MERKLE_VALIDATOR_ADDRESS = "${contractAddress}";`);
}

// Execute the deployment script
main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error("❌ Deployment or verification failed:", error);
    process.exit(1);
  });
