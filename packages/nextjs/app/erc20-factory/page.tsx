"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import { useAccount, useChainId } from "wagmi";
import { ethers } from "ethers";
import { ERC20FactoryContract } from "../../ABI";

// Define types for better type safety
interface CreatedToken {
  name: string;
  symbol: string;
  supply: string;
  decimals: string;
  address: string | null;
  txHash: string;
  gasUsed: string;
  creator: string;
}

interface ExplorerLinks {
  transaction: string;
  token: string;
}

const ERC20FactoryPage = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [initialSupply, setInitialSupply] = useState("");
  const [decimals, setDecimals] = useState("18");
  const [isCreating, setIsCreating] = useState(false);
  
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdToken, setCreatedToken] = useState<CreatedToken | null>(null);

  // Contract details - using imported contract
  const FACTORY_ADDRESS = ERC20FactoryContract.address;
  const FACTORY_ABI = ERC20FactoryContract.abi;

  // Check if connected to correct network
  const isCorrectNetwork = chainId === 50312;

  // Get block explorer links
  const getExplorerLinks = (txHash: string, tokenAddress: string | null): ExplorerLinks => {
    // Somnia testnet explorer (replace with actual explorer URL when available)
    const baseExplorerUrl = "https://explorer.somnia.network"; // Update this with actual Somnia explorer
    return {
      transaction: `${baseExplorerUrl}/tx/${txHash}`,
      token: tokenAddress ? `${baseExplorerUrl}/address/${tokenAddress}` : "#"
    };
  };

  // Copy to clipboard function
  const copyToClipboard = async (text: string, label: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Reset form
  const resetForm = (): void => {
    setTokenName("");
    setTokenSymbol("");
    setInitialSupply("");
    setDecimals("18");
  };

  // Create another token
  const createAnotherToken = (): void => {
    setShowSuccessModal(false);
    setCreatedToken(null);
    resetForm();
  };

  // Token creation function
  const handleCreateToken = async () => {
    if (!tokenName || !tokenSymbol || !initialSupply) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!isCorrectNetwork) {
      toast.error("Please connect to Somnia Testnet (Chain ID: 50312)");
      return;
    }

    if (parseInt(initialSupply) <= 0) {
      toast.error("Initial supply must be greater than 0");
      return;
    }

    if (parseInt(decimals) < 0 || parseInt(decimals) > 18) {
      toast.error("Decimals must be between 0 and 18");
      return;
    }

    setIsCreating(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);

      const rawSupply = BigInt(initialSupply);
      const decimalsValue = parseInt(decimals);

      // Estimate gas
      const gasEstimate = await contract.createToken.estimateGas(
        tokenName,
        tokenSymbol,
        rawSupply,
        decimalsValue
      );

      // Execute transaction with proper gas limit
      const gasLimit = (gasEstimate * BigInt(150)) / BigInt(100);
      
      const tx = await contract.createToken(
        tokenName,
        tokenSymbol,
        rawSupply,
        decimalsValue,
        {
          gasLimit: gasLimit,
          gasPrice: ethers.parseUnits("6", "gwei")
        }
      );

      toast.info(`Transaction sent: ${tx.hash.slice(0, 10)}...`);

      // Wait for confirmation
      const receipt = await tx.wait();
      
      // Get token address from event
      let newTokenAddress: string | null = null;
      const tokenCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'TokenCreated';
        } catch {
          return false;
        }
      });

      if (tokenCreatedEvent) {
        try {
          const parsed = contract.interface.parseLog(tokenCreatedEvent);
          newTokenAddress = parsed?.args?.tokenAddress || null;
        } catch (parseError) {
          console.error("Failed to parse token creation event:", parseError);
        }
      }

      // Set success modal data
      setCreatedToken({
        name: tokenName,
        symbol: tokenSymbol,
        supply: initialSupply,
        decimals: decimals,
        address: newTokenAddress,
        txHash: tx.hash,
        gasUsed: receipt.gasUsed.toString(),
        creator: address || "Unknown"
      });

      // Show success modal
      setShowSuccessModal(true);
      toast.success("Token created successfully!");

    } catch (error: unknown) {
      let errorMessage = "Token creation failed";
      
      if (error instanceof Error) {
        if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient STT tokens for gas fees";
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Transaction rejected by user";
        } else if (error.message.includes("execution reverted")) {
          errorMessage = "Contract rejected the transaction";
        } else if ((error as any).reason) {
          errorMessage = (error as any).reason;
        } else {
          errorMessage = error.message;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  // Success Modal Component
  const SuccessModal = (): React.JSX.Element | null => {
    if (!showSuccessModal || !createdToken) return null;

    const explorerLinks = getExplorerLinks(createdToken.txHash, createdToken.address);

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#1c2941] rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#2a3b54] shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-emerald-400 mb-2">Congratulations!</h2>
            <p className="text-xl text-gray-300">
              Your token <span className="text-white font-semibold">{createdToken.name}</span> has been created successfully!
            </p>
          </div>

          {/* Token Details */}
          <div className="bg-[#0f1a2e] rounded-xl p-6 mb-6 border border-[#1e2a3a]">
            <h3 className="text-lg font-semibold mb-4 text-emerald-400">Token Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 text-sm">Name:</span>
                  <div className="text-white font-medium">{createdToken.name}</div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Symbol:</span>
                  <div className="text-white font-medium">{createdToken.symbol}</div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Initial Supply:</span>
                  <div className="text-white font-medium">{createdToken.supply} {createdToken.symbol}</div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 text-sm">Decimals:</span>
                  <div className="text-white font-medium">{createdToken.decimals}</div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Creator:</span>
                  <div className="text-white font-medium text-xs break-all">{createdToken.creator}</div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Gas Used:</span>
                  <div className="text-white font-medium">{parseInt(createdToken.gasUsed).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Address */}
          <div className="bg-[#0f1a2e] rounded-xl p-4 mb-6 border border-[#1e2a3a]">
            <h3 className="text-sm font-semibold mb-2 text-emerald-400">Token Contract Address</h3>
            <div className="flex items-center gap-2">
              <code className="text-white font-mono text-sm bg-[#0a0f1a] p-3 rounded-lg flex-1 break-all border border-[#1e2a3a]">
                {createdToken.address || "Address not available"}
              </code>
              <button
                onClick={() => copyToClipboard(createdToken.address || "", "Token address")}
                className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-all duration-200 hover:shadow-lg"
                disabled={!createdToken.address}
              >
                Copy
              </button>
            </div>
          </div>

          {/* Transaction Hash */}
          <div className="bg-[#0f1a2e] rounded-xl p-4 mb-6 border border-[#1e2a3a]">
            <h3 className="text-sm font-semibold mb-2 text-emerald-400">Transaction Hash</h3>
            <div className="flex items-center gap-2">
              <code className="text-white font-mono text-sm bg-[#0a0f1a] p-3 rounded-lg flex-1 break-all border border-[#1e2a3a]">
                {createdToken.txHash}
              </code>
              <button
                onClick={() => copyToClipboard(createdToken.txHash, "Transaction hash")}
                className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-all duration-200 hover:shadow-lg"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Block Explorer Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <a
              href={explorerLinks.transaction}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-4 bg-slate-600 hover:bg-slate-700 text-white rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02]"
            >
              <span>🔍</span>
              View Transaction
            </a>
            <a
              href={explorerLinks.token}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 p-4 rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] ${
                createdToken.address 
                  ? "bg-slate-600 hover:bg-slate-700 text-white" 
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
              onClick={(e) => {
                if (!createdToken.address) {
                  e.preventDefault();
                  toast.error("Token address not available");
                }
              }}
            >
              <span>🎯</span>
              View Token Contract
            </a>
          </div>

          {/* What's Next Section */}
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-6 mb-6 border border-[#2a3b54]">
            <h3 className="text-lg font-semibold mb-4 text-amber-400">What Can You Do Next?</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold text-base">1.</span>
                <div>
                  <div className="text-white font-medium">Add to Your Wallet</div>
                  <div className="text-gray-300">Import your token to MetaMask using the contract address above</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold text-base">2.</span>
                <div>
                  <div className="text-white font-medium">Transfer Tokens</div>
                  <div className="text-gray-300">Send your tokens to friends, family, or community members</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold text-base">3.</span>
                <div>
                  <div className="text-white font-medium">Create Liquidity</div>
                  <div className="text-gray-300">Add liquidity to DEXs like Uniswap or SushiSwap for trading</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold text-base">4.</span>
                <div>
                  <div className="text-white font-medium">Build Community</div>
                  <div className="text-gray-300">Use your token for governance, rewards, or community incentives</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold text-base">5.</span>
                <div>
                  <div className="text-white font-medium">Learn More</div>
                  <div className="text-gray-300">Explore DeFi protocols, staking, and advanced token utilities</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={createAnotherToken}
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02]"
            >
              Create Another Token
            </button>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-4 px-6 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#121d33] text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-slate-400 bg-clip-text text-transparent">
            ERC20 Token Factory
          </h1>
          <p className="text-gray-300 text-lg">Create your own cryptocurrency on Somnia Testnet</p>
        </div>

        {!isConnected ? (
          <div className="text-center p-8 bg-[#1c2941] rounded-lg border border-gray-600">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-300">Please connect to Somnia Testnet (Chain ID: 50312) to get started</p>
          </div>
        ) : !isCorrectNetwork ? (
          <div className="text-center p-8 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-4 text-red-400">Wrong Network</h2>
            <p className="text-red-200">Please switch to Somnia Testnet (Chain ID: 50312)</p>
          </div>
        ) : (
          <div className="bg-[#1c2941] p-8 rounded-xl border border-[#2a3b54] shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Create Your Token</h2>

            <div className="space-y-6">
              {/* Token Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Token Name *
                </label>
                <input
                  type="text"
                  value={tokenName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTokenName(e.target.value)}
                  placeholder="e.g., My Awesome Token"
                  className="w-full px-4 py-3 bg-[#0f1a2e] border border-[#2a3b54] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all duration-200"
                />
              </div>

              {/* Token Symbol */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Token Symbol *
                </label>
                <input
                  type="text"
                  value={tokenSymbol}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTokenSymbol(e.target.value.toUpperCase())}
                  placeholder="e.g., MAT"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-[#0f1a2e] border border-[#2a3b54] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all duration-200"
                />
              </div>

              {/* Initial Supply */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Initial Supply *
                </label>
                <input
                  type="number"
                  value={initialSupply}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInitialSupply(e.target.value)}
                  placeholder="e.g., 1000000"
                  min="1"
                  className="w-full px-4 py-3 bg-[#0f1a2e] border border-[#2a3b54] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all duration-200"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Number of tokens to create (e.g., 1000 = 1000 tokens)
                </p>
              </div>

              {/* Decimals */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Decimals
                </label>
                <select
                  value={decimals}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDecimals(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f1a2e] border border-[#2a3b54] rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-all duration-200"
                >
                  <option value="18">18 (Standard - like ETH)</option>
                  <option value="6">6 (Like USDC)</option>
                  <option value="0">0 (Whole numbers only)</option>
                </select>
              </div>

              {/* Preview */}
              {tokenName && tokenSymbol && initialSupply && (
                <div className="p-4 bg-gradient-to-r from-slate-800/30 to-slate-700/30 rounded-lg border border-[#2a3b54]">
                  <h3 className="text-lg font-semibold mb-3 text-emerald-400">Token Preview</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Name:</span>
                      <div className="text-white font-medium">{tokenName}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Symbol:</span>
                      <div className="text-white font-medium">{tokenSymbol}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Supply:</span>
                      <div className="text-white font-medium">{initialSupply} {tokenSymbol}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Decimals:</span>
                      <div className="text-white font-medium">{decimals}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Create Button */}
              <button
                onClick={handleCreateToken}
                disabled={isCreating || !tokenName || !tokenSymbol || !initialSupply}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  isCreating || !tokenName || !tokenSymbol || !initialSupply
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-600 to-slate-600 hover:from-emerald-700 hover:to-slate-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                }`}
              >
                {isCreating ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Token...
                  </div>
                ) : (
                  "Create Token"
                )}
              </button>

              {/* Quick Test Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={(): void => {
                    setTokenName("DemoToken");
                    setTokenSymbol("DEMO");
                    setInitialSupply("1000000");
                    setDecimals("18");
                    toast.info("Demo parameters loaded!");
                  }}
                  className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-all duration-200"
                >
                  Load Demo
                </button>
                <button
                  onClick={(): void => {
                    resetForm();
                    toast.info("Form cleared!");
                  }}
                  className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded-lg transition-all duration-200"
                >
                  Clear Form
                </button>
              </div>
            </div>

            {/* Contract Info */}
            <div className="mt-8 p-4 bg-[#0f1a2e] rounded-lg border border-[#2a3b54]">
              <div className="text-xs text-gray-300 space-y-1">
                <div><span className="font-semibold">Factory Contract:</span> {ERC20FactoryContract.address}</div>
                <div><span className="font-semibold">Network:</span> Somnia Testnet (50312)</div>
                <div><span className="font-semibold">Your Address:</span> {address || "Not connected"}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      <SuccessModal />
    </div>
  );
};

export default ERC20FactoryPage;