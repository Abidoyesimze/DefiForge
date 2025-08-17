import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing Updated Impermanent Loss Function...");

  try {
    // Deploy the updated contract locally
    console.log("📦 Deploying updated DeFiUtils locally...");
    const DeFiUtils = await ethers.getContractFactory("DeFiUtils");
    const defiUtils = await DeFiUtils.deploy();
    await defiUtils.waitForDeployment();
    
    const address = await defiUtils.getAddress();
    console.log("✅ DeFiUtils deployed locally at:", address);

    // Test impermanent loss with different scenarios
    console.log("\n🔍 Testing Impermanent Loss Scenarios...");
    
    // Test 1: No price change (should be 0)
    console.log("\n📊 Test 1: No price change");
    const test1 = await testImpermanentLoss(
      defiUtils,
      ethers.parseEther("1000"), // 1000 token A
      ethers.parseEther("1000"), // 1000 token B
      ethers.parseEther("1.0"),  // Token A price: 1.0
      ethers.parseEther("1.0")   // Token B price: 1.0
    );
    console.log("Result:", test1.toString(), "wei");
    console.log("Expected: 0 (no impermanent loss)");

    // Test 2: Price change causing loss
    console.log("\n📊 Test 2: Price change causing loss");
    const test2 = await testImpermanentLoss(
      defiUtils,
      ethers.parseEther("1000"), // 1000 token A
      ethers.parseEther("1000"), // 1000 token B
      ethers.parseEther("0.8"),  // Token A price: 0.8 (20% drop)
      ethers.parseEther("1.0")   // Token B price: 1.0 (no change)
    );
    console.log("Result:", test2.toString(), "wei");
    console.log("Expected: Should show some impermanent loss (not 0)");

    // Test 3: Extreme price change
    console.log("\n📊 Test 3: Extreme price change");
    const test3 = await testImpermanentLoss(
      defiUtils,
      ethers.parseEther("1000"), // 1000 token A
      ethers.parseEther("1000"), // 1000 token B
      ethers.parseEther("0.5"),  // Token A price: 0.5 (50% drop)
      ethers.parseEther("1.0")   // Token B price: 1.0 (no change)
    );
    console.log("Result:", test3.toString(), "wei");
    console.log("Expected: Should show significant impermanent loss");

    // Test 4: Realistic DeFi scenario
    console.log("\n📊 Test 4: Realistic DeFi scenario");
    const test4 = await testImpermanentLoss(
      defiUtils,
      ethers.parseEther("1000"), // 1000 token A
      ethers.parseEther("1000"), // 1000 token B
      ethers.parseEther("1.2"),  // Token A price: 1.2 (20% increase)
      ethers.parseEther("0.9")   // Token B price: 0.9 (10% decrease)
    );
    console.log("Result:", test4.toString(), "wei");
    console.log("Expected: Should show impermanent loss due to price divergence");

    console.log("\n✅ Impermanent Loss tests completed!");

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