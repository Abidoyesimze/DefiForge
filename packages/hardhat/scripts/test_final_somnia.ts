import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Final Test: All Fixed DeFiUtils Functions on Somnia Testnet...");

  try {
    // Connect to the deployed contract on Somnia testnet
    const contractAddress = "0x875CbF85A375a573645a475Fe9daD9678FA24625";
    console.log("📋 Testing contract at:", contractAddress);

    const DeFiUtils = await ethers.getContractFactory("DeFiUtils");
    const defiUtils = DeFiUtils.attach(contractAddress) as any;
    
    console.log("✅ Connected to deployed DeFiUtils contract");

    // Test all functions
    console.log("\n🔍 Testing All Functions...");
    
    // Test 1: Simple Yield
    console.log("\n📊 Test 1: Simple Yield");
    try {
      const principal = ethers.parseEther("1000");
      const rate = ethers.parseEther("0.05");
      const time = BigInt(365 * 24 * 60 * 60);
      const result = await defiUtils.calculateSimpleYield(principal, rate, time);
      console.log("✅ Result:", ethers.formatEther(result), "ETH");
    } catch (error) {
      console.error("❌ Simple Yield failed:", error);
    }

    // Test 2: Compound Yield
    console.log("\n📊 Test 2: Compound Yield");
    try {
      const principal = ethers.parseEther("1000");
      const rate = ethers.parseEther("0.05");
      const time = BigInt(365 * 24 * 60 * 60);
      const frequency = 12;
      const result = await defiUtils.calculateCompoundYield(principal, rate, time, frequency);
      console.log("✅ Result:", ethers.formatEther(result), "ETH");
    } catch (error) {
      console.error("❌ Compound Yield failed:", error);
    }

    // Test 3: Impermanent Loss
    console.log("\n📊 Test 3: Impermanent Loss");
    try {
      const tokenAAmount = ethers.parseEther("1000");
      const tokenBAmount = ethers.parseEther("1000");
      const priceA = ethers.parseEther("0.8");
      const priceB = ethers.parseEther("1.0");
      const result = await defiUtils.calculateImpermanentLoss(tokenAAmount, tokenBAmount, priceA, priceB);
      console.log("✅ Result:", result.toString(), "wei");
    } catch (error) {
      console.error("❌ Impermanent Loss failed:", error);
    }

    // Test 4: Swap Fee
    console.log("\n📊 Test 4: Swap Fee");
    try {
      const amount = ethers.parseEther("1000");
      const feeRate = ethers.parseEther("0.003");
      const result = await defiUtils.calculateSwapFee(amount, feeRate);
      console.log("✅ Result:", ethers.formatEther(result), "ETH");
    } catch (error) {
      console.error("❌ Swap Fee failed:", error);
    }

    // Test 5: Liquidity
    console.log("\n📊 Test 5: Liquidity");
    try {
      const tokenAAmount = ethers.parseEther("1000");
      const tokenBAmount = ethers.parseEther("1000");
      const result = await defiUtils.calculateLiquidityTokens(tokenAAmount, tokenBAmount);
      console.log("✅ Result:", ethers.formatEther(result), "LP tokens");
    } catch (error) {
      console.error("❌ Liquidity failed:", error);
    }

    console.log("\n🎉 All tests completed on Somnia Testnet!");
    console.log("🔧 If all functions work, the DeFi Utils page is fully functional!");

  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 