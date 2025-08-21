"use client";

import React, { useEffect, useState } from "react";
import { ContractTemplatesContract } from "../../ABI";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

// Define types for better type safety
interface DeploymentParams {
  [key: string]: any;
}

interface Template {
  id: string;
  name: string;
  description: string;
  features: string[];
  icon: string;
  category: string;
  contractFunction: string;
  requiredParams: string[];
  gasEstimate: string;
  complexity: string;
}

const ContractTemplatesPage = () => {
  const { address, isConnected } = useAccount();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [deploymentParams, setDeploymentParams] = useState<DeploymentParams>({});
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedContracts, setDeployedContracts] = useState<string[]>([]);
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<{ chainId: string; name: string } | null>(null);

  const { writeContract: deployTemplate, data: deployData } = useWriteContract();

  const { isLoading: isDeployingTx, isSuccess: isDeployed } = useWaitForTransactionReceipt({
    hash: deployData,
  });

  // Get network info when wallet connects
  useEffect(() => {
    const getNetworkInfo = async () => {
      if (isConnected && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const network = await provider.getNetwork();
          setNetworkInfo({
            chainId: network.chainId.toString(),
            name: network.name || "Unknown",
          });
        } catch (error) {
          console.error("Error getting network info:", error);
        }
      }
    };

    getNetworkInfo();
  }, [isConnected]);

  // Enhanced templates with more details
  const templates: Template[] = [
    {
      id: "staking",
      name: "Staking Contract",
      description: "Deploy a basic staking contract for rewards distribution",
      features: [
        "Configurable staking and reward tokens",
        "Flexible reward rate system",
        "Secure withdrawal mechanisms",
        "Owner-controlled parameters",
      ],
      icon: "🏦",
      category: "DeFi",
      contractFunction: "deployStakingContract",
      requiredParams: ["stakingToken", "rewardToken", "rewardRate"],
      gasEstimate: "~800,000",
      complexity: "Intermediate",
    },
    {
      id: "vesting",
      name: "Vesting Contract",
      description: "Create token vesting schedules with time-based releases",
      features: [
        "Linear vesting over time",
        "Configurable vesting period",
        "Emergency pause functionality",
        "Owner controls",
      ],
      icon: "⏰",
      category: "Token Management",
      contractFunction: "deployVestingContract",
      requiredParams: ["token", "beneficiary", "totalAmount", "startTime", "duration"],
      gasEstimate: "~600,000",
      complexity: "Intermediate",
    },
    {
      id: "multisig",
      name: "Multi-Signature Wallet",
      description: "Secure multi-signature wallet for team funds and governance",
      features: ["Configurable signer count", "Threshold-based approvals", "Add/remove signers", "Emergency pause"],
      icon: "🔐",
      category: "Security",
      contractFunction: "deployMultiSigWallet",
      requiredParams: ["owners", "requiredSignatures"],
      gasEstimate: "~500,000",
      complexity: "Advanced",
    },
  ];

  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    if (!isConnected) {
      toast.error("Please connect your wallet to deploy templates");
      return;
    }

    setSelectedTemplate(templateId);
    setDeploymentParams({});
    setShowDeploymentModal(true);
    toast.info(`Preparing to deploy ${templates.find(t => t.id === templateId)?.name}...`);
  };

  // Handle deployment
  const handleDeploy = async () => {
    if (!selectedTemplate) return;

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    try {
      setIsDeploying(true);

      // Prepare deployment arguments based on template
      let args: any[] = [];

      switch (template.id) {
        case "staking":
          args = [
            deploymentParams.stakingToken || "0x0000000000000000000000000000000000000000",
            deploymentParams.rewardToken || "0x0000000000000000000000000000000000000000",
            BigInt(deploymentParams.rewardRate || "1000000000000000000"), // 1 token per second
          ];
          break;
        case "vesting":
          args = [
            deploymentParams.token || "0x0000000000000000000000000000000000000000",
            deploymentParams.beneficiary || address,
            BigInt(deploymentParams.totalAmount || "1000000000000000000000"), // 1000 tokens
            BigInt(deploymentParams.startTime || Math.floor(Date.now() / 1000)), // Now
            BigInt(deploymentParams.duration || "31536000"), // 1 year
          ];
          break;
        case "multisig":
          const signers = deploymentParams.owners
            ? deploymentParams.owners.split(",").map((s: string) => s.trim())
            : [address];
          args = [signers, BigInt(deploymentParams.requiredSignatures || "1")];
          break;
      }

      // Validate required parameters
      const missingParams = template.requiredParams.filter(
        param => !deploymentParams[param] || deploymentParams[param] === "",
      );

      if (missingParams.length > 0) {
        toast.error(`Missing required parameters: ${missingParams.join(", ")}`);
        setIsDeploying(false);
        return;
      }

      deployTemplate({
        address: ContractTemplatesContract.address,
        abi: ContractTemplatesContract.abi,
        functionName: template.contractFunction,
        args: args,
      });

      toast.info("Deploying template...");
    } catch (error) {
      console.error("Error deploying template:", error);
      toast.error("Failed to deploy template");
      setIsDeploying(false);
    }
  };

  // Handle successful deployment
  useEffect(() => {
    if (isDeployed && deployData) {
      toast.success("Template deployed successfully!");
      setDeployedContracts(prev => [...prev, deployData]);
      setIsDeploying(false);
      setShowDeploymentModal(false);
      setSelectedTemplate(null);
      setDeploymentParams({});
    }
  }, [isDeployed, deployData]);

  // Get parameter input fields based on template
  const getParameterInputs = (templateId: string) => {
    switch (templateId) {
      case "staking":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Staking Token Address *</label>
              <input
                type="text"
                value={deploymentParams.stakingToken || ""}
                onChange={e => setDeploymentParams({ ...deploymentParams, stakingToken: e.target.value })}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-[#0f1a2e] border border-[#2a3b54] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all duration-200"
              />
              <p className="text-xs text-gray-400 mt-1">Address of the token users will stake</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Reward Token Address *</label>
              <input
                type="text"
                value={deploymentParams.rewardToken || ""}
                onChange={e => setDeploymentParams({ ...deploymentParams, rewardToken: e.target.value })}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-[#0f1a2e] border border-[#2a3b54] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all duration-200"
              />
              <p className="text-xs text-gray-400 mt-1">Address of the token users will earn as rewards</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Reward Rate (tokens per second) *</label>
              <input
                type="text"
                value={deploymentParams.rewardRate || ""}
                onChange={e => setDeploymentParams({ ...deploymentParams, rewardRate: e.target.value })}
                placeholder="1000000000000000000"
                className="w-full px-4 py-3 bg-[#0f1a2e] border border-[#2a3b54] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all duration-200"
              />
              <p className="text-xs text-gray-400 mt-1">Amount of reward tokens distributed per second (in wei)</p>
            </div>
          </div>
        );
      case "vesting":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Token Address *</label>
              <input
                type="text"
                value={deploymentParams.token || ""}
                onChange={e => setDeploymentParams({ ...deploymentParams, token: e.target.value })}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-[#0f1a2e] border border-[#2a3b54] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all duration-200"
              />
              <p className="text-xs text-gray-400 mt-1">Address of the token being vested</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Beneficiary Address *</label>
              <input
                type="text"
                value={deploymentParams.beneficiary || ""}
                onChange={e => setDeploymentParams({ ...deploymentParams, beneficiary: e.target.value })}
                placeholder={address || "0x..."}
                className="w-full px-4 py-3 bg-[#0f1a2e] border border-[#2a3b54] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all duration-200"
              />
              <p className="text-xs text-gray-400 mt-1">Address that will receive the vested tokens</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Total Amount (in wei) *</label>
              <input
                type="text"
                value={deploymentParams.totalAmount || ""}
                onChange={e => setDeploymentParams({ ...deploymentParams, totalAmount: e.target.value })}
                placeholder="1000000000000000000000"
                className="w-full px-4 py-3 bg-[#0f1a2e] border border-[#2a3b54] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all duration-200"
              />
              <p className="text-xs text-gray-400 mt-1">Total amount of tokens to vest</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Start Time (Unix timestamp) *</label>
              <input
                type="number"
                value={deploymentParams.startTime || ""}
                onChange={e => setDeploymentParams({ ...deploymentParams, startTime: e.target.value })}
                placeholder={Math.floor(Date.now() / 1000).toString()}
                className="w-full px-4 py-3 bg-[#0f1a2e] border border-[#2a3b54] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all duration-200"
              />
              <p className="text-xs text-gray-400 mt-1">
                When vesting starts (current time: {Math.floor(Date.now() / 1000)})
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duration (in seconds) *</label>
              <input
                type="number"
                value={deploymentParams.duration || ""}
                onChange={e => setDeploymentParams({ ...deploymentParams, duration: e.target.value })}
                placeholder="31536000"
                className="w-full px-4 py-3 bg-[#0f1a2e] border border-[#2a3b54] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all duration-200"
              />
              <p className="text-xs text-gray-400 mt-1">How long vesting takes (1 year = 31,536,000 seconds)</p>
            </div>
          </div>
        );
      case "multisig":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Owner Addresses (comma-separated) *
              </label>
              <input
                type="text"
                value={deploymentParams.owners || ""}
                onChange={e => setDeploymentParams({ ...deploymentParams, owners: e.target.value })}
                placeholder={address || "0x..."}
                className="w-full px-4 py-3 bg-[#0f1a2e] border border-[#2a3b54] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all duration-200"
              />
              <p className="text-xs text-gray-400 mt-1">Comma-separated list of owner addresses</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Required Signatures *</label>
              <input
                type="number"
                value={deploymentParams.requiredSignatures || ""}
                onChange={e => setDeploymentParams({ ...deploymentParams, requiredSignatures: e.target.value })}
                placeholder="1"
                min="1"
                className="w-full px-4 py-3 bg-[#0f1a2e] border border-[#2a3b54] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all duration-200"
              />
              <p className="text-xs text-gray-400 mt-1">Number of signatures required to execute transactions</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Deployment Modal Component
  const DeploymentModal = () => {
    if (!showDeploymentModal || !selectedTemplate) return null;

    const template = templates.find(t => t.id === selectedTemplate);

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#1c2941] rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#2a3b54] shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{template?.icon}</div>
            <h2 className="text-3xl font-bold text-emerald-400 mb-2">Deploy {template?.name}</h2>
            <p className="text-xl text-gray-300">Configure parameters and deploy your smart contract</p>
          </div>

          {/* Template Info */}
          <div className="mb-6 p-4 bg-[#0f1a2e] rounded-xl border border-[#1e2a3a]">
            <h3 className="text-lg font-semibold mb-3 text-emerald-400">Template Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Category:</span>
                <span className="text-white ml-2">{template?.category}</span>
              </div>
              <div>
                <span className="text-gray-400">Complexity:</span>
                <span className="text-white ml-2">{template?.complexity}</span>
              </div>
              <div>
                <span className="text-gray-400">Gas Estimate:</span>
                <span className="text-white ml-2">{template?.gasEstimate}</span>
              </div>
            </div>
          </div>

          {/* Parameter Inputs */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-emerald-400">Deployment Parameters</h3>
            {getParameterInputs(selectedTemplate)}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleDeploy}
              disabled={isDeploying || isDeployingTx}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                isDeploying || isDeployingTx
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-600 to-slate-600 hover:from-emerald-700 hover:to-slate-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              }`}
            >
              {isDeploying || isDeployingTx ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Deploying...
                </div>
              ) : (
                "Deploy Contract"
              )}
            </button>
            <button
              onClick={() => setShowDeploymentModal(false)}
              className="w-full py-4 px-6 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#121d33] text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-slate-400 bg-clip-text text-transparent">
            Contract Templates
          </h1>
          <p className="text-xl text-gray-300">
            Deploy pre-built, audited smart contract templates for common DeFi use cases
          </p>
        </div>

        {/* Wallet Connection Check */}
        {!isConnected ? (
          <div className="text-center p-8 bg-[#1c2941] rounded-xl border border-[#2a3b54]">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-300">
              Please connect your wallet to any EVM-compatible network to deploy contract templates.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Supported testnets: ETN (Chain ID: 5201420) and Somnia (Chain ID: 50312)
            </p>
          </div>
        ) : (
          <>
            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {templates.map(template => (
                <div
                  key={template.id}
                  className="bg-[#1c2941] p-6 rounded-xl border border-[#2a3b54] shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group"
                >
                  {/* Template Icon */}
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {template.icon}
                  </div>

                  {/* Template Info */}
                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-emerald-400 transition-colors duration-300">
                    {template.name}
                  </h3>
                  <p className="text-gray-300 mb-4 text-sm">{template.description}</p>

                  {/* Template Metadata */}
                  <div className="flex items-center justify-between mb-4 text-xs">
                    <span className="px-2 py-1 bg-emerald-900/30 text-emerald-400 rounded-full">
                      {template.category}
                    </span>
                    <span className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded-full">{template.complexity}</span>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {template.features.map((feature, index) => (
                        <li key={index} className="text-xs text-gray-300 flex items-center">
                          <span className="text-emerald-400 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Gas Estimate */}
                  <div className="mb-4 p-2 bg-[#0f1a2e] rounded-lg border border-[#1e2a3a]">
                    <div className="text-xs text-gray-400">Estimated Gas:</div>
                    <div className="text-sm text-emerald-400 font-semibold">{template.gasEstimate}</div>
                  </div>

                  {/* Deploy Button */}
                  <button
                    onClick={() => handleSelectTemplate(template.id)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-slate-600 hover:from-emerald-700 hover:to-slate-700 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02]"
                  >
                    Deploy Template
                  </button>
                </div>
              ))}
            </div>

            {/* Contract Information */}
            <div className="bg-[#1c2941] p-6 rounded-xl border border-[#2a3b54] shadow-xl">
              <h2 className="text-2xl font-bold mb-4 text-emerald-400">Contract Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-white">Contract Address</h3>
                  <div className="flex items-center gap-2">
                    <code className="text-emerald-400 text-sm bg-[#0f1a2e] p-3 rounded-lg flex-1 break-all border border-[#1e2a3a]">
                      {ContractTemplatesContract.address}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(ContractTemplatesContract.address)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded transition-all duration-200"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-white">Network</h3>
                  <div className="text-emerald-400 font-semibold">EVM-Compatible Network</div>
                  <div className="text-gray-400 text-sm">Chain ID: {networkInfo?.chainId || "..."}</div>
                  <div className="text-xs text-gray-500 mt-1">Supported: ETN (5201420), Somnia (50312)</div>
                </div>
              </div>
            </div>

            {/* Recently Deployed Contracts */}
            {deployedContracts.length > 0 && (
              <div className="mt-8 bg-[#1c2941] p-6 rounded-xl border border-[#2a3b54] shadow-xl">
                <h2 className="text-2xl font-bold mb-4 text-emerald-400">Recently Deployed</h2>
                <div className="space-y-2">
                  {deployedContracts.map((contract, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-[#0f1a2e] rounded-lg border border-[#1e2a3a]"
                    >
                      <span className="text-gray-300">Contract {index + 1}</span>
                      <code className="text-emerald-400 text-sm">{contract}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Deployment Modal */}
      <DeploymentModal />
    </div>
  );
};

export default ContractTemplatesPage;
