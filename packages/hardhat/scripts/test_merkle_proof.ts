import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing MerkleProof Contract on Somnia Testnet...");

  try {
    // Connect to the deployed contract on Somnia testnet
    const contractAddress = "0x0f1d9F35bc1631D8C3eB6A2B35A2972bF5061E53";
    console.log("📋 Testing contract at:", contractAddress);

    const MerkleProof = await ethers.getContractFactory("MerkleProof");
    const merkleProof = MerkleProof.attach(contractAddress) as any;
    
    console.log("✅ Connected to deployed MerkleProof contract");

    // Test basic contract functions
    console.log("\n🔍 Testing Basic Functions...");
    
    // Test 1: Check if contract exists
    console.log("\n📊 Test 1: Contract Existence");
    try {
      const code = await ethers.provider.getCode(contractAddress);
      if (code !== "0x") {
        console.log("✅ Contract exists and has code");
      } else {
        console.log("❌ Contract address has no code");
      }
    } catch (error) {
      console.error("❌ Error checking contract code:", error);
    }

    // Test 2: Check owner
    console.log("\n📊 Test 2: Contract Owner");
    try {
      const owner = await merkleProof.owner();
      console.log("✅ Contract owner:", owner);
    } catch (error) {
      console.error("❌ Error getting owner:", error);
    }

    // Test 3: Check platform fee
    console.log("\n📊 Test 3: Platform Fee");
    try {
      const fee = await merkleProof.getPlatformFee();
      console.log("✅ Platform fee:", fee.toString(), "wei");
    } catch (error) {
      console.error("❌ Error getting platform fee:", error);
    }

    // Test 4: Check if a random address is newcomer
    console.log("\n📊 Test 4: Newcomer Check");
    try {
      const testAddress = "0x1234567890123456789012345678901234567890";
      const isNewcomer = await merkleProof.isUserNewcomer(testAddress);
      console.log("✅ Is newcomer (test address):", isNewcomer);
    } catch (error) {
      console.error("❌ Error checking newcomer status:", error);
    }

    console.log("\n🎉 MerkleProof contract tests completed!");

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