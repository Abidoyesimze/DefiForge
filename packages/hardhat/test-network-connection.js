const { ethers } = require("hardhat");

async function main() {
  console.log("Testing Somnia network connection...");
  
  try {
    // Get the network info
    const network = await ethers.provider.getNetwork();
    console.log("Network name:", network.name);
    console.log("Chain ID:", network.chainId);
    
    // Get the signer
    const [deployer] = await ethers.getSigners();
    const address = await deployer.getAddress();
    console.log("Deployer address:", address);
    
    // Get balance
    const balance = await ethers.provider.getBalance(address);
    console.log("Balance:", ethers.formatEther(balance), "STT");
    
    // Test a simple RPC call
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log("Current block number:", blockNumber);
    
    console.log("✅ Network connection successful!");
    
  } catch (error) {
    console.error("❌ Network connection failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 