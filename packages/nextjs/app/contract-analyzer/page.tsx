"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "react-toastify";
import { CONTRACT_ADDRESSES } from "../../contracts/deployedContracts";
import { ContractAnalyzerABI } from "../../ABI";

const ContractAnalyzerPage = () => {
  const { address, isConnected } = useAccount();
  const [contractAddress, setContractAddress] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { writeContract: analyzeContract, data: analyzeData } = useWriteContract();

  const { isLoading: isAnalyzingTx, isSuccess: isAnalysisComplete } = useWaitForTransactionReceipt({
    hash: analyzeData,
  });

  const handleAnalyzeContract = () => {
    if (!contractAddress) {
      toast.error("Please enter a contract address");
      return;
    }

    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setIsAnalyzing(true);
      analyzeContract({
        address: CONTRACT_ADDRESSES.ContractAnalyzer,
        abi: ContractAnalyzerABI.abi,
        functionName: "analyzeContract",
        args: [contractAddress],
      });
      toast.info("Analyzing contract...");
    } catch (error) {
      console.error("Error analyzing contract:", error);
      toast.error("Failed to analyze contract");
      setIsAnalyzing(false);
    }
  };

  // Mock analysis result for demo purposes
  const mockAnalysisResult = {
    contractSize: "2.5 KB",
    estimatedDeploymentGas: "1,200,000",
    isContract: true,
    hasFallback: false,
    hasReceive: true,
    balance: "0.0 ETH",
    codeSize: "2,500 bytes",
  };

  return (
    <div className="min-h-screen bg-[#121d33] text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contract Analyzer</h1>
          <p className="text-xl text-gray-300">
            Analyze smart contracts for gas optimization, security, and deployment costs
          </p>
        </div>

        {/* Wallet Connection Check */}
        {!isConnected ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
            <p className="text-gray-300 mb-6">
              Please connect your wallet to Somnia testnet to analyze contracts.
            </p>
          </div>
        ) : (
          <>
            {/* Analysis Form */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="bg-[#1c2941] p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-6">Analyze Smart Contract</h2>
                
                <div className="space-y-6">
                  {/* Contract Address Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contract Address *
                    </label>
                    <input
                      type="text"
                      value={contractAddress}
                      onChange={(e) => setContractAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-4 py-3 bg-[#0f1a2e] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      Enter the address of the smart contract you want to analyze
                    </p>
                  </div>

                  {/* Analyze Button */}
                  <button
                    onClick={handleAnalyzeContract}
                    disabled={isAnalyzing || isAnalyzingTx || !contractAddress}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                      isAnalyzing || isAnalyzingTx || !contractAddress
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                  >
                    {isAnalyzing || isAnalyzingTx ? "Analyzing..." : "Analyze Contract"}
                  </button>
                </div>

                {/* Info Box */}
                <div className="mt-8 p-4 bg-[#0f1a2e] rounded-lg border border-gray-600">
                  <h3 className="text-lg font-semibold mb-2 text-purple-400">ℹ️ What We Analyze</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Contract size and code complexity</li>
                    <li>• Estimated deployment gas costs</li>
                    <li>• Contract security features</li>
                    <li>• Fallback and receive functions</li>
                    <li>• Current contract balance</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Analysis Results */}
            {isAnalysisComplete && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-[#1c2941] p-8 rounded-lg">
                  <h2 className="text-2xl font-bold mb-6">Analysis Results</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-[#0f1a2e] rounded-lg">
                      <h3 className="text-lg font-semibold mb-2 text-purple-400">Contract Size</h3>
                      <p className="text-2xl text-white">{mockAnalysisResult.contractSize}</p>
                    </div>
                    
                    <div className="p-4 bg-[#0f1a2e] rounded-lg">
                      <h3 className="text-lg font-semibold mb-2 text-purple-400">Deployment Gas</h3>
                      <p className="text-2xl text-white">{mockAnalysisResult.estimatedDeploymentGas}</p>
                    </div>
                    
                    <div className="p-4 bg-[#0f1a2e] rounded-lg">
                      <h3 className="text-lg font-semibold mb-2 text-purple-400">Code Size</h3>
                      <p className="text-2xl text-white">{mockAnalysisResult.codeSize}</p>
                    </div>
                    
                    <div className="p-4 bg-[#0f1a2e] rounded-lg">
                      <h3 className="text-lg font-semibold mb-2 text-purple-400">Contract Balance</h3>
                      <p className="text-2xl text-white">{mockAnalysisResult.balance}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-[#0f1a2e] rounded-lg">
                      <h3 className="text-lg font-semibold mb-2 text-purple-400">Security Features</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className={`w-3 h-3 rounded-full mr-2 ${mockAnalysisResult.isContract ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="text-gray-300">Is Contract: {mockAnalysisResult.isContract ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex items-center">
                          <span className={`w-3 h-3 rounded-full mr-2 ${mockAnalysisResult.hasFallback ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                          <span className="text-gray-300">Has Fallback: {mockAnalysisResult.hasFallback ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex items-center">
                          <span className={`w-3 h-3 rounded-full mr-2 ${mockAnalysisResult.hasReceive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                          <span className="text-gray-300">Has Receive: {mockAnalysisResult.hasReceive ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-[#0f1a2e] rounded-lg">
                      <h3 className="text-lg font-semibold mb-2 text-purple-400">Gas Optimization</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Deployment Cost:</span>
                          <span className="text-white">~{mockAnalysisResult.estimatedDeploymentGas} gas</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Estimated Cost:</span>
                          <span className="text-white">~0.001 STT</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Optimization:</span>
                          <span className="text-green-400">Good</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="mt-8 p-6 bg-[#0f1a2e] rounded-lg border border-gray-600">
                    <h3 className="text-lg font-semibold mb-4 text-purple-400">💡 Recommendations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-white mb-2">Gas Optimization</h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                          <li>• Consider using libraries for complex functions</li>
                          <li>• Optimize storage patterns</li>
                          <li>• Use events instead of storage for logs</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-2">Security</h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                          <li>• Implement access controls</li>
                          <li>• Add reentrancy guards</li>
                          <li>• Use safe math operations</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sample Contracts */}
            <div className="mt-12 max-w-4xl mx-auto">
              <div className="bg-[#1c2941] p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-6">Sample Contracts to Analyze</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setContractAddress(CONTRACT_ADDRESSES.ERC20Factory)}
                    className="p-4 bg-[#0f1a2e] rounded-lg text-left hover:bg-[#243a5f] transition-colors"
                  >
                    <h3 className="font-semibold text-white">ERC20 Factory</h3>
                    <p className="text-sm text-gray-300">Our deployed token factory contract</p>
                    <code className="text-xs text-purple-400">{CONTRACT_ADDRESSES.ERC20Factory.slice(0, 10)}...</code>
                  </button>
                  
                  <button
                    onClick={() => setContractAddress(CONTRACT_ADDRESSES.DeFiUtils)}
                    className="p-4 bg-[#0f1a2e] rounded-lg text-left hover:bg-[#243a5f] transition-colors"
                  >
                    <h3 className="font-semibold text-white">DeFi Utils</h3>
                    <p className="text-sm text-gray-300">DeFi calculation utilities</p>
                    <code className="text-xs text-purple-400">{CONTRACT_ADDRESSES.DeFiUtils.slice(0, 10)}...</code>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Contract Info */}
        <div className="mt-12 text-center">
          <div className="bg-[#1c2941] p-6 rounded-lg max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-2">Contract Information</h3>
            <p className="text-sm text-gray-300 mb-2">
              Contract Analyzer deployed at:
            </p>
            <code className="text-purple-400 text-sm break-all">
              {CONTRACT_ADDRESSES.ContractAnalyzer}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractAnalyzerPage; 