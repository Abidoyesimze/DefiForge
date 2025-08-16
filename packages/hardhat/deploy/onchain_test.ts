// scripts/testERC20Factory.js
// Run with: npx hardhat run scripts/testERC20Factory.js --network somnia

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🧪 Testing ERC20Factory Contract On-Chain");
  console.log("==========================================");

  // Contract address from your frontend
  const FACTORY_ADDRESS = "0x4F6D41C9F94FdD64c8D82C4eb71a459075E5Ae57";
  
  // Load the ABI from the artifacts directory
  const artifactPath = path.join(__dirname, "../artifacts/contracts/ERC20Factory.sol/ERC20Factory.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const ERC20FactoryABI = artifact.abi;
  
  console.log("🔍 ABI loaded, functions found:", ERC20FactoryABI.filter((item: any) => item.type === "function").length);
  console.log("🔍 Available functions:", ERC20FactoryABI.filter((item: any) => item.type === "function").map((f: any) => f.name).join(", "));

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("🔑 Testing with address:", signer.address);
  
  // Get balance
  const balance = await ethers.provider.getBalance(signer.address);
  console.log("💰 STT Balance:", ethers.formatEther(balance), "STT");
  
  if (balance < ethers.parseEther("0.01")) {
    console.log("⚠️  WARNING: Low STT balance. You might need more for gas fees.");
  }

  // Connect to the deployed contract
  const factory = new ethers.Contract(FACTORY_ADDRESS, ERC20FactoryABI, signer);
  
  console.log("🔍 Contract object created");
  console.log("🔍 Contract methods:", Object.keys(factory));
  console.log("🔍 Has createToken method:", typeof factory.createToken);
  
  console.log("\n📊 Contract Information:");
  console.log("========================");
  
  let tokenCount: any;
  
  try {
    // Test basic reads first
    const owner = await factory.owner();
    console.log("👑 Contract Owner:", owner);
    console.log("🆔 Your Address: ", signer.address);
    console.log("🔐 Are you owner?", owner.toLowerCase() === signer.address.toLowerCase());
    
    tokenCount = await factory.getTokenCount();
    console.log("📈 Current Token Count:", tokenCount.toString());
    
    if (tokenCount > 0) {
      const allTokens = await factory.getAllTokens();
      console.log("🎯 Existing Tokens:", allTokens);
    }
    
  } catch (error: any) {
    console.error("❌ Error reading contract data:", (error as any).message);
    return;
  }

  console.log("\n🧪 Testing Token Creation:");
  console.log("===========================");

  // Test cases - start simple and get more complex
  const testCases = [
    {
      name: "TestToken1",
      symbol: "TEST1", 
      supply: 1,
      decimals: 0,
      description: "Minimal case: 1 token, 0 decimals"
    },
    {
      name: "TestToken2",
      symbol: "TEST2",
      supply: 100,
      decimals: 18,
      description: "Standard case: 100 tokens, 18 decimals"
    },
    {
      name: `Token${Date.now()}`,
      symbol: `T${Date.now().toString().slice(-4)}`,
      supply: 1000,
      decimals: 18,
      description: "Your original case: 1000 tokens, 18 decimals, unique name"
    },
    {
      name: "SIMZE",
      symbol: "SMZ",
      supply: 1000,
      decimals: 18,
      description: "Exact frontend case: SIMZE token"
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📝 Test ${i + 1}: ${testCase.description}`);
    console.log(`   Name: "${testCase.name}", Symbol: "${testCase.symbol}"`);
    console.log(`   Supply: ${testCase.supply}, Decimals: ${testCase.decimals}`);
    
    try {
      // First, estimate gas
      console.log("   ⛽ Estimating gas...");
      const gasEstimate = await factory.createToken.estimateGas(
        testCase.name,
        testCase.symbol,
        ethers.parseUnits(testCase.supply.toString(), 0),
        testCase.decimals
      );
      console.log(`   ✅ Gas estimate: ${gasEstimate.toString()}`);
      
      // If gas estimation succeeds, try the actual transaction
      console.log("   🚀 Creating token...");
      const tx = await factory.createToken(
        testCase.name,
        testCase.symbol,
        ethers.parseUnits(testCase.supply.toString(), 0),
        testCase.decimals,
        {
          gasLimit: gasEstimate * 120n / 100n // Add 20% buffer
        }
      );
      
      console.log(`   📋 Transaction hash: ${tx.hash}`);
      console.log("   ⏳ Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log(`   ✅ SUCCESS! Gas used: ${receipt.gasUsed.toString()}`);
      
      // Get the new token address from events
      if (receipt.events && receipt.events.length > 0) {
        const tokenCreatedEvent = receipt.events.find((e: any) => e.event === 'TokenCreated');
        if (tokenCreatedEvent) {
          console.log(`   🎯 New token address: ${tokenCreatedEvent.args.tokenAddress}`);
        }
      }
      
      // Update token count
      const newTokenCount = await factory.getTokenCount();
      console.log(`   📊 New token count: ${newTokenCount.toString()}`);
      
      // If first test succeeds, we know the contract works
      console.log(`\n🎉 SUCCESS! Test ${i + 1} passed. The contract is working correctly.`);
      console.log("The issue is likely in your frontend setup, not the contract.");
      break;
      
    } catch (error: any) {
      console.log(`   ❌ FAILED: ${error.message}`);
      
      // Try to extract more details
      if (error.reason) {
        console.log(`   📝 Reason: ${error.reason}`);
      }
      
      if (error.data) {
        console.log(`   📊 Error data: ${error.data}`);
        
        // Try to decode revert reason
        try {
          if (error.data.length > 10) {
            const reason = ethers.toUtf8String('0x' + error.data.slice(138));
            console.log(`   🔍 Decoded reason: "${reason}"`);
          }
        } catch (decodeError) {
          console.log("   ⚠️  Could not decode revert reason");
        }
      }
      
      if (error.code) {
        console.log(`   🔢 Error code: ${error.code}`);
      }
      
      // Continue to next test case
      continue;
    }
  }

  console.log("\n📋 Test Summary:");
  console.log("=================");
  
  const finalTokenCount = await factory.getTokenCount();
  console.log("Final token count:", finalTokenCount.toString());
  
  if (finalTokenCount > tokenCount) {
    console.log("🎉 At least one token was created successfully!");
    console.log("✅ The contract is working. The issue is in your frontend.");
    console.log("\n🔧 Frontend troubleshooting suggestions:");
    console.log("1. Check your wagmi/ethers.js configuration");
    console.log("2. Verify the ABI matches the deployed contract");
    console.log("3. Ensure you're connected to the correct network");
    console.log("4. Try refreshing your wallet connection");
  } else {
    console.log("❌ No tokens were created. There might be an issue with:");
    console.log("1. Contract deployment or verification");
    console.log("2. Network connectivity");  
    console.log("3. Access control restrictions");
    console.log("4. Contract state or pausability");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });