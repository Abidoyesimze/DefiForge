# Deploying DefiForge Contracts to ETN Testnet

This guide explains how to deploy all DefiForge smart contracts to the ETN (Electroneum) testnet.

## 🚀 Prerequisites

1. **ETN Testnet Account**: You need an account on ETN testnet with some ETN tokens for gas fees
2. **Private Key**: Your account's private key (keep this secure!)
3. **Environment Setup**: Hardhat and all dependencies installed

## ⚙️ Configuration

### 1. Set Environment Variables

Create or update your `.env` file in the `packages/hardhat/` directory:

```bash
# ETN Testnet Private Key
ETN_PRIVATE_KEY=your_private_key_here

# Optional: Other networks
SOMNIA_PRIVATE_KEY=your_somnia_private_key_here
```

### 2. Verify Hardhat Config

The Hardhat configuration already includes ETN testnet:
- **Network Name**: `etn`
- **Chain ID**: `5201420`
- **RPC URL**: `https://testnet-rpc.electroneum.com/`
- **Explorer**: `https://testnet-explorer.electroneum.com/`

## 🧪 Testing Connection

Before deploying, test your connection to ETN testnet:

```bash
cd packages/hardhat
yarn test:etn
```

This will:
- Verify network connection
- Check your account balance
- Confirm gas price availability
- Validate deployment readiness

## 🚀 Deployment

### Deploy All Contracts

To deploy all contracts to ETN testnet:

```bash
cd packages/hardhat
yarn deploy:etn
```

This will deploy:
- ✅ ERC20Factory
- ✅ ERC721Factory  
- ✅ ERC1155Factory
- ✅ DeFiUtils
- ✅ ContractAnalyzer
- ✅ ContractTemplates
- ✅ MerkleProof
- ✅ MerkleProofValidator

### Deployment Process

1. **Compilation**: Contracts are compiled automatically
2. **Deployment**: Each contract is deployed sequentially
3. **Verification**: Contracts are verified on ETN Explorer
4. **Documentation**: Deployment info is saved to `deployments/etn-testnet.json`

## 📋 Deployment Output

After successful deployment, you'll see:

```
🎉 All contracts deployed successfully to ETN Testnet!

📋 Deployment Summary:
ERC20Factory: 0x...
ERC721Factory: 0x...
ERC1155Factory: 0x...
DeFiUtils: 0x...
ContractAnalyzer: 0x...
ContractTemplates: 0x...
MerkleProof: 0x...
MerkleProofValidator: 0x...
```

## 🔍 Verification

Contracts are automatically verified on ETN Explorer. If verification fails, you can manually verify using:

```bash
npx hardhat verify --network etn CONTRACT_ADDRESS [constructor_args]
```

## 📁 Deployment Files

Deployment information is saved to:
- `deployments/etn-testnet.json` - Complete deployment details
- `artifacts/` - Contract ABIs and bytecode

## 🎯 Next Steps

After deployment:

1. **Update Frontend**: Update contract addresses in `packages/nextjs/ABI/index.ts`
2. **Test Contracts**: Test all functionality on ETN testnet
3. **Update Documentation**: Update README files with new addresses
4. **User Testing**: Allow users to test on ETN testnet

## 🆘 Troubleshooting

### Common Issues

1. **Insufficient Balance**: Ensure you have enough ETN for gas fees
2. **Network Issues**: Check RPC URL and network configuration
3. **Verification Failures**: Some contracts may need manual verification
4. **Gas Estimation**: If gas estimation fails, contracts will use fallback values

### Getting Help

- Check the Hardhat error logs
- Verify your `.env` configuration
- Ensure you're connected to ETN testnet
- Check ETN testnet status and RPC availability

## 🌐 Network Information

- **Network Name**: ETN Testnet
- **Chain ID**: 5201420
- **Currency**: ETN (Electroneum Test Token)
- **Decimals**: 18
- **RPC URL**: https://testnet-rpc.electroneum.com/
- **Explorer**: https://testnet-explorer.electroneum.com/

## 📞 Support

For issues with ETN testnet deployment:
1. Check ETN testnet status
2. Verify RPC endpoint availability
3. Ensure sufficient balance for gas fees
4. Check contract compilation status

---

**Happy Deploying! 🚀** 