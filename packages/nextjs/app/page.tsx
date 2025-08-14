"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAccount } from "wagmi";
import {
  ArrowPathIcon,
  ArrowUpTrayIcon,
  BoltIcon,
  ChartBarIcon,
  ClockIcon,
  CodeBracketIcon,
  CubeIcon,
  DocumentCheckIcon,
  ScaleIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  CogIcon,
  DocumentTextIcon,
  BeakerIcon,
  KeyIcon,
  RocketLaunchIcon,
  SparklesIcon,
  GlobeAltIcon,
  CpuChipIcon,
  ServerStackIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    title: "ERC20 Factory",
    description: "Create custom ERC20 tokens with ease. Deploy tokens with custom names, symbols, and initial supplies.",
    icon: CurrencyDollarIcon,
    link: "/erc20-factory",
    color: "from-purple-500 to-pink-500",
    stats: "Instant Deployment",
    badge: "Popular",
  },
  {
    title: "DeFi Utilities",
    description: "Advanced DeFi calculations including liquidity, yield, impermanent loss, and swap fee calculations.",
    icon: ChartBarIcon,
    link: "/defi-utils",
    color: "from-blue-500 to-cyan-500",
    stats: "Real-time Calculations",
    badge: "New",
  },
  {
    title: "Contract Analyzer",
    description: "Analyze smart contracts for gas optimization, security, and deployment costs.",
    icon: BeakerIcon,
    link: "/contract-analyzer",
    color: "from-green-500 to-emerald-500",
    stats: "Gas Optimization",
    badge: "Featured",
  },
  {
    title: "Contract Templates",
    description: "Ready-to-use smart contract templates for vesting, multi-sig wallets, and more.",
    icon: DocumentTextIcon,
    link: "/contract-templates",
    color: "from-orange-500 to-red-500",
    stats: "Pre-built Templates",
    badge: "Hot",
  },
  {
    title: "Merkle Proof Validator",
    description: "Validate Merkle proofs on-chain for efficient whitelists and airdrops.",
    icon: ShieldCheckIcon,
    link: "/merkle-validator",
    color: "from-indigo-500 to-purple-500",
    stats: "Secure Validation",
    badge: "Secure",
  },
  {
    title: "Merkle Proof Generator",
    description: "Generate Merkle proofs and trees for efficient address management.",
    icon: KeyIcon,
    link: "/merkle-proof-generator",
    color: "from-teal-500 to-blue-500",
    stats: "Proof Generation",
    badge: "Essential",
  },
];

const useCases = [
  {
    title: "Token Creation",
    description: "Launch your own ERC20 tokens with custom parameters and initial distribution.",
    icon: "🪙",
    examples: ["Custom Tokens", "Token Sales", "Reward Systems"],
  },
  {
    title: "DeFi Development",
    description: "Build DeFi protocols with accurate calculations and optimized smart contracts.",
    icon: "📊",
    examples: ["Liquidity Pools", "Yield Farming", "DEX Protocols"],
  },
  {
    title: "Smart Contract Analysis",
    description: "Analyze and optimize your contracts for gas efficiency and security.",
    icon: "🔍",
    examples: ["Gas Optimization", "Security Audits", "Performance Analysis"],
  },
  {
    title: "Whitelist Management",
    description: "Create efficient whitelists and airdrops using Merkle proofs.",
    icon: "✅",
    examples: ["NFT Whitelists", "Token Airdrops", "Access Control"],
  },
  {
    title: "Contract Templates",
    description: "Use pre-built, audited contract templates for common DeFi use cases.",
    icon: "📋",
    examples: ["Vesting Contracts", "Multi-sig Wallets", "Staking Contracts"],
  },
  {
    title: "Proof Validation",
    description: "Validate proofs on-chain for secure and efficient permission systems.",
    icon: "🔐",
    examples: ["Merkle Proofs", "Zero-knowledge Proofs", "Identity Verification"],
  },
];

const stats = [
  { label: "Smart Contracts", value: "6+", description: "Deployed & Tested" },
  { label: "DeFi Tools", value: "15+", description: "Calculations Available" },
  { label: "Gas Savings", value: "40%", description: "Average Reduction" },
  { label: "Security Score", value: "9.8/10", description: "OpenZeppelin Based" },
];

