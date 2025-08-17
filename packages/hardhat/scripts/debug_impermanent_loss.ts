import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Debugging Impermanent Loss Function...");

  try {
    // Connect to the deployed contract
    const contractAddress = "0x895c4d71A9aB24A1D0D5d68e91D0db7932fe8BE9";
    console.log("📋 Testing contract at:", contractAddress);

    const DeFiUtils = await ethers.getContractFactory("DeFiUtils");
    const defiUtils = DeFiUtils.attach(contractAddress);
    
    console.log("✅ Connected to deployed DeFiUtils contract");

    // Test with very simple values to debug
    console.log("\n🧪 Testing with simple values...");
    
    const tokenAAmount = ethers.parseEther("1000"); // 1000 token A
    const tokenBAmount = ethers.parseEther("1000"); // 1000 token B
    const priceA = ethers.parseEther("1.0");        // Token A price: 1.0
    const priceB = ethers.parseEther("1.0");        // Token B price: 1.0 (no change)

    console.log("Inputs:");
    console.log("- Token A Amount:", tokenAAmount.toString());
    console.log("- Token B Amount:", tokenBAmount.toString());
    console.log("- Price A:", priceA.toString());
    console.log("- Price B:", priceB.toString());

    // Try to call the function
    try {
      console.log("\n🔍 Calling calculateImpermanentLoss...");
      const result = await defiUtils.calculateImpermanentLoss(
        tokenAAmount,
        tokenBAmount,
        priceA,
        priceB
      );
      console.log("✅ Success! Result:", result.toString());
    } catch (error) {
      console.error("❌ Error calling calculateImpermanentLoss:", error);
      
      // Try to get more specific error info
      if (error.data) {
        console.log("Error data:", error.data);
      }
    }

  } catch (error) {
    console.error("❌ Debug failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 