// Import all contract ABIs
import ContractAnalyzerABI from "./ContractAnalyzer.json";
import ContractTemplatesABI from "./ContractTemplates.json";
import DeFiUtilsABI from "./DeFiUtils.json";
import ERC20FactoryABI from "./ERC20Factory.json";
import MerkleProofABI from "./MerkleProof.json";
import MerkleProofValidatorABI from "./MerkleProofValidator.json";

// Export individual ABIs for backward compatibility
export {
  ContractAnalyzerABI,
  ContractTemplatesABI,
  DeFiUtilsABI,
  ERC20FactoryABI,
  MerkleProofABI,
  MerkleProofValidatorABI,
};

// Export contract objects with ABI and address
export const ContractAnalyzerContract = {
  abi: ContractAnalyzerABI,
  address: "0xB0170720d8BB751Ed8F7cC071b8D0d9b4e5f501F"
}

export const ContractTemplatesContract = {
  abi: ContractTemplatesABI,
  address: "0x157f375f0112837CA14c8dAFB9dFe26f83a94634"
}

export const DeFiUtilsContract = {
  abi: DeFiUtilsABI,
  address: "0x8860C6081E3Dd957d225FEf12d718495EBa75255"
}

export const ERC20FactoryContract = {
  abi: ERC20FactoryABI,
  address: "0x4F6D41C9F94FdD64c8D82C4eb71a459075E5Ae57"
}

export const MerkleProofContract = {
  abi: MerkleProofABI,
  address: "0x0f1d9F35bc1631D8C3eB6A2B35A2972bF5061E53"
}

export const MerkleProofValidatorContract = {
  abi: MerkleProofValidatorABI,
  address: "0x6FA75F5dc94A1Cec18a8a113851231c66e2Bb90f"
}