const Home = () => {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  // Handle navigation to a specific feature page
  const handleNavigateToFeature = (link: string) => {
    if (isConnected) {
      router.push(link);
    } else {
      setIsButtonLoading(true);
      try {
        // This part is now handled by ScaffoldEthAppWithProviders
        // connect({ connector: connectors[0] });
        toast.info("Please connect your wallet to continue");
      } catch (error) {
        console.error("Connection error:", error);
        toast.error("Failed to connect wallet. Please try again.");
      } finally {
        setIsButtonLoading(false);
      }
    }
  };

  // Effect to redirect once connected
  useEffect(() => {
    if (isConnected && isButtonLoading) {
      setIsButtonLoading(false);
    }
  }, [isConnected, isButtonLoading]);

  // Auto-rotate featured features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    // Always use dark theme for content area regardless of site-wide theme setting
    <div className="bg-[#121d33]">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center py-20">
          <div className="relative">
            {/* Animated background elements */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white relative z-10">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                DefiForge
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-purple-400 mb-4 font-semibold">
              The Ultimate DeFi Development Toolkit
            </p>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Build, analyze, and deploy DeFi protocols with our comprehensive suite of smart contract tools. 
              From token creation to advanced analytics, we've got everything you need to build the future of finance.
            </p>
            
            {/* Network Badge */}
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                Live on Somnia Testnet • Chain ID: 50312
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => handleNavigateToFeature("/erc20-factory")}
                className={`group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:from-purple-700 hover:to-pink-700 hover:scale-105 hover:shadow-2xl ${
                  isButtonLoading ? "opacity-75 cursor-wait" : ""
                }`}
                disabled={isButtonLoading}
              >
                <span className="flex items-center justify-center">
                  <RocketLaunchIcon className="w-6 h-6 mr-2 group-hover:animate-bounce" />
                  {isButtonLoading ? "Connecting..." : isConnected ? "Start Building" : "Connect Wallet to Start"}
                </span>
              </button>
              <button
                onClick={() => router.push("/contract-analyzer")}
                className="group px-8 py-4 bg-transparent border-2 border-purple-600 text-purple-400 hover:text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-purple-600 hover:scale-105 hover:shadow-xl"
              >
                <span className="flex items-center justify-center">
                  <BeakerIcon className="w-6 h-6 mr-2 group-hover:animate-pulse" />
                  Analyze Contracts
                </span>
              </button>
            </div>
            
            {/* Quick Navigation */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-4xl mx-auto">
              {features.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigateToFeature(feature.link)}
                  className="group p-3 bg-[#1c2941] hover:bg-[#243a5f] rounded-lg border border-gray-600 hover:border-purple-500 transition-all duration-300 hover:scale-105"
                >
                  <div className="text-center">
                    <feature.icon className="w-6 h-6 mx-auto mb-2 text-purple-400 group-hover:text-white transition-colors" />
                    <span className="text-xs text-gray-300 group-hover:text-white transition-colors font-medium">
                      {feature.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Network Information Section */}
        <div className="py-12 bg-[#1c2941] rounded-lg border border-gray-600">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">🌐 Built on <span className="text-purple-400">Somnia Testnet</span></h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              DefiForge is deployed on Somnia Network's testnet, providing a fast, secure, and cost-effective environment for DeFi development and testing.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-4">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold text-white mb-1">Fast Transactions</h3>
              <p className="text-sm text-gray-400">Sub-second finality</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl mb-2">💰</div>
              <h3 className="font-semibold text-white mb-1">Low Gas Fees</h3>
              <p className="text-sm text-gray-400">Fraction of Ethereum costs</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl mb-2">🔒</div>
              <h3 className="font-semibold text-white mb-1">Secure</h3>
              <p className="text-sm text-gray-400">EVM compatible</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl mb-2">🌍</div>
              <h3 className="font-semibold text-white mb-1">Testnet Ready</h3>
              <p className="text-sm text-gray-400">Free STT tokens available</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-[#0f1a2e] rounded-lg border border-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm text-gray-300">Chain ID: 50312 • RPC: dream-rpc.somnia.network</span>
            </div>
          </div>
        </div>

        {/* What is DefiForge Section */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">What is <span className="text-purple-400">DefiForge</span>?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              DefiForge is a comprehensive DeFi development platform that provides developers with all the tools they need to build, deploy, and manage decentralized finance applications.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-[#1c2941] p-8 rounded-lg border border-gray-600">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-4 text-white">For Developers</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Pre-built, audited smart contract templates</li>
                <li>• Advanced DeFi calculation utilities</li>
                <li>• Gas optimization and contract analysis tools</li>
                <li>• Merkle proof generation and validation</li>
                <li>• ERC20 token factory with custom parameters</li>
              </ul>
            </div>
            
            <div className="bg-[#1c2941] p-8 rounded-lg border border-gray-600">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-xl font-semibold mb-4 text-white">For Projects</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Rapid token deployment and management</li>
                <li>• Efficient whitelist and airdrop systems</li>
                <li>• Professional-grade contract templates</li>
                <li>• Cost-effective gas optimization</li>
                <li>• Cross-chain compatibility ready</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="bg-gradient-to-br from-[#1c2941] to-[#243a5f] p-6 rounded-xl border border-gray-600 hover:border-purple-500 transition-colors duration-300">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold text-purple-400 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-sm text-gray-400">
                    {stat.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-16">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">
            Why Choose <span className="text-purple-400">DefiForge</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-xl bg-gradient-to-br from-[#1c2941] to-[#243a5f] hover:from-[#243a5f] hover:to-[#1c2941] transition-all duration-300 hover:scale-105 border border-gray-600 hover:border-purple-500">
              <div className="text-center">
                <div className="inline-flex p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BoltIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">Production Ready</h3>
                <p className="text-gray-300 leading-relaxed">
                  All contracts are deployed on Somnia testnet and ready for production use. 
                  Built with OpenZeppelin standards and best practices.
                </p>
              </div>
            </div>
            
            <div className="group p-8 rounded-xl bg-gradient-to-br from-[#1c2941] to-[#243a5f] hover:from-[#243a5f] hover:to-[#1c2941] transition-all duration-300 hover:scale-105 border border-gray-600 hover:border-purple-500">
              <div className="text-center">
                <div className="inline-flex p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheckIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">Security First</h3>
                <p className="text-gray-300 leading-relaxed">
                  Built with OpenZeppelin contracts and best practices for maximum security. 
                  Comprehensive testing and auditing included.
                </p>
              </div>
            </div>
            
            <div className="group p-8 rounded-xl bg-gradient-to-br from-[#1c2941] to-[#243a5f] hover:from-[#243a5f] hover:to-[#1c2941] transition-all duration-300 hover:scale-105 border border-gray-600 hover:border-purple-500">
              <div className="text-center">
                <div className="inline-flex p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                  <CogIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">Developer Friendly</h3>
                <p className="text-gray-300 leading-relaxed">
                  Easy-to-use interfaces and comprehensive documentation for developers. 
                  Built by developers, for developers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Core Features</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to build, deploy, and manage DeFi protocols
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1c2941] to-[#243a5f] hover:from-[#243a5f] hover:to-[#1c2941] transition-all duration-500 hover:scale-105 cursor-pointer border border-gray-600 hover:border-purple-500 ${
                  activeFeature === index ? 'ring-2 ring-purple-500 ring-opacity-50' : ''
                }`}
                onClick={() => handleNavigateToFeature(feature.link)}
              >
                {/* Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                    {feature.badge}
                  </span>
                </div>
                
                {/* Icon */}
                <div className={`p-6 bg-gradient-to-r ${feature.color} rounded-t-xl`}>
                  <feature.icon className="h-12 w-12 text-white" />
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-purple-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-400 font-medium">
                      {feature.stats}
                    </span>
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <ArrowUpTrayIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Use Cases</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover how DefiForge can power your next DeFi project
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div 
                key={index} 
                className="group p-6 rounded-xl bg-gradient-to-br from-[#1c2941] to-[#243a5f] hover:from-[#243a5f] hover:to-[#1c2941] transition-all duration-300 hover:scale-105 border border-gray-600 hover:border-purple-500"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {useCase.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-purple-400 transition-colors">
                  {useCase.title}
                </h3>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  {useCase.description}
                </p>
                
                {/* Examples */}
                <div className="space-y-2">
                  {useCase.examples.map((example, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-400">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      {example}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">How It Works</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Get started with DefiForge in just a few simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Connect Wallet", desc: "Connect your wallet to Somnia testnet", icon: "🔗" },
              { step: "2", title: "Choose Feature", desc: "Select the DeFi tool you need", icon: "🛠️" },
              { step: "3", title: "Interact", desc: "Use the tool with your parameters", icon: "⚡" },
              { step: "4", title: "Deploy", desc: "Deploy or use the generated results", icon: "🚀" },
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                    {item.step}
                  </div>
                  <div className="text-4xl absolute -top-2 -right-2 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-purple-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 text-center relative">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
          </div>
          
          <h2 className="text-4xl font-bold mb-6 text-white">
            Ready to Build the <span className="text-purple-400">Future of DeFi</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join thousands of developers building the next generation of decentralized finance with DefiForge
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => handleNavigateToFeature("/erc20-factory")}
              className={`group relative px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:from-purple-700 hover:to-pink-700 hover:scale-105 hover:shadow-2xl ${
                isButtonLoading ? "opacity-75 cursor-wait" : ""
              }`}
              disabled={isButtonLoading}
            >
              <span className="flex items-center justify-center">
                <RocketLaunchIcon className="w-6 h-6 mr-2 group-hover:animate-bounce" />
                {isButtonLoading ? "Connecting..." : isConnected ? "Start Building Now" : "Connect Wallet to Continue"}
              </span>
            </button>
            
            <button
              onClick={() => router.push("/contract-analyzer")}
              className="group px-10 py-4 bg-transparent border-2 border-purple-600 text-purple-400 hover:text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-purple-600 hover:scale-105 hover:shadow-xl"
            >
              <span className="flex items-center justify-center">
                <BeakerIcon className="w-6 h-6 mr-2 group-hover:animate-pulse" />
                Explore Tools
              </span>
            </button>
          </div>
          
          {/* Additional info */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-semibold text-white mb-1">Lightning Fast</h4>
              <p className="text-sm text-gray-400">Deploy contracts in seconds</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🔒</div>
              <h4 className="font-semibold text-white mb-1">Secure by Design</h4>
              <p className="text-sm text-gray-400">Built with security first</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🌐</div>
              <h4 className="font-semibold text-white mb-1">Cross-Chain Ready</h4>
              <p className="text-sm text-gray-400">Deploy anywhere</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
