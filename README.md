# DefiForge 🚀

**The Ultimate DeFi Development Toolkit**

DefiForge is a comprehensive DeFi development platform that provides developers with all the tools they need to build, deploy, and manage decentralized finance applications.

## 🌟 Features

- **ERC20 Factory**: Create custom ERC20 tokens with ease
- **DeFi Utilities**: Advanced DeFi calculations and analytics
- **Contract Analyzer**: Analyze smart contracts for optimization
- **Contract Templates**: Ready-to-use smart contract templates
- **Merkle Proof Validator**: Validate Merkle proofs on-chain
- **Merkle Proof Generator**: Generate Merkle proofs and trees

## 🏗️ Tech Stack

- **Smart Contracts**: Solidity, OpenZeppelin, Hardhat
- **Frontend**: Next.js 13+, React, TypeScript
- **Blockchain**: Somnia Testnet (Chain ID: 50312)
- **Web3**: Wagmi, RainbowKit, Ethers.js
- **Styling**: Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Yarn package manager
- MetaMask or compatible wallet
- Somnia testnet configured

### Installation

```bash
# Install dependencies
yarn install

# Start local development
yarn start

# Deploy contracts (requires .env setup)
yarn deploy:somnia
```

### Environment Setup

Create a `.env` file in the root directory:

```env
SOMNIA_PRIVATE_KEY=your_private_key_here
```

## 🌐 Network Information

- **Network**: Somnia Testnet
- **Chain ID**: 50312
- **RPC URL**: https://dream-rpc.somnia.network/
- **Block Explorer**: https://shannon-explorer.somnia.network/
- **Currency**: STT (Somnia Test Token)

## 📁 Project Structure

```
DefiForge/
├── packages/
│   ├── hardhat/          # Smart contracts & deployment
│   └── nextjs/           # Frontend application
├── contracts/             # Deployed contract addresses
├── ABI/                  # Contract ABIs
└── README.md
```

## 🔧 Development

### Smart Contracts

```bash
cd packages/hardhat

# Compile contracts
yarn compile

# Run tests
yarn test

# Deploy to Somnia testnet
yarn deploy:somnia
```

### Frontend

```bash
cd packages/nextjs

# Start development server
yarn dev

# Build for production
yarn build
```

## 🧪 Testing

All smart contracts include comprehensive test suites:

```bash
yarn test                    # Run all tests
yarn test:gas               # Gas optimization tests
yarn test:coverage          # Test coverage report
```

## 🚀 Deployment

### Smart Contracts

Contracts are deployed to Somnia testnet and ready for production use.

### Frontend

```bash
# Deploy to Vercel
yarn vercel

# Deploy to IPFS
yarn ipfs
```

## 📚 Documentation

- [Somnia Network Docs](https://docs.somnia.network/)
- [Scaffold-ETH 2](https://docs.scaffoldeth.io/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## �� Acknowledgments

- Built with [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2)
- Smart contracts based on [OpenZeppelin](https://openzeppelin.com/)
- Deployed on [Somnia Network](https://somnia.network/)

---

**Built with ❤️ for the DeFi community**
