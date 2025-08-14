import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying contracts with the account:", deployer);

  // Deploy ERC20Factory
  console.log("Deploying ERC20Factory...");
  const erc20Factory = await deploy("ERC20Factory", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log("ERC20Factory deployed to:", erc20Factory.address);

  // Deploy DeFiUtils
  console.log("Deploying DeFiUtils...");
  const defiUtils = await deploy("DeFiUtils", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log("DeFiUtils deployed to:", defiUtils.address);

  // Deploy ContractAnalyzer
  console.log("Deploying ContractAnalyzer...");
  const contractAnalyzer = await deploy("ContractAnalyzer", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log("ContractAnalyzer deployed to:", contractAnalyzer.address);

  // Deploy ContractTemplates
  console.log("Deploying ContractTemplates...");
  const contractTemplates = await deploy("ContractTemplates", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log("ContractTemplates deployed to:", contractTemplates.address);

  // Deploy MerkleValidator (if not already deployed)
  console.log("Deploying MerkleValidator...");
  const merkleValidator = await deploy("MerkleValidator", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log("MerkleValidator deployed to:", merkleValidator.address);

  // Deploy MerkleProof (if not already deployed)
  console.log("Deploying MerkleProof...");
  const merkleProof = await deploy("MerkleProof", {
    from: deployer,
    args: [deployer], // Set deployer as treasury
    log: true,
    autoMine: true,
  });
  console.log("MerkleProof deployed to:", merkleProof.address);

  console.log("All contracts deployed successfully!");
  console.log("=== Contract Addresses ===");
  console.log("ERC20Factory:", erc20Factory.address);
  console.log("DeFiUtils:", defiUtils.address);
  console.log("ContractAnalyzer:", contractAnalyzer.address);
  console.log("ContractTemplates:", contractTemplates.address);
  console.log("MerkleValidator:", merkleValidator.address);
  console.log("MerkleProof:", merkleProof.address);
  console.log("==========================");
};

export default func;
func.tags = ["ERC20Factory", "DeFiUtils", "ContractAnalyzer", "ContractTemplates", "MerkleValidator", "MerkleProof"]; 