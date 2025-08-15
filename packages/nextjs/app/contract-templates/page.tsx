"use client";

import { useState } from "react";
import { CONTRACT_ADDRESSES } from "../../contracts/deployedContracts";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";

const ContractTemplatesPage = () => {
  const { address, isConnected } = useAccount();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates = [
    {
      id: "basic-vesting",
      name: "Basic Vesting",
      description: "Simple token vesting contract with linear release schedule",
      features: [
        "Linear vesting over time",
        "Configurable vesting period",
        "Emergency pause functionality",
        "Owner controls",
      ],
      icon: "⏰",
      category: "Token Management",
    },
    {
      id: "multi-sig-wallet",
      name: "Multi-Signature Wallet",
      description: "Secure multi-signature wallet for team funds and governance",
      features: ["Configurable signer count", "Threshold-based approvals", "Add/remove signers", "Emergency pause"],
      icon: "🔐",
      category: "Security",
    },
    {
      id: "basic-erc20",
      name: "Basic ERC20",
      description: "Standard ERC20 token with basic functionality",
      features: ["Standard ERC20 compliance", "Mintable and burnable", "Pausable functionality", "Owner controls"],
      icon: "🪙",
      category: "Token Management",
    },
    {
      id: "reentrancy-guard",
      name: "Reentrancy Guard",
      description: "Security pattern to prevent reentrancy attacks",
      features: ["Prevents reentrancy attacks", "Easy to integrate", "Gas efficient", "Battle tested"],
      icon: "🛡️",
      category: "Security",
    },
  ];

  const handleDeployTemplate = (templateId: string) => {
    if (!isConnected) {
      toast.error("Please connect your wallet to deploy templates");
      return;
    }

    setSelectedTemplate(templateId);
    toast.info(`Preparing to deploy ${templateId} template...`);
  };

  const getTemplateDetails = (templateId: string) => {
    switch (templateId) {
      case "basic-vesting":
        return {
          code: `// Basic Vesting Contract
contract BasicVesting is Ownable, ReentrancyGuard {
    struct VestingSchedule {
        address beneficiary;
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 startTime;
        uint256 duration;
    }
    
    mapping(address => VestingSchedule) public vestingSchedules;
    
    event VestingScheduleCreated(address indexed beneficiary, uint256 amount, uint256 startTime, uint256 duration);
    event TokensReleased(address indexed beneficiary, uint256 amount);
    
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 startTime,
        uint256 duration
    ) external onlyOwner {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(amount > 0, "Amount must be greater than 0");
        require(startTime >= block.timestamp, "Start time must be in the future");
        require(duration > 0, "Duration must be greater than 0");
        
        vestingSchedules[beneficiary] = VestingSchedule({
            beneficiary: beneficiary,
            totalAmount: amount,
            releasedAmount: 0,
            startTime: startTime,
            duration: duration
        });
        
        emit VestingScheduleCreated(beneficiary, amount, startTime, duration);
    }
    
    function release() external nonReentrant {
        VestingSchedule storage schedule = vestingSchedules[msg.sender];
        require(schedule.beneficiary == msg.sender, "No vesting schedule found");
        
        uint256 releasable = getReleasableAmount(msg.sender);
        require(releasable > 0, "No tokens to release");
        
        schedule.releasedAmount += releasable;
        // Transfer logic here
        
        emit TokensReleased(msg.sender, releasable);
    }
    
    function getReleasableAmount(address beneficiary) public view returns (uint256) {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        if (block.timestamp < schedule.startTime) {
            return 0;
        }
        
        uint256 elapsed = block.timestamp - schedule.startTime;
        if (elapsed >= schedule.duration) {
            return schedule.totalAmount - schedule.releasedAmount;
        }
        
        uint256 vested = (schedule.totalAmount * elapsed) / schedule.duration;
        return vested - schedule.releasedAmount;
    }
}`,
          deploymentSteps: [
            "1. Connect your wallet to Somnia testnet",
            "2. Ensure you have STT tokens for gas fees",
            "3. Click 'Deploy Template' button",
            "4. Confirm the transaction in your wallet",
            "5. Wait for deployment confirmation",
          ],
        };
      case "multi-sig-wallet":
        return {
          code: `// Multi-Signature Wallet
contract BasicMultiSig is Ownable, ReentrancyGuard {
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
    }
    
    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmations;
    mapping(address => bool) public isSigner;
    
    uint256 public transactionCount;
    uint256 public requiredConfirmations;
    
    event TransactionSubmitted(uint256 indexed transactionId, address indexed sender, address to, uint256 value, bytes data);
    event TransactionConfirmed(uint256 indexed transactionId, address indexed signer);
    event TransactionExecuted(uint256 indexed transactionId, address indexed executor);
    
    modifier onlySigner() {
        require(isSigner[msg.sender], "Only signers can call this function");
        _;
    }
    
    constructor(address[] memory signers, uint256 _requiredConfirmations) {
        require(signers.length > 0, "At least one signer required");
        require(_requiredConfirmations > 0 && _requiredConfirmations <= signers.length, "Invalid required confirmations");
        
        for (uint256 i = 0; i < signers.length; i++) {
            isSigner[signers[i]] = true;
        }
        
        requiredConfirmations = _requiredConfirmations;
    }
    
    function submitTransaction(address to, uint256 value, bytes calldata data) external onlySigner {
        uint256 transactionId = transactionCount;
        transactions[transactionId] = Transaction({
            to: to,
            value: value,
            data: data,
            executed: false,
            confirmations: 0
        });
        
        transactionCount++;
        emit TransactionSubmitted(transactionId, msg.sender, to, value, data);
    }
    
    function confirmTransaction(uint256 transactionId) external onlySigner {
        Transaction storage transaction = transactions[transactionId];
        require(!transaction.executed, "Transaction already executed");
        require(!confirmations[transactionId][msg.sender], "Transaction already confirmed");
        
        confirmations[transactionId][msg.sender] = true;
        transaction.confirmations++;
        
        emit TransactionConfirmed(transactionId, msg.sender);
    }
    
    function executeTransaction(uint256 transactionId) external onlySigner nonReentrant {
        Transaction storage transaction = transactions[transactionId];
        require(!transaction.executed, "Transaction already executed");
        require(transaction.confirmations >= requiredConfirmations, "Insufficient confirmations");
        
        transaction.executed = true;
        
        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "Transaction execution failed");
        
        emit TransactionExecuted(transactionId, msg.sender);
    }
}`,
          deploymentSteps: [
            "1. Connect your wallet to Somnia testnet",
            "2. Prepare signer addresses array",
            "3. Set required confirmation count",
            "4. Click 'Deploy Template' button",
            "5. Confirm the transaction in your wallet",
          ],
        };
      default:
        return {
          code: "// Template code will be displayed here",
          deploymentSteps: ["Deployment steps will be shown here"],
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#121d33] text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contract Templates</h1>
          <p className="text-xl text-gray-300">Ready-to-use smart contract templates for common DeFi use cases</p>
        </div>

        {/* Wallet Connection Check */}
        {!isConnected ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
            <p className="text-gray-300 mb-6">
              Please connect your wallet to Somnia testnet to deploy contract templates.
            </p>
          </div>
        ) : (
          <>
            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
              {templates.map(template => (
                <div key={template.id} className="bg-[#1c2941] rounded-lg p-6 hover:bg-[#243a5f] transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{template.icon}</div>
                    <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">{template.category}</span>
                  </div>

                  <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                  <p className="text-gray-300 mb-4">{template.description}</p>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-purple-400 mb-2">Features:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {template.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <span className="text-green-400 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleDeployTemplate(template.id)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Deploy Template
                  </button>
                </div>
              ))}
            </div>

            {/* Template Details Modal */}
            {selectedTemplate && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-[#1c2941] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">
                        {templates.find(t => t.id === selectedTemplate)?.name} Template
                      </h2>
                      <button
                        onClick={() => setSelectedTemplate(null)}
                        className="text-gray-400 hover:text-white text-2xl"
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Code Preview */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Contract Code</h3>
                        <div className="bg-[#0f1a2e] p-4 rounded-lg overflow-x-auto">
                          <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                            {getTemplateDetails(selectedTemplate).code}
                          </pre>
                        </div>
                      </div>

                      {/* Deployment Steps */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Deployment Steps</h3>
                        <div className="bg-[#0f1a2e] p-4 rounded-lg">
                          <ol className="text-sm text-gray-300 space-y-2">
                            {getTemplateDetails(selectedTemplate).deploymentSteps.map((step, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-purple-400 mr-2 font-mono">{index + 1}.</span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>

                      {/* Deploy Button */}
                      <div className="text-center">
                        <button
                          onClick={() => {
                            toast.success(`Deploying ${selectedTemplate} template...`);
                            setSelectedTemplate(null);
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg transition-colors"
                        >
                          Deploy Template
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Contract Info */}
        <div className="mt-12 text-center">
          <div className="bg-[#1c2941] p-6 rounded-lg max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-2">Contract Information</h3>
            <p className="text-sm text-gray-300 mb-2">Contract Templates deployed at:</p>
            <code className="text-purple-400 text-sm break-all">{CONTRACT_ADDRESSES.ContractTemplates}</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractTemplatesPage;
