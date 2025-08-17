import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing Fixed Impermanent Loss Function on Somnia Testnet...");

  try {
    // Connect to the deployed contract on Somnia testnet
    const contractAddress = "0x895c4d71A9aB24A1D0D5d68e91D0db7932fe8BE9";
    console.log("📋 Testing contract at:", contractAddress);

    // Get the contract instance
    const DeFiUtils = await ethers.getContractFactory("DeFiUtils");
    const defiUtils = DeFiUtils.attach(contractAddress);
    
    console.log("✅ Connected to deployed DeFiUtils contract");

    // Test cases for impermanent loss
    console.log("\n🔍 Testing Impermanent Loss Calculations...");
    
    // Test Case 1: Equal amounts, price change
    console.log("\n📊 Test Case 1: Equal amounts, price change");
    const test1 = await testImpermanentLoss(
      defiUtils,
      ethers.parseEther("1000"), // 1000 token A
      ethers.parseEther("1000"), // 1000 token B  
      ethers.parseEther("1.0"),  // Token A price: 1.0
      ethers.parseEther("1.5")   // Token B price: 1.5
    );
    console.log("Result:", test1.toString(), "wei");
    console.log("Expected: Should show some impermanent loss");

    // Test Case 2: Different amounts, price change
    console.log("\n📊 Test Case 2: Different amounts, price change");
    const test2 = await testImpermanentLoss(
      defiUtils,
      ethers.parseEther("2000"), // 2000 token A
      ethers.parseEther("1000"), // 1000 token B
      ethers.parseEther("2.0"),  // Token A price: 2.0
      ethers.parseEther("1.0")   // Token B price: 1.0
    );
    console.log("Result:", test2.toString(), "wei");
    console.log("Expected: Should show some impermanent loss");

    // Test Case 3: No price change (should be 0)
    console.log("\n📊 Test Case 3: No price change (should be 0)");
    const test3 = await testImpermanentLoss(
      defiUtils,
      ethers.parseEther("1000"), // 1000 token A
      ethers.parseEther("1000"), // 1000 token B
      ethers.parseEther("1.0"),  // Token A price: 1.0
      ethers.parseEther("1.0")   // Token B price: 1.0
    );
    console.log("Result:", test3.toString(), "wei");
    console.log("Expected: Should be 0 (no impermanent loss)");

    // Test Case 4: Extreme price change
    console.log("\n📊 Test Case 4: Extreme price change");
    const test4 = await testImpermanentLoss(
      defiUtils,
      ethers.parseEther("1000"), // 1000 token A
      ethers.parseEther("1000"), // 1000 token B
      ethers.parseEther("0.5"),  // Token A price: 0.5 (50% drop)
      ethers.parseEther("2.0")   // Token B price: 2.0 (100% increase)
    );
    console.log("Result:", test4.toString(), "wei");
    console.log("Expected: Should show significant impermanent loss");

    console.log("\n✅ All tests completed!");
    console.log("🔧 If all tests show reasonable values (not 0), the fix is working!");

  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

async function testImpermanentLoss(
  contract: any,
  tokenAAmount: bigint,
  tokenBAmount: bigint,
  priceA: bigint,
  priceB: bigint
): Promise<bigint> {
  try {
    const result = await contract.calculateImpermanentLoss(
      tokenAAmount,
      tokenBAmount,
      priceA,
      priceB
    );
    return result;
  } catch (error) {
    console.error("Error calling calculateImpermanentLoss:", error);
    return BigInt(0);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 