"use client";

import { useState } from "react";
import { ERC20FactoryABI } from "../../ABI";
import { CONTRACT_ADDRESSES } from "../../contracts/deployedContracts";
import { toast } from "react-toastify";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

const ERC20FactoryPage = () => {
  const { address, isConnected } = useAccount();
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [initialSupply, setInitialSupply] = useState("");
  const [decimals, setDecimals] = useState("18");

  const { writeContract: createToken, data: createTokenData } = useWriteContract();

  const { isLoading: isCreating, isSuccess: isCreated } = useWaitForTransactionReceipt({
    hash: createTokenData,
  });

  const handleCreateToken = () => {
    if (!tokenName || !tokenSymbol || !initialSupply) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const supplyInWei = BigInt(initialSupply) * BigInt(10 ** parseInt(decimals));

      createToken({
        address: CONTRACT_ADDRESSES.ERC20Factory,
        abi: ERC20FactoryABI.abi,
        functionName: "createToken",
        args: [tokenName, tokenSymbol, supplyInWei, parseInt(decimals)],
      });

      toast.info("Creating token...");
    } catch (error) {
      console.error("Error creating token:", error);
      toast.error("Failed to create token");
    }
  };

  if (isCreated) {
    return (
      <div className="min-h-screen bg-[#121d33] text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold mb-4">Token Created Successfully!</h1>
            <p className="text-gray-300 mb-6">Your ERC20 token has been deployed to the blockchain.</p>
            <div className="bg-[#1c2941] p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-4">Token Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <span className="text-gray-400">Name:</span>
                  <span className="ml-2 text-white">{tokenName}</span>
                </div>
                <div>
                  <span className="text-gray-400">Symbol:</span>
                  <span className="ml-2 text-white">{tokenSymbol}</span>
                </div>
                <div>
                  <span className="text-gray-400">Initial Supply:</span>
                  <span className="ml-2 text-white">{initialSupply}</span>
                </div>
                <div>
                  <span className="text-gray-400">Decimals:</span>
                  <span className="ml-2 text-white">{decimals}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Create Another Token
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121d33] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">ERC20 Token Factory</h1>
          <p className="text-xl text-gray-300">
            Create custom ERC20 tokens with your own name, symbol, and initial supply
          </p>
        </div>

        {/* Wallet Connection Check */}
        {!isConnected ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
            <p className="text-gray-300 mb-6">Please connect your wallet to Somnia testnet to create tokens.</p>
            <div className="bg-[#1c2941] p-6 rounded-lg max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-2">Network Requirements</h3>
              <p className="text-sm text-gray-300">
                Make sure you&apos;re connected to Somnia Testnet (Chain ID: 50312)
              </p>
            </div>
          </div>
        ) : (
          /* Token Creation Form */
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#1c2941] p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">Create New Token</h2>

              <div className="space-y-6">
                {/* Token Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Token Name *</label>
                  <input
                    type="text"
                    value={tokenName}
                    onChange={e => setTokenName(e.target.value)}
                    placeholder="e.g., My Awesome Token"
                    className="w-full px-4 py-3 bg-[#0f1a2e] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Token Symbol */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Token Symbol *</label>
                  <input
                    type="text"
                    value={tokenSymbol}
                    onChange={e => setTokenSymbol(e.target.value.toUpperCase())}
                    placeholder="e.g., MAT"
                    maxLength={10}
                    className="w-full px-4 py-3 bg-[#0f1a2e] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Initial Supply */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Initial Supply *</label>
                  <input
                    type="number"
                    value={initialSupply}
                    onChange={e => setInitialSupply(e.target.value)}
                    placeholder="e.g., 1000000"
                    min="1"
                    className="w-full px-4 py-3 bg-[#0f1a2e] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-sm text-gray-400 mt-1">Total tokens to be minted initially</p>
                </div>

                {/* Decimals */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Decimals</label>
                  <select
                    value={decimals}
                    onChange={e => setDecimals(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f1a2e] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="18">18 (Standard)</option>
                    <option value="6">6 (USDC Style)</option>
                    <option value="8">8 (Bitcoin Style)</option>
                    <option value="0">0 (Whole Numbers)</option>
                  </select>
                  <p className="text-sm text-gray-400 mt-1">Number of decimal places for token divisibility</p>
                </div>

                {/* Create Button */}
                <button
                  onClick={handleCreateToken}
                  disabled={isCreating || !tokenName || !tokenSymbol || !initialSupply}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    isCreating || !tokenName || !tokenSymbol || !initialSupply
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  }`}
                >
                  {isCreating ? "Creating Token..." : "Create Token"}
                </button>
              </div>

              {/* Info Box */}
              <div className="mt-8 p-4 bg-[#0f1a2e] rounded-lg border border-gray-600">
                <h3 className="text-lg font-semibold mb-2 text-purple-400">ℹ️ Important Notes</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Token name and symbol cannot be changed after creation</li>
                  <li>• Initial supply will be sent to your wallet address</li>
                  <li>• You will be the owner of the created token</li>
                  <li>• Transaction requires STT tokens for gas fees</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Contract Info */}
        <div className="mt-12 text-center">
          <div className="bg-[#1c2941] p-6 rounded-lg max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-2">Contract Information</h3>
            <p className="text-sm text-gray-300 mb-2">ERC20 Factory deployed at:</p>
            <code className="text-purple-400 text-sm break-all">{CONTRACT_ADDRESSES.ERC20Factory}</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ERC20FactoryPage;
