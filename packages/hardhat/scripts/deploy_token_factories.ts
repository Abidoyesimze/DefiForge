import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🚀 Deploying Token Factory Contracts to Somnia Testnet...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying contracts with account: ${deployer.address}`);
  console.log(`💰 Account balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} STT\n`);

  try {
    // Deploy ERC721Factory
    console.log("🏗️  Deploying ERC721Factory...");
    const ERC721Factory = await ethers.getContractFactory("ERC721Factory");
    const erc721Factory = await ERC721Factory.deploy();
    await erc721Factory.waitForDeployment();
    const erc721FactoryAddress = await erc721Factory.getAddress();
    
    console.log(`✅ ERC721Factory deployed to: ${erc721FactoryAddress}`);
    console.log(`🔗 Explorer: https://explorer.somnia.network/address/${erc721FactoryAddress}\n`);

    // Deploy ERC1155Factory
    console.log("🏗️  Deploying ERC1155Factory...");
    const ERC1155Factory = await ethers.getContractFactory("ERC1155Factory");
    const erc1155Factory = await ERC1155Factory.deploy();
    await erc1155Factory.waitForDeployment();
    const erc1155FactoryAddress = await erc1155Factory.getAddress();
    
    console.log(`✅ ERC1155Factory deployed to: ${erc1155FactoryAddress}`);
    console.log(`🔗 Explorer: https://explorer.somnia.network/address/${erc1155FactoryAddress}\n`);

    // Verify contracts
    console.log("🔍 Verifying contracts on Somnia Explorer...");
    try {
      await erc721Factory.deploymentTransaction()?.wait(5); // Wait 5 blocks
      console.log("✅ ERC721Factory verification ready");
    } catch (error) {
      console.log("⚠️  ERC721Factory verification failed:", error);
    }

    try {
      await erc1155Factory.deploymentTransaction()?.wait(5); // Wait 5 blocks
      console.log("✅ ERC1155Factory verification ready");
    } catch (error) {
      console.log("⚠️  ERC1155Factory verification failed:", error);
    }

    // Summary
    console.log("\n🎉 Deployment Summary:");
    console.log("========================");
    console.log(`ERC721Factory:  ${erc721FactoryAddress}`);
    console.log(`ERC1155Factory: ${erc1155FactoryAddress}`);
    console.log("\n📋 Next Steps:");
    console.log("1. Update frontend ABI files");
    console.log("2. Update contract addresses in frontend");
    console.log("3. Test token creation functionality");
    console.log("4. Update documentation");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 