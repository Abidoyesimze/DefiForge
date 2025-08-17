import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Getting deployment information...");

  try {
    // Get the signer
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);

    // Get the network info
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId);

    // Get the balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance:", ethers.formatEther(balance), "STT");

    // Try to get the latest deployment by looking at recent transactions
    console.log("\n🔍 Checking recent transactions...");
    
    // Get the latest block
    const latestBlock = await ethers.provider.getBlockNumber();
    console.log("Latest block:", latestBlock);

    // Get the latest few blocks to see if our deployment happened
    for (let i = 0; i < 5; i++) {
      const blockNumber = latestBlock - i;
      try {
        const block = await ethers.provider.getBlock(blockNumber);
        if (block && block.transactions.length > 0) {
          console.log(`Block ${blockNumber}: ${block.transactions.length} transactions`);
          
          // Check the first transaction in this block
          const tx = await ethers.provider.getTransaction(block.transactions[0]);
          if (tx && tx.from === deployer.address) {
            console.log(`Found transaction from deployer: ${tx.hash}`);
            
            // Get the receipt
            const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
            if (receipt && receipt.contractAddress) {
              console.log(`Contract deployed at: ${receipt.contractAddress}`);
              console.log(`Gas used: ${receipt.gasUsed.toString()}`);
              return;
            }
          }
        }
      } catch (error) {
        console.log(`Error checking block ${blockNumber}:`, error);
      }
    }

    console.log("No recent deployment found. The contract might have been deployed earlier.");
    console.log("Check your wallet's transaction history or the block explorer.");

  } catch (error) {
    console.error("Error getting deployment info:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 