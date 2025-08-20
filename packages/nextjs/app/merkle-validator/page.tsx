"use client";

import { useState } from "react";
import { MerkleProofValidatorContract } from "../../ABI";
import { toast } from "react-toastify";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

const MerkleValidatorPage = () => {
  const { address, isConnected } = useAccount();
  const [merkleRoot, setMerkleRoot] = useState("");
  const [proof, setProof] = useState("");
  const [leaf, setLeaf] = useState("");
  const [description, setDescription] = useState("");
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const { writeContract: registerMerkleRoot, data: registerData } = useWriteContract();

  const { writeContract: validateProof, data: validateData } = useWriteContract();

  const { isLoading: isRegistering, isSuccess: isRegistered } = useWaitForTransactionReceipt({
    hash: registerData,
  });

  const { isLoading: isValidatingTx, isSuccess: isValidationComplete } = useWaitForTransactionReceipt({
    hash: validateData,
  });

  const handleRegisterMerkleRoot = () => {
    if (!merkleRoot || !description) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    // Basic validation
    if (!merkleRoot.startsWith("0x") || merkleRoot.length !== 66) {
      toast.error("Please enter a valid Merkle root (0x + 64 hex characters)");
      return;
    }

    try {
      setIsValidating(true);
      registerMerkleRoot({
        address: MerkleProofValidatorContract.address,
        abi: MerkleProofValidatorContract.abi,
        functionName: "registerMerkleRoot",
        args: [merkleRoot, description],
      });
      toast.info("Registering Merkle root...");
    } catch (error) {
      console.error("Error registering Merkle root:", error);
      toast.error("Failed to register Merkle root");
      setIsValidating(false);
    }
  };

  const handleValidateProof = () => {
    if (!merkleRoot || !proof || !leaf) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    // Basic validation
    if (!merkleRoot.startsWith("0x") || merkleRoot.length !== 66) {
      toast.error("Please enter a valid Merkle root");
      return;
    }

    if (!leaf.startsWith("0x") || leaf.length !== 66) {
      toast.error("Please enter a valid leaf hash");
      return;
    }

    try {
      setIsValidating(true);
      // Convert proof string to array of bytes32
      const proofArray = proof.split(",").map(p => p.trim());
      
      // Validate proof format
      if (proofArray.some(p => !p.startsWith("0x") || p.length !== 66)) {
        toast.error("Please enter valid proof hashes (0x + 64 hex characters each)");
        setIsValidating(false);
        return;
      }

      validateProof({
        address: MerkleProofValidatorContract.address,
        abi: MerkleProofValidatorContract.abi,
        functionName: "validateProof",
        args: [merkleRoot, proofArray, leaf],
      });
      toast.info("Validating proof...");
    } catch (error) {
      console.error("Error validating proof:", error);
      toast.error("Failed to validate proof");
      setIsValidating(false);
    }
  };

  const generateSampleData = () => {
    // Generate sample Merkle data for demonstration
    setMerkleRoot("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef");
    setProof(
      "0x1111111111111111111111111111111111111111111111111111111111111111,0x2222222222222222222222222222222222222222222222222222222222222222",
    );
    setLeaf("0x3333333333333333333333333333333333333333333333333333333333333333");
    setDescription("Sample whitelist for NFT mint");
  };

  return (
    <div className="min-h-screen bg-[#121d33] text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Merkle Proof Validator</h1>
          <p className="text-xl text-gray-300">Validate Merkle proofs on-chain for efficient whitelists and airdrops</p>
        </div>

        {/* Wallet Connection Check */}
        {!isConnected ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
            <p className="text-gray-300 mb-6">
              Please connect your wallet to any EVM-compatible network to use the Merkle validator.
            </p>
            <p className="text-xs text-gray-400">Supported testnets: ETN (Chain ID: 5201420) and Somnia (Chain ID: 50312)</p>
          </div>
        ) : (
          <>
            {/* Sample Data Button */}
            <div className="text-center mb-8">
              <button
                onClick={generateSampleData}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Load Sample Data
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Register Merkle Root */}
              <div className="bg-[#1c2941] rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Register Merkle Root</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Merkle Root *</label>
                    <input
                      type="text"
                      value={merkleRoot}
                      onChange={e => setMerkleRoot(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-4 py-3 bg-[#0f1a2e] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                    <p className="text-sm text-gray-400 mt-1">The root hash of your Merkle tree</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                    <input
                      type="text"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="e.g., NFT whitelist, token airdrop"
                      className="w-full px-4 py-3 bg-[#0f1a2e] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                    <p className="text-sm text-gray-400 mt-1">Brief description of what this Merkle tree represents</p>
                  </div>

                  <button
                    onClick={handleRegisterMerkleRoot}
                    disabled={isRegistering || !merkleRoot || !description}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                      isRegistering || !merkleRoot || !description
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                  >
                    {isRegistering ? "Registering..." : "Register Merkle Root"}
                  </button>
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-[#0f1a2e] rounded-lg border border-gray-600">
                  <h3 className="text-lg font-semibold mb-2 text-purple-400">ℹ️ About Registration</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Only the creator can register a Merkle root</li>
                    <li>• Each root can only be registered once</li>
                    <li>• Description helps identify the purpose</li>
                    <li>• Registration is required before validation</li>
                  </ul>
                </div>
              </div>

              {/* Validate Proof */}
              <div className="bg-[#1c2941] rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Validate Merkle Proof</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Merkle Root *</label>
                    <input
                      type="text"
                      value={merkleRoot}
                      onChange={e => setMerkleRoot(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-4 py-3 bg-[#0f1a2e] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Merkle Proof *</label>
                    <textarea
                      value={proof}
                      onChange={e => setProof(e.target.value)}
                      placeholder="0x...,0x...,0x..."
                      rows={3}
                      className="w-full px-4 py-3 bg-[#0f1a2e] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                    <p className="text-sm text-gray-400 mt-1">Comma-separated list of proof hashes</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Leaf (Address Hash) *</label>
                    <input
                      type="text"
                      value={leaf}
                      onChange={e => setLeaf(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-4 py-3 bg-[#0f1a2e] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                    <p className="text-sm text-gray-400 mt-1">The hash of the address you want to validate</p>
                  </div>

                  <button
                    onClick={handleValidateProof}
                    disabled={isValidating || isValidatingTx || !merkleRoot || !proof || !leaf}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                      isValidating || isValidatingTx || !merkleRoot || !proof || !leaf
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                  >
                    {isValidating || isValidatingTx ? "Validating..." : "Validate Proof"}
                  </button>
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-[#0f1a2e] rounded-lg border border-gray-600">
                  <h3 className="text-lg font-semibold mb-2 text-purple-400">ℹ️ About Validation</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Merkle root must be registered first</li>
                    <li>• Proof array contains sibling hashes</li>
                    <li>• Leaf is usually keccak256(address)</li>
                    <li>• Validation updates usage statistics</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Transaction Status */}
            {(isRegistering || isValidatingTx) && (
              <div className="mt-8 max-w-4xl mx-auto">
                <div className="bg-[#1c2941] p-6 rounded-lg border border-purple-500">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mr-3"></div>
                    <span className="text-purple-400">
                      {isRegistering ? "Registering Merkle root..." : "Validating proof..."} Please wait for confirmation.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Results Section */}
            {(isRegistered || isValidationComplete) && (
              <div className="mt-12 max-w-4xl mx-auto">
                <div className="bg-[#1c2941] p-8 rounded-lg">
                  <h2 className="text-2xl font-bold mb-6">Operation Results</h2>

                  {isRegistered && (
                    <div className="mb-6 p-4 bg-green-900 bg-opacity-20 border border-green-600 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-400 mb-2">✅ Merkle Root Registered</h3>
                      <p className="text-gray-300">
                        The Merkle root has been successfully registered on the blockchain.
                      </p>
                      <div className="mt-3 text-sm">
                        <span className="text-gray-400">Root:</span>
                        <code className="ml-2 text-green-400 break-all">{merkleRoot}</code>
                      </div>
                      <div className="mt-1 text-sm">
                        <span className="text-gray-400">Description:</span>
                        <span className="ml-2 text-white">{description}</span>
                      </div>
                    </div>
                  )}

                  {isValidationComplete && (
                    <div className="p-4 bg-blue-900 bg-opacity-20 border border-blue-600 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-400 mb-2">🔍 Proof Validation Complete</h3>
                      <p className="text-gray-300">The Merkle proof has been validated on-chain.</p>
                      <div className="mt-3 text-sm">
                        <span className="text-gray-400">Validation Result:</span>
                        <span className="ml-2 text-green-400">Success</span>
                      </div>
                      <div className="mt-1 text-sm">
                        <span className="text-gray-400">Leaf:</span>
                        <code className="ml-2 text-blue-400 break-all">{leaf}</code>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* How It Works */}
            <div className="mt-12 max-w-4xl mx-auto">
              <div className="bg-[#1c2941] p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-6">How Merkle Proofs Work</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl mb-3">🌳</div>
                    <h3 className="font-semibold mb-2">1. Create Merkle Tree</h3>
                    <p className="text-sm text-gray-300">Hash your address list to create a tree structure</p>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl mb-3">🔑</div>
                    <h3 className="font-semibold mb-2">2. Generate Proofs</h3>
                    <p className="text-sm text-gray-300">Create proof arrays for each address in the list</p>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl mb-3">✅</div>
                    <h3 className="font-semibold mb-2">3. Validate On-Chain</h3>
                    <p className="text-sm text-gray-300">Use proofs to verify membership without storing full list</p>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-[#0f1a2e] rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-purple-400">💡 Use Cases</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Whitelists</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• NFT mint access control</li>
                        <li>• Token sale permissions</li>
                        <li>• Early access programs</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Airdrops</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Efficient token distribution</li>
                        <li>• Proof-based claims</li>
                        <li>• Gas cost optimization</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Contract Info */}
        <div className="mt-12 text-center">
          <div className="bg-[#1c2941] p-6 rounded-lg max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-2">Contract Information</h3>
            <p className="text-sm text-gray-300 mb-2">Merkle Proof Validator deployed at:</p>
            <code className="text-purple-400 text-sm break-all">{MerkleProofValidatorContract.address}</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerkleValidatorPage;
