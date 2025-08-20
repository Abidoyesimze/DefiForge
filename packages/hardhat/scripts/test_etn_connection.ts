import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing ETN Testnet Connection...\n");

  try {
    // Get the current network
    const network = await ethers.provider.getNetwork();
    console.log(`🌐 Connected to network: ${network.name} (Chain ID: ${network.chainId})`);

    if (network.chainId !== BigInt(5201420)) {
      console.log("⚠️  Warning: Not connected to ETN testnet (Chain ID: 5201420)");
      console.log("   Current chain ID:", network.chainId);
    } else {
      console.log("✅ Connected to ETN testnet!");
    }

    // Get the latest block
    const latestBlock = await ethers.provider.getBlock("latest");
    console.log(`📦 Latest block: ${latestBlock?.number}`);
    console.log(`⏰ Block timestamp: ${latestBlock?.timestamp ? new Date(Number(latestBlock.timestamp) * 1000).toISOString() : 'Unknown'}`);

    // Get gas price
    const gasPrice = await ethers.provider.getFeeData();
    console.log(`⛽ Gas price: ${ethers.formatUnits(gasPrice.gasPrice || 0, "gwei")} gwei`);

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deployer address: ${deployer.address}`);

    // Get balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} ETN`);

    if (balance < ethers.parseEther("0.1")) {
      console.log("⚠️  Warning: Low balance. You might need more ETN for gas fees.");
    } else {
      console.log("✅ Sufficient balance for deployment.");
    }

    console.log("\n🎯 ETN Testnet connection test completed successfully!");
    console.log("You can now run: yarn deploy:etn");

  } catch (error) {
    console.error("❌ Connection test failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 