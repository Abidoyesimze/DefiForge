import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing ALL Fixed DeFiUtils Functions Locally...");

  try {
    // Deploy the contract locally for testing
    console.log("📦 Deploying DeFiUtils locally for testing...");
    const DeFiUtils = await ethers.getContractFactory("DeFiUtils");
    const defiUtils = await DeFiUtils.deploy();
    await defiUtils.waitForDeployment();
    
    const address = await defiUtils.getAddress();
    console.log("✅ DeFiUtils deployed locally at:", address);

    // Test 1: Simple Yield (should work)
    console.log("\n🔍 Test 1: Simple Yield Function");
    await testSimpleYield(defiUtils);

    // Test 2: Compound Yield (should work now)
    console.log("\n🔍 Test 2: Compound Yield Function");
    await testCompoundYield(defiUtils);

    // Test 3: Impermanent Loss (should work now)
    console.log("\n🔍 Test 3: Impermanent Loss Function");
    await testImpermanentLoss(defiUtils);

    // Test 4: Swap Fee (should work)
    console.log("\n🔍 Test 4: Swap Fee Function");
    await testSwapFee(defiUtils);

    // Test 5: Liquidity (should work)
    console.log("\n🔍 Test 5: Liquidity Function");
    await testLiquidity(defiUtils);

    console.log("\n🎉 All tests completed!");
    console.log("🔧 If all functions work without errors, the fixes are successful!");

  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

async function testSimpleYield(contract: any) {
  try {
    const principal = ethers.parseEther("1000"); // 1000 ETH
    const rate = ethers.parseEther("0.05");      // 5% (5e16)
    const time = BigInt(365 * 24 * 60 * 60);    // 1 year in seconds

    console.log("Inputs: Principal=1000 ETH, Rate=5%, Time=1 year");
    const result = await contract.calculateSimpleYield(principal, rate, time);
    console.log("✅ Result:", ethers.formatEther(result), "ETH");
    console.log("Expected: ~50 ETH (5% of 1000 ETH)");
  } catch (error) {
    console.error("❌ Simple Yield failed:", error);
  }
}

async function testCompoundYield(contract: any) {
  try {
    const principal = ethers.parseEther("1000"); // 1000 ETH
    const rate = ethers.parseEther("0.05");      // 5% (5e16)
    const time = BigInt(365 * 24 * 60 * 60);    // 1 year in seconds
    const frequency = 12;                         // Monthly compounding

    console.log("Inputs: Principal=1000 ETH, Rate=5%, Time=1 year, Monthly compounding");
    const result = await contract.calculateCompoundYield(principal, rate, time, frequency);
    console.log("✅ Result:", ethers.formatEther(result), "ETH");
    console.log("Expected: >50 ETH (compound interest should be higher than simple)");
  } catch (error) {
    console.error("❌ Compound Yield failed:", error);
  }
}

async function testImpermanentLoss(contract: any) {
  try {
    const tokenAAmount = ethers.parseEther("1000"); // 1000 token A
    const tokenBAmount = ethers.parseEther("1000"); // 1000 token B
    const priceA = ethers.parseEther("1.0");        // Token A price: 1.0
    const priceB = ethers.parseEther("1.5");        // Token B price: 1.5

    console.log("Inputs: 1000 A + 1000 B, Price A=1.0, Price B=1.5");
    const result = await contract.calculateImpermanentLoss(tokenAAmount, tokenBAmount, priceA, priceB);
    console.log("✅ Result:", result.toString(), "wei");
    console.log("Expected: Should show some impermanent loss (not 0)");
  } catch (error) {
    console.error("❌ Impermanent Loss failed:", error);
  }
}

async function testSwapFee(contract: any) {
  try {
    const amount = ethers.parseEther("1000");     // 1000 ETH
    const feeRate = ethers.parseEther("0.003");   // 0.3% (3e15)

    console.log("Inputs: Amount=1000 ETH, Fee Rate=0.3%");
    const result = await contract.calculateSwapFee(amount, feeRate);
    console.log("✅ Result:", ethers.formatEther(result), "ETH");
    console.log("Expected: 3 ETH (0.3% of 1000 ETH)");
  } catch (error) {
    console.error("❌ Swap Fee failed:", error);
  }
}

async function testLiquidity(contract: any) {
  try {
    const tokenAAmount = ethers.parseEther("1000"); // 1000 token A
    const tokenBAmount = ethers.parseEther("1000"); // 1000 token B

    console.log("Inputs: 1000 A + 1000 B");
    const result = await contract.calculateLiquidityTokens(tokenAAmount, tokenBAmount);
    console.log("✅ Result:", ethers.formatEther(result), "LP tokens");
    console.log("Expected: 1000 LP tokens (sqrt of 1000*1000)");
  } catch (error) {
    console.error("❌ Liquidity failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 