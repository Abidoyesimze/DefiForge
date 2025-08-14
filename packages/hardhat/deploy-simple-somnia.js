const { ethers, run } = require("hardhat");

async function main() {
  console.log("🚀 Starting simple deployment to Somnia...");
  
  try {
    const [deployer] = await ethers.getSigners();
    const address = await deployer.getAddress();
    
    console.log("Network:", (await ethers.provider.getNetwork()).name);
    console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
    console.log("Deployer address:", address);
    console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(address)), "STT");
    
    // Deploy ERC20Factory
    console.log("📦 Deploying ERC20Factory...");
    const ERC20Factory = await ethers.getContractFactory("ERC20Factory");
    const erc20Factory = await ERC20Factory.deploy();
    await erc20Factory.waitForDeployment();
    const erc20FactoryAddress = await erc20Factory.getAddress();
    console.log("✅ ERC20Factory deployed to:", erc20FactoryAddress);
    
    // Deploy DeFiUtils
    console.log("📦 Deploying DeFiUtils...");
    const DeFiUtils = await ethers.getContractFactory("DeFiUtils");
    const defiUtils = await DeFiUtils.deploy();
    await defiUtils.waitForDeployment();
    const defiUtilsAddress = await defiUtils.getAddress();
    console.log("✅ DeFiUtils deployed to:", defiUtilsAddress);
    
    // Deploy ContractAnalyzer
    console.log("📦 Deploying ContractAnalyzer...");
    const ContractAnalyzer = await ethers.getContractFactory("ContractAnalyzer");
    const contractAnalyzer = await ContractAnalyzer.deploy();
    await contractAnalyzer.waitForDeployment();
    const contractAnalyzerAddress = await contractAnalyzer.getAddress();
    console.log("✅ ContractAnalyzer deployed to:", contractAnalyzerAddress);
    
    // Deploy ContractTemplates
    console.log("📦 Deploying ContractTemplates...");
    const ContractTemplates = await ethers.getContractFactory("ContractTemplates");
    const contractTemplates = await ContractTemplates.deploy();
    await contractTemplates.waitForDeployment();
    const contractTemplatesAddress = await contractTemplates.getAddress();
    console.log("✅ ContractTemplates deployed to:", contractTemplatesAddress);
    
    // Deploy MerkleProofValidator
    console.log("📦 Deploying MerkleProofValidator...");
    const MerkleProofValidator = await ethers.getContractFactory("MerkleProofValidator");
    const merkleProofValidator = await MerkleProofValidator.deploy();
    await merkleProofValidator.waitForDeployment();
    const merkleProofValidatorAddress = await merkleProofValidator.getAddress();
    console.log("✅ MerkleProofValidator deployed to:", merkleProofValidatorAddress);
    
    // Deploy MerkleProof
    console.log("📦 Deploying MerkleProof...");
    const MerkleProof = await ethers.getContractFactory("MerkleProof");
    const merkleProof = await MerkleProof.deploy(address); // Set deployer as treasury
    await merkleProof.waitForDeployment();
    const merkleProofAddress = await merkleProof.getAddress();
    console.log("✅ MerkleProof deployed to:", merkleProofAddress);
    
    console.log("🎉 All contracts deployed successfully!");
    console.log("=== Contract Addresses ===");
    console.log("ERC20Factory:", erc20FactoryAddress);
    console.log("DeFiUtils:", defiUtilsAddress);
    console.log("ContractAnalyzer:", contractAnalyzerAddress);
    console.log("ContractTemplates:", contractTemplatesAddress);
    console.log("MerkleProofValidator:", merkleProofValidatorAddress);
    console.log("MerkleProof:", merkleProofAddress);
    console.log("==========================");
    
    // Wait for confirmations before verification
    console.log("⏳ Waiting for confirmations before verification...");
    await new Promise(resolve => setTimeout(resolve, 15000)); // Wait 15 seconds
    
    try {
      console.log("🔎 Verifying contracts on block explorer...");
      
      // Verify ERC20Factory
      await run("verify:verify", {
        address: erc20FactoryAddress,
        constructorArguments: [],
      });
      console.log("✅ ERC20Factory verified");
      
      // Verify DeFiUtils
      await run("verify:verify", {
        address: defiUtilsAddress,
        constructorArguments: [],
      });
      console.log("✅ DeFiUtils verified");
      
      // Verify ContractAnalyzer
      await run("verify:verify", {
        address: contractAnalyzerAddress,
        constructorArguments: [],
      });
      console.log("✅ ContractAnalyzer verified");
      
      // Verify ContractTemplates
      await run("verify:verify", {
        address: contractTemplatesAddress,
        constructorArguments: [],
      });
      console.log("✅ ContractTemplates verified");
      
      // Verify MerkleProofValidator
      await run("verify:verify", {
        address: merkleProofValidatorAddress,
        constructorArguments: [],
      });
      console.log("✅ MerkleProofValidator verified");
      
      // Verify MerkleProof
      await run("verify:verify", {
        address: merkleProofAddress,
        constructorArguments: [address],
      });
      console.log("✅ MerkleProof verified");
      
      console.log("🎉 All contracts verified successfully!");
    } catch (error) {
      console.log("⚠️ Verification failed:", error.message);
      console.log("You can verify manually using the addresses above");
    }
    
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