import { ethers, run } from "hardhat";
import { MerkleProofX } from "../typechain-types";

async function main(): Promise<void> {
  console.log("Deploying MerkleProofX contract...");

  const [deployer] = await ethers.getSigners();
  const treasuryAddress = process.env.TREASURY_ADDRESS || deployer.address;

  console.log("Deploying with treasury address:", treasuryAddress);

  const MerkleProofX = await ethers.getContractFactory("MerkleProofX");
  const merkleProofX = (await MerkleProofX.deploy(treasuryAddress)) as MerkleProofX;

  await merkleProofX.waitForDeployment();

  const contractAddress = await merkleProofX.getAddress();

  console.log("✅ MerkleProofX deployed to:", contractAddress);
  console.log("Treasury address set to:", treasuryAddress);
  console.log("Platform fee set to:", await merkleProofX.getPlatformFee());

  console.log("\n⏳ Waiting for a few confirmations before verification...");
  await merkleProofX.deploymentTransaction()?.wait(3); // Wait for 3 confirmations (important!)

  console.log("🔎 Verifying on Etherscan...");
  await run("verify:verify", {
    address: contractAddress,
    constructorArguments: [treasuryAddress],
  });

  console.log("✅ Verification complete!");
}

// Execute the deployment script
main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error("❌ Deployment or verification failed:", error);
    process.exit(1);
  });
