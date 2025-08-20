# ETN Contract Verification Guide

This guide explains how to verify the deployed DefiForge contracts on ETN testnet using the Blockscout verification API.

## 🔍 **Current Situation**

- ✅ **Contracts Deployed**: All 8 contracts successfully deployed to ETN testnet
- ❌ **Explorer Access**: ETN testnet explorer endpoints are currently not accessible
- ✅ **Blockscout API Ready**: Verification scripts prepared for when explorer becomes available

## 📋 **Deployed Contract Addresses**

| Contract | Address | Status |
|----------|---------|---------|
| **ERC20Factory** | `0xdB34E8611333Fd6dd3a57C59F125ebA8878378Cd` | ✅ Deployed |
| **ERC721Factory** | `0xB818Da67ccb75651556Fd301BCE23c6d094EFD0b` | ✅ Deployed |
| **ERC1155Factory** | `0x57999eC2a3a01D5212b1D4302991B57E98aA4CC5` | ✅ Deployed |
| **DeFiUtils** | `0x2d03D266204c1c5c4B29A36c499CA15a72b1C2A0` | ✅ Deployed |
| **ContractAnalyzer** | `0x4A4EBc7bfb813069e5495fB36B53cc937A31b441` | ✅ Deployed |
| **ContractTemplates** | `0x9f853686c5162A8E210dc9D13a8114f095Fc17F3` | ✅ Deployed |
| **MerkleProof** | `0xbF1B2ca2CC17Bd98679D584575d549c62B3214eb` | ✅ Deployed |
| **MerkleProofValidator** | `0x88deaBcDDdAD618aBd67eCBdf490f68646c088aD` | ✅ Deployed |

## 🚀 **Verification Methods**

### **Method 1: Automated Verification (When Explorer is Available)**

```bash
cd packages/hardhat
yarn verify:etn
```

This script will:
- Connect to ETN testnet
- Prepare verification payloads for each contract
- Use the Blockscout verification API
- Automatically verify all contracts

### **Method 2: Manual Verification via Explorer**

When the ETN testnet explorer becomes accessible:

1. **Visit the Explorer**: Navigate to the ETN testnet explorer
2. **Search Contracts**: Search for each contract address
3. **Verify & Publish**: Click "Verify & Publish" for each contract
4. **Upload Source**: Upload the flattened contract source code
5. **Fill Details**: Enter compiler settings and constructor arguments

### **Method 3: Hardhat Verify Plugin**

```bash
# For individual contracts
npx hardhat verify --network etn CONTRACT_ADDRESS [constructor_args]

# Examples:
npx hardhat verify --network etn 0xdB34E8611333Fd6dd3a57C59F125ebA8878378Cd
npx hardhat verify --network etn 0xB818Da67ccb75651556Fd301BCE23c6d094EFD0b
npx hardhat verify --network etn 0x57999eC2a3a01D5212b1D4302991B57E98aA4CC5
```

## 🔧 **Verification Requirements**

### **Contract Information**
- **Compiler Version**: `v0.8.20+commit.a1b79de6`
- **License Type**: `MIT`
- **Optimization**: Enabled (200 runs)
- **EVM Version**: `paris`
- **Constructor Arguments**: None (empty arrays)

### **Source Code Files**
All contract source code is available in:
- `packages/hardhat/contracts/`
- `packages/hardhat/artifacts/contracts/`

## 📡 **Blockscout API Endpoints**

The verification script will try these endpoints:

1. **Primary**: `https://testnet-explorer.electroneum.com/api/v2/smart-contracts`
2. **Alternative**: `https://explorer.electroneum.com/api/v2/smart-contracts`

## 🧪 **Testing Verification**

### **Check Explorer Status**
```bash
# Test if explorer is accessible
curl -I https://testnet-explorer.electroneum.com/
curl -I https://explorer.electroneum.com/
```

### **Test Blockscout API**
```bash
# Check if verification service is running
curl https://testnet-explorer.electroneum.com/api/v2/smart-contracts/verification/config
```

## 🎯 **Next Steps**

### **Immediate Actions**
1. **Monitor Explorer Status**: Check if ETN testnet explorer becomes accessible
2. **Test Verification Script**: Run `yarn verify:etn` when explorer is available
3. **Manual Verification**: Use manual method if automated fails

### **Alternative Approaches**
1. **Contact ETN Team**: Inquire about testnet explorer status
2. **Use Different Explorer**: Check if ETN uses a different explorer service
3. **Wait for Updates**: Monitor for explorer service updates

## 📚 **Verification Payload Format**

Based on [Blockscout verification API documentation](https://docs.blockscout.com/devs/verification/blockscout-smart-contract-verification-api), the verification payload should include:

```json
{
  "compiler_version": "v0.8.20+commit.a1b79de6",
  "license_type": "mit",
  "source_code": "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;...",
  "is_optimization_enabled": true,
  "optimization_runs": 200,
  "contract_name": "ContractName",
  "constructor_args": null,
  "evm_version": "paris"
}
```

## 🆘 **Troubleshooting**

### **Common Issues**
1. **Explorer Not Accessible**: Wait for service to become available
2. **API Endpoint Changes**: Check for updated API endpoints
3. **Network Issues**: Ensure connection to ETN testnet
4. **Contract Compilation**: Verify contracts compile successfully

### **Getting Help**
1. Check ETN testnet status
2. Monitor explorer service updates
3. Contact ETN development team
4. Use alternative verification methods

## 🎉 **Success Indicators**

Contracts are successfully verified when:
- ✅ Explorer shows "Contract Verified" badge
- ✅ Source code is visible and readable
- ✅ ABI is available for interaction
- ✅ Contract functions can be called via explorer

---

**Note**: Contract verification is currently pending due to explorer accessibility issues. All contracts are deployed and functional on ETN testnet. Verification will be completed once the explorer service becomes available. 