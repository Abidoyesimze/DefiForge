// Import all contract ABIs
import ContractAnalyzerABI from "./ContractAnalyzer.json";
import ContractTemplatesABI from "./ContractTemplates.json";
import DeFiUtilsABI from "./DeFiUtils.json";
import ERC20FactoryABI from "./ERC20Factory.json";
import MerkleProofABI from "./MerkleProof.json";
import MerkleProofValidatorABI from "./MerkleProofValidator.json";

// Export all ABIs
export {
  ERC20FactoryABI,
  DeFiUtilsABI,
  ContractAnalyzerABI,
  ContractTemplatesABI,
  MerkleProofValidatorABI,
  MerkleProofABI,
};

// Export as default object for convenience
export default {
  ERC20Factory: ERC20FactoryABI,
  DeFiUtils: DeFiUtilsABI,
  ContractAnalyzer: ContractAnalyzerABI,
  ContractTemplates: ContractTemplatesABI,
  MerkleProofValidator: MerkleProofValidatorABI,
  MerkleProof: MerkleProofABI,
};
