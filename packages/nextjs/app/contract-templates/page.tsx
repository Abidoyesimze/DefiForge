"use client";

import { useState } from "react";
import { ContractTemplatesContract } from "../../ABI";
import { toast } from "react-toastify";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

const ContractTemplatesPage = () => {
  const { address, isConnected } = useAccount();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [deploymentParams, setDeploymentParams] = useState<any>({});
  const [isDeploying, setIsDeploying] = useState(false);

  const { writeContract: deployTemplate, data: deployData } = useWriteContract();

  const { isLoading: isDeployingTx, isSuccess: isDeployed } = useWaitForTransactionReceipt({
    hash: deployData,
  });

  const templates = [
    {
      id: "basic-vesting",
      name: "Basic Vesting",
      description: "Simple token vesting contract with linear release schedule",
      features: ["Linear vesting over time", "Configurable vesting period", "Emergency pause functionality", "Owner controls"],
      icon: "⏰",
      category: "Token Management",
      contractFunction: "deployBasicVesting",
      requiredParams: ["beneficiary", "amount", "startTime", "duration"],
    },
    {
      id: "multi-sig-wallet",
      name: "Multi-Signature Wallet",
      description: "Secure multi-signature wallet for team funds and governance",
      features: ["Configurable signer count", "Threshold-based approvals", "Add/remove signers", "Emergency pause"],
      icon: "🔐",
      category: "Security",
      contractFunction: "deployBasicMultiSig",
      requiredParams: ["signers", "threshold"],
    },
    {
      id: "basic-erc20",
      name: "Basic ERC20",
      description: "Standard ERC20 token with basic functionality",
      features: ["Standard ERC20 compliance", "Mintable and burnable", "Pausable functionality", "Owner controls"],
      icon: "🪙",
      category: "Token Management",
      contractFunction: "deployBasicERC20",
      requiredParams: ["name", "symbol", "initialSupply", "decimals"],
    },
    {
      id: "reentrancy-guard",
      name: "Reentrancy Guard",
      description: "Security pattern to prevent reentrancy attacks",
      features: ["Prevents reentrancy attacks", "Easy to integrate", "Gas efficient", "Battle tested"],
      icon: "🛡️",
      category: "Security",
      contractFunction: "deployReentrancyGuard",
      requiredParams: [],
    },
  ];

  const handleDeployTemplate = (templateId: string) => {
    if (!isConnected) {
      toast.error("Please connect your wallet to deploy templates");
      return;
    }

    setSelectedTemplate(templateId);
    setDeploymentParams({});
    toast.info(`Preparing to deploy ${templateId} template...`);
  };

  const handleDeploy = () => {
    if (!selectedTemplate) return;

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    try {
      setIsDeploying(true);
      
      // Prepare deployment arguments based on template
      let args: any[] = [];
      
      switch (template.id) {
        case "basic-vesting":
          args = [
            deploymentParams.beneficiary || address,
            BigInt(deploymentParams.amount || "1000000000000000000000"), // 1000 tokens
            BigInt(deploymentParams.startTime || Math.floor(Date.now() / 1000)), // Now
            BigInt(deploymentParams.duration || "31536000"), // 1 year
          ];
          break;
        case "multi-sig-wallet":
          const signers = deploymentParams.signers ? deploymentParams.signers.split(",").map((s: string) => s.trim()) : [address];
          args = [signers, BigInt(deploymentParams.threshold || "1")];
          break;
        case "basic-erc20":
          args = [
            deploymentParams.name || "My Token",
            deploymentParams.symbol || "MTK",
            BigInt(deploymentParams.initialSupply || "1000000000000000000000"), // 1000 tokens
            BigInt(deploymentParams.decimals || "18"),
          ];
          break;
        case "reentrancy-guard":
          args = [];
          break;
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
        require(schedule.totalAmount > 0, "No vesting schedule found");
        
        uint256 releasable = getReleasableAmount(msg.sender);
        require(releasable > 0, "No tokens to release");
        
        schedule.releasedAmount += releasable;
        // Transfer logic here
        
        emit TokensReleased(msg.sender, releasable);
    }
    
    function getReleasableAmount(address beneficiary) public view returns (uint256) {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        if (schedule.totalAmount == 0) return 0;
        
        if (block.timestamp < schedule.startTime) return 0;
        
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
            "2. Fill in the deployment parameters",
            "3. Click 'Deploy Template'",
            "4. Confirm the transaction in your wallet",
            "5. Wait for deployment confirmation",
          ],
        };
      case "multi-sig-wallet":
        return {
          code: `// Basic Multi-Signature Wallet
contract BasicMultiSig is Ownable, ReentrancyGuard {
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 numConfirmations;
    }
    
    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => mapping(address => bool)) public isConfirmed;
    
    uint256 public transactionCount;
    uint256 public numRequired;
    address[] public owners;
    
    event TransactionSubmitted(uint256 indexed txId, address indexed owner, address to, uint256 value, bytes data);
    event TransactionConfirmed(uint256 indexed txId, address indexed owner);
    event TransactionExecuted(uint256 indexed txId, address indexed owner);
    
    constructor(address[] memory _owners, uint256 _numRequired) {
        require(_owners.length > 0, "Owners required");
        require(_numRequired > 0 && _numRequired <= _owners.length, "Invalid required number of owners");
        
        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid owner");
            require(!isOwner[owner], "Owner not unique");
            isOwner[owner] = true;
            owners.push(owner);
        }
        
        numRequired = _numRequired;
    }
    
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not owner");
        _;
    }
    
    function submitTransaction(address _to, uint256 _value, bytes memory _data) public onlyOwner {
        uint256 txId = transactionCount;
        
        transactions[txId] = Transaction({
            to: _to,
            value: _value,
            data: _data,
            executed: false,
            numConfirmations: 0
        });
        
        transactionCount += 1;
        
        emit TransactionSubmitted(txId, msg.sender, _to, _value, _data);
    }
    
    function confirmTransaction(uint256 _txId) public onlyOwner {
        Transaction storage transaction = transactions[_txId];
        require(!transaction.executed, "Transaction already executed");
        require(!isConfirmed[_txId][msg.sender], "Transaction already confirmed");
        
        transaction.numConfirmations += 1;
        isConfirmed[_txId][msg.sender] = true;
        
        emit TransactionConfirmed(_txId, msg.sender);
    }
    
    function executeTransaction(uint256 _txId) public onlyOwner {
        Transaction storage transaction = transactions[_txId];
        require(!transaction.executed, "Transaction already executed");
        require(transaction.numConfirmations >= numRequired, "Cannot execute transaction");
        
        transaction.executed = true;
        
        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "Transaction execution failed");
        
        emit TransactionExecuted(_txId, msg.sender);
    }
}`,
          deploymentSteps: [
            "1. Connect your wallet to Somnia testnet",
            "2. Enter signer addresses (comma-separated)",
            "3. Set the required threshold for approvals",
            "4. Click 'Deploy Template'",
            "5. Confirm the transaction in your wallet",
          ],
        };
      case "basic-erc20":
        return {
          code: `// Basic ERC20 Token
contract BasicERC20 is ERC20, Ownable, Pausable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 decimals
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply * 10**decimals);
        _decimals = decimals;
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
    
    function pause() public onlyOwner {
        _pause();
    }
    
    function unpause() public onlyOwner {
        _unpause();
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "Token transfer while paused");
    }
}`,
          deploymentSteps: [
            "1. Connect your wallet to Somnia testnet",
            "2. Enter token name and symbol",
            "3. Set initial supply and decimals",
            "4. Click 'Deploy Template'",
            "5. Confirm the transaction in your wallet",
          ],
        };
      case "reentrancy-guard":
        return {
          code: `// Reentrancy Guard
contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    
    uint256 private _status;
    
    constructor() {
        _status = _NOT_ENTERED;
    }
    
    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

// Example usage in your contract
contract MyContract is ReentrancyGuard {
    function withdraw() public nonReentrant {
        // Withdrawal logic here
        // This function cannot be re-entered
    }
}`,
          deploymentSteps: [
            "1. Connect your wallet to Somnia testnet",
            "2. Click 'Deploy Template'",
            "3. Confirm the transaction in your wallet",
            "4. Use the deployed guard in your contracts",
          ],
        };
      default:
        return { code: "", deploymentSteps: [] };
    }
  };

  const renderParameterInputs = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return null;

    switch (templateId) {
      case "basic-vesting":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Beneficiary Address</label>
              <input
                type="text"
                value={deploymentParams.beneficiary || ""}
                onChange={(e) => setDeploymentParams({...deploymentParams, beneficiary: e.target.value})}
                placeholder={address || "0x..."}
                className="w-full px-3 py-2 bg-[#0f1a2e] border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Amount (in wei)</label>
              <input
                type="text"
                value={deploymentParams.amount || ""}
                onChange={(e) => setDeploymentParams({...deploymentParams, amount: e.target.value})}
                placeholder="1000000000000000000000"
                className="w-full px-3 py-2 bg-[#0f1a2e] border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Start Time (Unix timestamp)</label>
              <input
                type="number"
                value={deploymentParams.startTime || ""}
                onChange={(e) => setDeploymentParams({...deploymentParams, startTime: e.target.value})}
                placeholder={Math.floor(Date.now() / 1000).toString()}
                className="w-full px-3 py-2 bg-[#0f1a2e] border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duration (in seconds)</label>
              <input
                type="number"
                value={deploymentParams.duration || ""}
                onChange={(e) => setDeploymentParams({...deploymentParams, duration: e.target.value})}
                placeholder="31536000"
                className="w-full px-3 py-2 bg-[#0f1a2e] border border-gray-600 rounded text-white"
              />
            </div>
          </div>
        );
      case "multi-sig-wallet":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Signer Addresses (comma-separated)</label>
              <input
                type="text"
                value={deploymentParams.signers || ""}
                onChange={(e) => setDeploymentParams({...deploymentParams, signers: e.target.value})}
                placeholder={address || "0x..."}
                className="w-full px-3 py-2 bg-[#0f1a2e] border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Required Threshold</label>
              <input
                type="number"
                value={deploymentParams.threshold || ""}
                onChange={(e) => setDeploymentParams({...deploymentParams, threshold: e.target.value})}
                placeholder="1"
                min="1"
                className="w-full px-3 py-2 bg-[#0f1a2e] border border-gray-600 rounded text-white"
              />
            </div>
          </div>
        );
      case "basic-erc20":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Token Name</label>
              <input
                type="text"
                value={deploymentParams.name || ""}
                onChange={(e) => setDeploymentParams({...deploymentParams, name: e.target.value})}
                placeholder="My Token"
                className="w-full px-3 py-2 bg-[#0f1a2e] border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Token Symbol</label>
              <input
                type="text"
                value={deploymentParams.symbol || ""}
                onChange={(e) => setDeploymentParams({...deploymentParams, symbol: e.target.value})}
                placeholder="MTK"
                className="w-full px-3 py-2 bg-[#0f1a2e] border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Initial Supply</label>
              <input
                type="text"
                value={deploymentParams.initialSupply || ""}
                onChange={(e) => setDeploymentParams({...deploymentParams, initialSupply: e.target.value})}
                placeholder="1000000000000000000000"
                className="w-full px-3 py-2 bg-[#0f1a2e] border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Decimals</label>
              <input
                type="number"
                value={deploymentParams.decimals || ""}
                onChange={(e) => setDeploymentParams({...deploymentParams, decimals: e.target.value})}
                placeholder="18"
                min="0"
                max="18"
                className="w-full px-3 py-2 bg-[#0f1a2e] border border-gray-600 rounded text-white"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#121d33] text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contract Templates</h1>
          <p className="text-xl text-gray-300">
            Ready-to-use smart contract templates for common DeFi use cases
          </p>
        </div>

        {/* Wallet Connection Check */}
        {!isConnected ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
            <p className="text-gray-300 mb-6">Please connect your wallet to Somnia testnet to deploy templates.</p>
          </div>
        ) : (
          <>
            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-[#1c2941] p-6 rounded-lg border border-gray-600 hover:border-purple-500 transition-colors cursor-pointer"
                  onClick={() => handleDeployTemplate(template.id)}
                >
                  <div className="text-4xl mb-4">{template.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-white">{template.name}</h3>
                  <p className="text-gray-300 mb-4">{template.description}</p>
                  <div className="mb-4">
                    <span className="inline-block px-2 py-1 bg-purple-600 text-white text-xs rounded">
                      {template.category}
                    </span>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-1 mb-4">
                    {template.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeployTemplate(template.id);
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
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
                      <h2 className="text-2xl font-bold text-white">
                        Deploy {templates.find(t => t.id === selectedTemplate)?.name}
                      </h2>
                      <button
                        onClick={() => setSelectedTemplate(null)}
                        className="text-gray-400 hover:text-white text-2xl"
                      >
                        ×
                      </button>
                    </div>

                    {/* Deployment Parameters */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4 text-white">Deployment Parameters</h3>
                      {renderParameterInputs(selectedTemplate)}
                    </div>

                    {/* Code Preview */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4 text-white">Code Preview</h3>
                      <div className="bg-[#0f1a2e] p-4 rounded border border-gray-600 overflow-x-auto">
                        <pre className="text-sm text-gray-300">
                          <code>{getTemplateDetails(selectedTemplate).code}</code>
                        </pre>
                      </div>
                    </div>

                    {/* Deployment Steps */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4 text-white">Deployment Steps</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-300">
                        {getTemplateDetails(selectedTemplate).deploymentSteps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Deploy Button */}
                    <div className="flex gap-4">
                      <button
                        onClick={handleDeploy}
                        disabled={isDeploying || isDeployingTx}
                        className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                          isDeploying || isDeployingTx
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : "bg-purple-600 hover:bg-purple-700 text-white"
                        }`}
                      >
                        {isDeploying || isDeployingTx ? "Deploying..." : "Deploy Template"}
                      </button>
                      <button
                        onClick={() => setSelectedTemplate(null)}
                        className="px-6 py-3 border border-gray-600 text-gray-300 hover:border-purple-500 hover:text-white rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Deployment Status */}
            {isDeployingTx && (
              <div className="max-w-4xl mx-auto mb-12">
                <div className="bg-[#1c2941] p-6 rounded-lg border border-purple-500">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mr-3"></div>
                    <span className="text-purple-400">Deploying template... Please wait for confirmation.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {isDeployed && (
              <div className="max-w-4xl mx-auto mb-12">
                <div className="bg-[#1c2941] p-6 rounded-lg border border-green-500">
                  <div className="flex items-center">
                    <div className="text-green-400 text-2xl mr-3">✅</div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Template Deployed Successfully!</h3>
                      <p className="text-gray-300">Your contract template has been deployed to the blockchain.</p>
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
            <code className="text-purple-400 text-sm break-all">{ContractTemplatesContract.address}</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractTemplatesPage;
