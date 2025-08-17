import React from 'react';
import { MerkleProofContract } from '../ABI';

const TestImport = () => {
  console.log('MerkleProofContract:', MerkleProofContract);
  console.log('MerkleProofContract.address:', MerkleProofContract?.address);
  console.log('MerkleProofContract.abi:', MerkleProofContract?.abi);

  return (
    <div>
      <h3>Import Test</h3>
      <p>Contract Address: {MerkleProofContract?.address || 'UNDEFINED'}</p>
      <p>ABI Length: {MerkleProofContract?.abi?.length || 'UNDEFINED'}</p>
    </div>
  );
};

export default TestImport; 