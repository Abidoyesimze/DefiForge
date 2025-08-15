"use client";

import { useState } from "react";
import { DeFiUtilsABI } from "../../ABI";
import { CONTRACT_ADDRESSES } from "../../contracts/deployedContracts";
import { toast } from "react-toastify";
import { useAccount, useContractRead } from "wagmi";

const DeFiUtilsPage = () => {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState("liquidity");

  // Liquidity calculation inputs
  const [token0Amount, setToken0Amount] = useState("");
  const [token1Amount, setToken1Amount] = useState("");
  const [token0Price, setToken0Price] = useState("");

  // Yield calculation inputs
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");
  const [compoundFrequency, setCompoundFrequency] = useState("12");

  // Impermanent loss inputs
  const [initialPrice, setInitialPrice] = useState("");
  const [finalPrice, setFinalPrice] = useState("");

  // Swap fee inputs
  const [amountIn, setAmountIn] = useState("");
  const [feePercentage, setFeePercentage] = useState("0.3");

  // Results state
  const [results, setResults] = useState<any>({});

  // Helper function to convert decimal inputs to proper format for BigInt
  const convertToBigInt = (value: string, decimals: number = 18): bigint => {
    if (!value || value === "") return BigInt(0);

    try {
      // Handle negative numbers
      const isNegative = value.startsWith("-");
      const absValue = isNegative ? value.slice(1) : value;

      // Convert decimal to integer by multiplying by 10^decimals
      const [wholePart, decimalPart = ""] = absValue.split(".");
      const paddedDecimal = decimalPart.padEnd(decimals, "0").slice(0, decimals);
      const fullNumber = wholePart + paddedDecimal;

      // Convert to BigInt
      const result = BigInt(fullNumber);

      // Apply negative sign if needed
      return isNegative ? -result : result;
    } catch (error) {
      console.error("Error converting to BigInt:", error);
      return BigInt(0);
    }
  };

  // Contract read functions
  const { data: liquidityResult, refetch: refetchLiquidity } = useContractRead({
    address: CONTRACT_ADDRESSES.DeFiUtils,
    abi: DeFiUtilsABI.abi,
    functionName: "calculateLiquidity",
    args: [
      convertToBigInt(token0Amount),
      convertToBigInt(token1Amount),
      convertToBigInt(token0Price, 18), // Price in wei (18 decimals)
    ],
  });

  const { data: simpleYieldResult, refetch: refetchSimpleYield } = useContractRead({
    address: CONTRACT_ADDRESSES.DeFiUtils,
    abi: DeFiUtilsABI.abi,
    functionName: "calculateSimpleYield",
    args: [
      convertToBigInt(principal),
      convertToBigInt(rate, 6), // Rate as percentage with 6 decimals (e.g., 5.5% = 5500000)
      convertToBigInt(time, 6), // Time in years with 6 decimals
    ],
  });

  const { data: compoundYieldResult, refetch: refetchCompoundYield } = useContractRead({
    address: CONTRACT_ADDRESSES.DeFiUtils,
    abi: DeFiUtilsABI.abi,
    functionName: "calculateCompoundYield",
    args: [
      convertToBigInt(principal),
      convertToBigInt(rate, 6), // Rate as percentage with 6 decimals
      convertToBigInt(time, 6), // Time in years with 6 decimals
      parseInt(compoundFrequency),
    ],
  });

  const { data: impermanentLossResult, refetch: refetchImpermanentLoss } = useContractRead({
    address: CONTRACT_ADDRESSES.DeFiUtils,
    abi: DeFiUtilsABI.abi,
    functionName: "calculateImpermanentLoss",
    args: [
      convertToBigInt(initialPrice, 18), // Price in wei
      convertToBigInt(finalPrice, 18), // Price in wei
    ],
  });

  const { data: swapFeeResult, refetch: refetchSwapFee } = useContractRead({
    address: CONTRACT_ADDRESSES.DeFiUtils,
    abi: DeFiUtilsABI.abi,
    functionName: "calculateSwapFee",
    args: [
      convertToBigInt(amountIn),
      convertToBigInt(feePercentage, 6), // Fee percentage with 6 decimals (e.g., 0.3% = 300000)
    ],
  });

  // Helper function to check if result exists and is valid
  const hasValidResult = (result: unknown): result is bigint => {
    return result !== null && result !== undefined && typeof result === "bigint";
  };

  // Input validation function
  const validateInput = (value: string, fieldName: string): boolean => {
    if (!value || value === "") return false;

    // Check if it's a valid number
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      toast.error(`${fieldName} must be a valid number`);
      return false;
    }

    // Check for reasonable bounds
    if (numValue < 0) {
      toast.error(`${fieldName} cannot be negative`);
      return false;
    }

    // Check for extremely large numbers that might cause issues
    if (numValue > 1e12) {
      toast.error(`${fieldName} is too large. Please use a smaller number.`);
      return false;
    }

    return true;
  };

  const calculateLiquidity = async () => {
    if (
      !validateInput(token0Amount, "Token 0 Amount") ||
      !validateInput(token1Amount, "Token 1 Amount") ||
      !validateInput(token0Price, "Token 0 Price")
    ) {
      return;
    }
    await refetchLiquidity();
  };

  const calculateSimpleYield = async () => {
    if (
      !validateInput(principal, "Principal Amount") ||
      !validateInput(rate, "Annual Rate") ||
      !validateInput(time, "Time")
    ) {
      return;
    }
    await refetchSimpleYield();
  };

  const calculateCompoundYield = async () => {
    if (
      !validateInput(principal, "Principal Amount") ||
      !validateInput(rate, "Annual Rate") ||
      !validateInput(time, "Time")
    ) {
      return;
    }
    await refetchCompoundYield();
  };

  const calculateImpermanentLoss = async () => {
    if (!validateInput(initialPrice, "Initial Price") || !validateInput(finalPrice, "Final Price")) {
      return;
    }
    await refetchImpermanentLoss();
  };

  const calculateSwapFee = async () => {
    if (!validateInput(amountIn, "Amount In") || !validateInput(feePercentage, "Fee Percentage")) {
      return;
    }
    await refetchSwapFee();
  };

  const formatResult = (value: bigint | undefined) => {
    if (!value) return "0";
    return (Number(value) / 1e18).toFixed(6);
  };

  const tabs = [
    { id: "liquidity", name: "Liquidity", icon: "💧" },
    { id: "yield", name: "Yield", icon: "📈" },
    { id: "impermanent-loss", name: "Impermanent Loss", icon: "📉" },
    { id: "swap-fee", name: "Swap Fee", icon: "💱" },
  ];

  return (
    <div className="min-h-screen bg-[#121d33] text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">DeFi Utilities</h1>
          <p className="text-xl text-gray-300">
            Advanced DeFi calculations for liquidity, yield, impermanent loss, and more
          </p>
        </div>

        {/* Wallet Connection Check */}
        {!isConnected ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
            <p className="text-gray-300 mb-6">Please connect your wallet to Somnia testnet to use DeFi utilities.</p>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center mb-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 mx-2 mb-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id ? "bg-purple-600 text-white" : "bg-[#1c2941] text-gray-300 hover:bg-[#243a5f]"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-[#1c2941] rounded-lg p-8">
              {/* Liquidity Calculator */}
              {activeTab === "liquidity" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Liquidity Calculator</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Token 0 Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Token 0 Amount</label>
                      <input
                        type="number"
                        value={token0Amount}
                        onChange={e => setToken0Amount(e.target.value)}
                        placeholder="1000"
                        min="0"
                        step="0.000001"
                        className="w-full px-4 py-3 bg-[#0f1a2e] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      />
                      <p className="text-sm text-gray-400 mt-1">Enter a positive number (e.g., 1000)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Token 1 Amount</label>
                      <input
                        type="number"
                        value={token1Amount}
                        onChange={e => setToken1Amount(e.target.value)}
                        placeholder="1000"
                        min="0"
                        step="0.000001"
                        className="w-full px-4 py-3 bg-[#0f1a2e] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      />
                      <p className="text-sm text-gray-400 mt-1">Enter a positive number (e.g., 1000)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Token 0 Price (in ETH)</label>
                      <input
                        type="number"
                        value={token0Price}
                        onChange={e => setToken0Price(e.target.value)}
                        placeholder="0.001"
                        min="0"
                        step="0.000001"
                        className="w-full px-4 py-3 bg-[#0f1a2e] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      />
                      <p className="text-sm text-gray-400 mt-1">Enter a positive price (e.g., 0.001)</p>
                    </div>
                  </div>
                  <button
                    onClick={calculateLiquidity}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Calculate Liquidity
                  </button>
                  {hasValidResult(liquidityResult) && (
                    <div className="mt-6 p-4 bg-[#0f1a2e] rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Result:</h3>
                      <p className="text-2xl text-purple-400">{formatResult(liquidityResult)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Yield Calculator */}
              {activeTab === "yield" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Yield Calculator</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    {/* Principal Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Principal Amount</label>
                      <input
                        type="number"
                        value={principal}
                        onChange={e => setPrincipal(e.target.value)}
                        placeholder="1000"
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 bg-[#0f1a2e] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      />
                      <p className="text-sm text-gray-400 mt-1">Enter a positive number (e.g., 1000)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Annual Rate (%)</label>
                      <input
                        type="number"
                        value={rate}
                        onChange={e => setRate(e.target.value)}
                        placeholder="5"
                        min="0"
                        max="1000"
                        step="0.1"
                        className="w-full px-4 py-3 bg-[#0f1a2e] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      />
                      <p className="text-sm text-gray-400 mt-1">Enter percentage (e.g., 5 for 5%)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Time (years)</label>
                      <input
                        type="number"
                        value={time}
                        onChange={e => setTime(e.target.value)}
                        placeholder="1"
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-full px-4 py-3 bg-[#0f1a2e] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      />
                      <p className="text-sm text-gray-400 mt-1">Enter time in years (e.g., 1 for 1 year)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Compound Frequency</label>
                      <select
                        value={compoundFrequency}
                        onChange={e => setCompoundFrequency(e.target.value)}
                        className="w-full px-4 py-3 bg-[#0f1a2e] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="1">Annually</option>
                        <option value="2">Semi-annually</option>
                        <option value="4">Quarterly</option>
                        <option value="12">Monthly</option>
                        <option value="365">Daily</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={calculateSimpleYield}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      Calculate Simple Yield
                    </button>
                    <button
                      onClick={calculateCompoundYield}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      Calculate Compound Yield
                    </button>
                  </div>
                  {(hasValidResult(simpleYieldResult) || hasValidResult(compoundYieldResult)) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {hasValidResult(simpleYieldResult) && (
                        <div className="p-4 bg-[#0f1a2e] rounded-lg">
                          <h3 className="text-lg font-semibold mb-2">Simple Yield:</h3>
                          <p className="text-2xl text-purple-400">{formatResult(simpleYieldResult)}</p>
                        </div>
                      )}
                      {hasValidResult(compoundYieldResult) && (
                        <div className="p-4 bg-[#0f1a2e] rounded-lg">
                          <h3 className="text-lg font-semibold mb-2">Compound Yield:</h3>
                          <p className="text-2xl text-purple-400">{formatResult(compoundYieldResult)}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Impermanent Loss Calculator */}
              {activeTab === "impermanent-loss" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Impermanent Loss Calculator</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Initial Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Initial Price</label>
                      <input
                        type="number"
                        value={initialPrice}
                        onChange={e => setInitialPrice(e.target.value)}
                        placeholder="1.0"
                        min="0"
                        step="0.000001"
                        className="w-full px-4 py-3 bg-[#0f1a2e] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      />
                      <p className="text-sm text-gray-400 mt-1">Enter a positive price (e.g., 1.0)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Final Price</label>
                      <input
                        type="number"
                        value={finalPrice}
                        onChange={e => setFinalPrice(e.target.value)}
                        placeholder="1.5"
                        min="0"
                        step="0.000001"
                        className="w-full px-4 py-3 bg-[#0f1a2e] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      />
                      <p className="text-sm text-gray-400 mt-1">Enter a positive price (e.g., 1.5)</p>
                    </div>
                  </div>
                  <button
                    onClick={calculateImpermanentLoss}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Calculate Impermanent Loss
                  </button>
                  {hasValidResult(impermanentLossResult) && (
                    <div className="mt-6 p-4 bg-[#0f1a2e] rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Result:</h3>
                      <p className="text-2xl text-purple-400">{formatResult(impermanentLossResult)}%</p>
                    </div>
                  )}
                </div>
              )}

              {/* Swap Fee Calculator */}
              {activeTab === "swap-fee" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Swap Fee Calculator</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Amount In */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Amount In</label>
                      <input
                        type="number"
                        value={amountIn}
                        onChange={e => setAmountIn(e.target.value)}
                        placeholder="1000"
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 bg-[#0f1a2e] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      />
                      <p className="text-sm text-gray-400 mt-1">Enter a positive amount (e.g., 1000)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Fee Percentage (%)</label>
                      <input
                        type="number"
                        value={feePercentage}
                        onChange={e => setFeePercentage(e.target.value)}
                        placeholder="0.3"
                        min="0"
                        max="100"
                        step="0.01"
                        className="w-full px-4 py-3 bg-[#0f1a2e] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      />
                      <p className="text-sm text-gray-400 mt-1">Enter fee percentage (e.g., 0.3 for 0.3%)</p>
                    </div>
                  </div>
                  <button
                    onClick={calculateSwapFee}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Calculate Swap Fee
                  </button>
                  {hasValidResult(swapFeeResult) && (
                    <div className="mt-6 p-4 bg-[#0f1a2e] rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Result:</h3>
                      <p className="text-2xl text-purple-400">{formatResult(swapFeeResult)}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Contract Info */}
        <div className="mt-12 text-center">
          <div className="bg-[#1c2941] p-6 rounded-lg max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-2">Contract Information</h3>
            <p className="text-sm text-gray-300 mb-2">DeFi Utils deployed at:</p>
            <code className="text-purple-400 text-sm break-all">{CONTRACT_ADDRESSES.DeFiUtils}</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeFiUtilsPage;
