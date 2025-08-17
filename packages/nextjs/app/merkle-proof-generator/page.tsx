"use client";

import { useState, useEffect } from "react";
import {
  useIsNewcomer,
  useMerkleContract,
  useMerkleRootValid,
  useMerkleTreeInfo,
  usePlatformFee,
} from "../../components/UseMerkleContract";
import { generateMerkleTree as buildMerkleTree } from "../../utils/Merkle";
import { MerkleTree } from "../../utils/Merkle";
import { ethers } from "ethers";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import type { ParseResult } from "papaparse";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatEther } from "viem";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import {
  CheckCircleIcon,
  ClipboardDocumentIcon,
  CodeBracketIcon,
  DocumentCheckIcon,
  TrashIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { MerkleProofContract } from "../../ABI";

// Define interface for tree info
interface TreeInfo {
  description: string;
  creator: string;
  listSize: number;
  timestamp: number;
}

const MerkleGenerator = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // UI state
  const [addresses, setAddresses] = useState<string[]>([]);
  const [inputAddress, setInputAddress] = useState("");
  const [merkleRoot, setMerkleRoot] = useState("");
  const [merkleTree, setMerkleTree] = useState<MerkleTree | null>(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [proof, setProof] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [treeDescription, setTreeDescription] = useState("");
  const [showContractSection, setShowContractSection] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [txStatus, setTxStatus] = useState("");

  // Contract read hooks
  const {
    isNewcomer: isNewcomerStatus,
    isLoading: newcomerLoading,
    isError: newcomerError,
  } = useIsNewcomer();

  const {
    addMerkleTree,
    removeMerkleTree,
    updateTreeDescription,
    isLoading: isContractLoading,
  } = useMerkleContract();

  const {
    isValid: merkleRootValid,
    isLoading: rootCheckLoading,
    isError: rootCheckError,
  } = useMerkleRootValid(merkleRoot);

  const {
    treeInfo: treeInfoData,
    isLoading: treeInfoLoading,
    isError: treeInfoError,
  } = useMerkleTreeInfo(merkleRoot);

  const {
    fee: platformFee,
    isLoading: feeLoading,
    isError: feeError,
  } = usePlatformFee();

  // Format tree info
  const formattedTreeInfo = treeInfoData as TreeInfo | null;

  // Check if any operation is loading
  const isPageLoading =
    isLoading || isContractLoading || rootCheckLoading || feeLoading || newcomerLoading || treeInfoLoading;

  const validateAddress = (address: string) => {
    try {
      return ethers.isAddress(address.toLowerCase());
    } catch (error) {
      return false;
    }
  };

  const handleAddAddress = () => {
    if (!inputAddress.trim()) {
      toast.error("Please enter an address");
      return;
    }

    const normalizedAddress = inputAddress.trim().toLowerCase();
    if (!validateAddress(normalizedAddress)) {
      toast.error("Invalid Ethereum address");
      return;
    }

    if (addresses.includes(normalizedAddress)) {
      toast.warning("Address already added");
      return;
    }

    setAddresses(prevAddresses => {
      const newAddresses = [...prevAddresses, normalizedAddress];
      generateMerkleTree(newAddresses);
      return newAddresses;
    });
    setInputAddress("");
    toast.success("Address added successfully");
  };

  const handleRemoveAddress = (addressToRemove: string) => {
    setAddresses(prevAddresses => {
      const newAddresses = prevAddresses.filter(addr => addr !== addressToRemove);
      generateMerkleTree(newAddresses);
      return newAddresses;
    });
    toast.info("Address removed");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = e => {
      try {
        const text = e.target?.result as string | undefined;
        if (!text) {
          toast.error("Error reading file");
          setIsLoading(false);
          return;
        }
        Papa.parse(text, {
          complete: (results: ParseResult<string[]>) => {
            const lines = results.data
              .flat()
              .map((line: string | number) => (typeof line === "string" ? line.trim() : String(line).trim()))
              .filter((line: string) => line)
              .map((line: string) => line.toLowerCase());

            const validAddresses = lines.filter((addr: string) => validateAddress(addr));
            const invalidAddresses = lines.filter((addr: string) => !validateAddress(addr) && addr.length > 0);

            if (validAddresses.length > 0) {
              setAddresses(prevAddresses => {
                const newAddresses = [...new Set([...prevAddresses, ...validAddresses])];
                generateMerkleTree(newAddresses);
                return newAddresses;
              });
              toast.success(`Added ${validAddresses.length} valid addresses`);
            }

            if (invalidAddresses.length > 0) {
              toast.error(`Found ${invalidAddresses.length} invalid addresses`);
            }
          },
          error: (error: any) => {
            toast.error("Error parsing file: " + error.message);
          },
        });
      } catch (error) {
        toast.error("Error processing file");
        console.error(error);
      } finally {
        setIsLoading(false);
        if (event.target) {
          event.target.value = "";
        }
      }
    };

    reader.onerror = () => {
      toast.error("Error reading file");
      setIsLoading(false);
      if (event.target) {
        event.target.value = "";
      }
    };

    reader.readAsText(file);
  };

  const handlePasteAddresses = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    const lines = text
      .split(/[\n,]/) // Split by newlines or commas
      .map(line => line.trim())
      .filter(line => line)
      .map(line => line.toLowerCase());

    const validAddresses = lines.filter(addr => validateAddress(addr));
    const invalidAddresses = lines.filter(addr => !validateAddress(addr) && addr.length > 0);

    if (validAddresses.length > 0) {
      setAddresses(prevAddresses => {
        const newAddresses = [...new Set([...prevAddresses, ...validAddresses])];
        generateMerkleTree(newAddresses);
        return newAddresses;
      });
      toast.success(`Added ${validAddresses.length} valid addresses`);
    } else {
      toast.warning("No valid addresses found in pasted text");
    }

    if (invalidAddresses.length > 0) {
      toast.error(`Found ${invalidAddresses.length} invalid addresses`);
    }

    event.target.value = "";
  };

  const generateMerkleTree = (addressList: string[]) => {
    if (!addressList || addressList.length === 0) {
      setMerkleTree(null);
      setMerkleRoot("");
      return null;
    }

    try {
      const tree = buildMerkleTree(addressList);
      setMerkleTree(tree);
      setMerkleRoot(tree.getHexRoot());
      return tree;
    } catch (error) {
      toast.error("Error generating Merkle tree");
      console.error(error);
      return null;
    }
  };

  const handleGenerateProof = (address: string) => {
    if (!merkleTree || !address) return;

    try {
      const proof = merkleTree.getHexProof(ethers.keccak256(address));
      setProof(proof);
      setSelectedAddress(address);
      toast.success("Proof generated successfully");
    } catch (error) {
      toast.error("Error generating proof");
      console.error(error);
    }
  };

  const downloadProof = () => {
    if (!proof.length) return;

    const proofData = {
      address: selectedAddress,
      proof: proof,
      merkleRoot: merkleRoot,
    };

    const blob = new Blob([JSON.stringify(proofData, null, 2)], { type: "application/json" });
    saveAs(blob, `merkle-proof-${selectedAddress.slice(0, 8)}.json`);
    toast.success("Proof downloaded successfully");
  };

  const downloadAllData = () => {
    if (!merkleTree || !addresses.length) return;

    const allData = {
      merkleRoot,
      addresses,
      proofs: addresses.map(address => ({
        address,
        proof: merkleTree.getHexProof(ethers.keccak256(address)),
      })),
    };

    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
    saveAs(blob, `merkle-tree-data.json`);
    toast.success("All data downloaded successfully");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Contract interaction handlers
  const handlePublishMerkleRoot = async () => {
    if (!merkleRoot || !addresses.length || !treeDescription) {
      toast.error("Missing required information to publish Merkle root");
      return;
    }

    if (!addMerkleTree) {
      toast.error("Contract function not available");
      return;
    }

    try {
      setTxStatus("pending");
      // Fee calculation - if newcomer, fee is 0
      const fee = isNewcomerStatus ? 0n : BigInt(platformFee || "0");

      const hash = await addMerkleTree(merkleRoot, treeDescription, addresses.length, fee);
      setTxHash(hash);
      setTxStatus("confirmed");
      toast.success("Merkle root successfully published to the blockchain!");
    } catch (error) {
      console.error("Error publishing Merkle root:", error);
      setTxStatus("failed");

      // User-friendly error messages
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as any).message === "string"
      ) {
        if ((error as any).message.includes("user rejected")) {
          toast.error("Transaction was rejected");
        } else if ((error as any).message.includes("insufficient funds")) {
          toast.error("Insufficient funds in your wallet");
        } else {
          toast.error(`Error: ${(error as any).message || "Transaction failed"}`);
        }
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };

  const handleRemoveMerkleRoot = async () => {
    if (!merkleRoot) {
      toast.error("No Merkle root selected");
      return;
    }

    if (!merkleRootValid) {
      toast.error("This Merkle root is not registered in the contract");
      return;
    }

    if (formattedTreeInfo && formattedTreeInfo.creator !== connectedAddress) {
      toast.error("Only the creator can remove this Merkle tree");
      return;
    }

    if (!removeMerkleTree) {
      toast.error("Contract function not available");
      return;
    }

    if (window.confirm("Are you sure you want to remove this Merkle tree? This action cannot be undone.")) {
      try {
        setTxStatus("pending");
        const hash = await removeMerkleTree(merkleRoot);
        setTxHash(hash);
        setTxStatus("confirmed");
        toast.success("Merkle root successfully removed from the blockchain!");
      } catch (error: unknown) {
        console.error("Error removing Merkle root:", error);
        setTxStatus("failed");

        if (typeof error === "object" && error !== null && "message" in error) {
          const errorMessage = (error as { message: string }).message;
          if (errorMessage.includes("user rejected")) {
            toast.error("Transaction was rejected");
          } else {
            toast.error(`Error: ${errorMessage || "Transaction failed"}`);
          }
        } else {
          toast.error("An unknown error occurred");
        }
      }
    }
  };

  const handleUpdateDescription = async () => {
    if (!merkleRoot || !treeDescription) {
      toast.error("Please provide a new description");
      return;
    }

    if (!merkleRootValid) {
      toast.error("This Merkle root is not registered in the contract");
      return;
    }

    if (formattedTreeInfo && formattedTreeInfo.creator !== connectedAddress) {
      toast.error("Only the creator can update this Merkle tree's description");
      return;
    }

    if (!updateTreeDescription) {
      toast.error("Contract function not available");
      return;
    }

    try {
      setTxStatus("pending");
      const hash = await updateTreeDescription(merkleRoot, treeDescription);
      setTxHash(hash);
      setTxStatus("confirmed");
      toast.success("Merkle tree description successfully updated!");
    } catch (error: unknown) {
      console.error("Error updating description:", error);
      setTxStatus("failed");

      if (typeof error === "object" && error !== null && "message" in error) {
        const errorMessage = (error as { message: string }).message;
        if (errorMessage.includes("user rejected")) {
          toast.error("Transaction was rejected");
        } else {
          toast.error(`Error: ${errorMessage || "Transaction failed"}`);
        }
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };

  // Format timestamp to date
  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return "";
    try {
      return new Date(timestamp * 1000).toLocaleString();
    } catch (error) {
      return "";
    }
  };

  return (
    <div className="bg-[#121d33] text-white">
      {/* ToastContainer for notifications */}
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

      <div className="max-w-4xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">DefiForge Merkle Proof Generator</h2>

            {/* Wallet Connection */}
            <div>
              {!isConnected ? (
                <button
                  onClick={() => {
                    connect({ connector: connectors[0] });
                    toast.info("Connecting wallet...");
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-300">
                    {connectedAddress?.slice(0, 6)}...{connectedAddress?.slice(-4)}
                  </span>
                  <button
                    onClick={() => {
                      disconnect();
                      toast.info("Wallet disconnected");
                    }}
                    className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors text-sm"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="text-gray-300 mb-4">
            Generate Merkle proofs for your whitelist, airdrop, or any other permissioned system. Upload addresses, get
            your Merkle root and proofs.
          </p>

          <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-800">
            <h3 className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
              <CodeBracketIcon className="h-5 w-5" />
              Developer Note
            </h3>
            <p className="text-sm text-purple-300">
              Use the Merkle root in your smart contract. Users can later submit their proof to verify eligibility. This
              saves gas by not storing the entire list on-chain.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* File Upload Section */}
          <div className="rounded-lg p-6 bg-[#1c2941]">
            <h3 className="text-lg font-semibold mb-4 text-white">Upload Addresses</h3>
            <div className="space-y-4">
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-purple-900/30 file:text-purple-300
                  hover:file:bg-purple-900/40
                  dark:hover:file:text-purple-300
                  file:transition-colors"
                disabled={isPageLoading}
              />
              <p className="text-sm text-gray-400">Upload a CSV or TXT file with one address per line</p>
            </div>
          </div>

          {/* Paste Addresses Section */}
          <div className="rounded-lg p-6 bg-[#1c2941]">
            <h3 className="text-lg font-semibold mb-4 text-white">Add Multiple Addresses</h3>
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  placeholder="Paste addresses here (one per line or comma-separated)"
                  onChange={handlePasteAddresses}
                  className="block w-full p-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-700 text-white"
                  disabled={isPageLoading}
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Address Input Section */}
          <div className="rounded-lg p-6 bg-[#1c2941]">
            <h3 className="text-lg font-semibold mb-4 text-white">Add Single Address</h3>
            <div className="flex space-x-4">
              <input
                type="text"
                value={inputAddress}
                onChange={e => setInputAddress(e.target.value)}
                placeholder="Enter Ethereum address"
                className="flex-1 p-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-700 text-white"
                disabled={isPageLoading}
              />
              <button
                onClick={handleAddAddress}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                disabled={isPageLoading || !inputAddress.trim()}
              >
                Add
              </button>
            </div>
          </div>

          {/* Address List Section */}
          <div className="rounded-lg p-6 bg-[#1c2941]">
            <h3 className="text-lg font-semibold mb-4 text-white">Addresses List</h3>
            {addresses.length === 0 ? (
              <p className="text-gray-400">No addresses added yet</p>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-400">
                    Total Addresses: <span className="font-semibold">{addresses.length}</span>
                  </p>
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to clear all addresses?")) {
                        setAddresses([]);
                        setMerkleTree(null);
                        setMerkleRoot("");
                        setProof([]);
                        setSelectedAddress("");
                        toast.info("All addresses cleared");
                      }
                    }}
                    className="text-xs text-red-400 hover:text-red-300"
                    disabled={isPageLoading}
                  >
                    Clear All
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto border border-gray-700 rounded-lg">
                  <ul className="divide-y divide-gray-700">
                    {addresses.map(address => (
                      <li key={address} className="p-3 flex items-center justify-between text-sm hover:bg-gray-700">
                        <span className="text-gray-200 font-mono truncate max-w-xs">{address}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRemoveAddress(address)}
                            className="text-red-400 hover:text-red-300"
                            title="Remove Address"
                            disabled={isPageLoading}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleGenerateProof(address)}
                            className="text-green-400 hover:text-green-300"
                            title="Generate Proof"
                            disabled={isPageLoading}
                          >
                            <DocumentCheckIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Merkle Root Display */}
          {merkleRoot && (
            <div className="rounded-lg p-6 bg-[#1c2941]">
              <h3 className="text-lg font-semibold mb-4 text-white">Merkle Root</h3>
              <div className="flex items-center space-x-2 overflow-x-auto mb-4 bg-gray-700 p-3 rounded">
                <span className="text-sm font-mono text-gray-300 break-all">{merkleRoot}</span>
                <button
                  onClick={() => copyToClipboard(merkleRoot)}
                  className="text-purple-400 ml-2 flex-shrink-0"
                  title="Copy to Clipboard"
                >
                  <ClipboardDocumentIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Root Status & Contract Interaction Section */}
              {isConnected && (
                <div className="space-y-4">
                  {/* Root status */}
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h4 className="text-sm font-medium mb-2 text-gray-300">Blockchain Status</h4>

                    {rootCheckLoading ? (
                      <p className="text-sm text-gray-400">Checking root status...</p>
                    ) : merkleRootValid ? (
                      <div className="space-y-2">
                        <div className="flex items-center text-green-400 text-sm">
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          <span>Root is registered on-chain</span>
                        </div>

                        {formattedTreeInfo && (
                          <div className="mt-2 text-sm text-gray-300">
                            <p>
                              <span className="font-medium">Description:</span> {formattedTreeInfo.description}
                            </p>
                            <p>
                              <span className="font-medium">Creator:</span> {formattedTreeInfo.creator?.slice(0, 6)}...
                              {formattedTreeInfo.creator?.slice(-4)}
                            </p>
                            <p>
                              <span className="font-medium">Size:</span> {formattedTreeInfo.listSize} addresses
                            </p>
                            <p>
                              <span className="font-medium">Created:</span> {formatDate(formattedTreeInfo.timestamp)}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-400 text-sm">
                        <XCircleIcon className="h-5 w-5 mr-2" />
                        <span>Root is not yet registered on-chain</span>
                      </div>
                    )}
                  </div>

                  {/* Contract interaction buttons */}
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => {
                        setShowContractSection(!showContractSection);
                        if (!showContractSection) {
                          toast.info("Expanded blockchain operations");
                        }
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {showContractSection ? "Hide Contract Options" : "Manage on Blockchain"}
                    </button>
                  </div>

                  {/* Contract interaction section */}
                  {showContractSection && (
                    <div className="mt-4 p-4 border border-gray-700 rounded-lg">
                      <h4 className="text-lg font-medium mb-4 text-gray-200">Blockchain Operations</h4>

                      {/* Description input */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Tree Description</label>
                        <input
                          type="text"
                          value={treeDescription}
                          onChange={e => setTreeDescription(e.target.value)}
                          placeholder="e.g., NFT Whitelist Phase 1"
                          className="w-full p-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-700 text-white"
                          disabled={isPageLoading}
                        />
                      </div>

                      {/* Fee info */}
                      {typeof platformFee === "string" && BigInt(platformFee) > 0 && (
                        <div className="mb-4 p-3 bg-gray-700 rounded-lg text-sm">
                          <p className="text-gray-300">
                            <span className="font-medium">Platform Fee:</span>{" "}
                            {typeof platformFee === "string" ? formatEther(BigInt(platformFee)) : "0"} ETH
                            {isNewcomerStatus === true && (
                              <span className="ml-2 text-green-400">(First tree is free!)</span>
                            )}
                          </p>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Publish button */}
                        <button
                          onClick={handlePublishMerkleRoot}
                          disabled={isPageLoading || !merkleRoot || !treeDescription || Boolean(merkleRootValid)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isContractLoading ? "Processing..." : "Publish Root"}
                        </button>

                        {/* Update button */}
                        <button
                          onClick={handleUpdateDescription}
                          disabled={isPageLoading || !merkleRoot || !treeDescription || !Boolean(merkleRootValid)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isContractLoading ? "Processing..." : "Update Description"}
                        </button>

                        {/* Remove button */}
                        <button
                          onClick={handleRemoveMerkleRoot}
                          disabled={isPageLoading || !merkleRoot || !Boolean(merkleRootValid)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isContractLoading ? "Processing..." : "Remove Root"}
                        </button>
                      </div>

                      {/* Transaction status */}
                      {txHash && (
                        <div className="mt-4 p-3 bg-purple-900/20 rounded-lg text-sm border border-purple-800">
                          <p className="text-purple-300 break-all">
                            <span className="font-medium">Transaction Hash:</span> {txHash}
                          </p>
                          <p className="mt-1 text-purple-300">
                            <span className="font-medium">Status:</span> {txStatus}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Proof Generation Section */}
          {proof.length > 0 && (
            <div className="rounded-lg p-6 bg-[#1c2941]">
              <h3 className="text-lg font-semibold mb-4 text-white">
                Merkle Proof for {selectedAddress.slice(0, 6)}...{selectedAddress.slice(-4)}
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-700 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm text-white">{JSON.stringify(proof, null, 2)}</pre>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(proof, null, 2))}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Copy Proof
                  </button>
                  <button
                    onClick={downloadProof}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Download Proof
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Download All Data Button */}
          {addresses.length > 0 && (
            <div className="mt-6">
              <button
                onClick={downloadAllData}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                disabled={isPageLoading}
              >
                Download All Data (Merkle Root + All Proofs)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerkleGenerator;