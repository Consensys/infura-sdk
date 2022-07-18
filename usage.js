/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */

// Use this in "module" type nodejs projects
import { config as loadEnv } from 'dotenv';
import { SDK, Auth, TEMPLATES } from './index.js';
loadEnv();

const acc = new Auth({
  privateKey: process.env.WALLET_PRIVATE_KEY,
  projectId: process.env.INFURA_PROJECT_ID,
  secretId: process.env.INFURA_PROJECT_SECRET,
  rpcUrl: process.env.EVM_RPC_URL,
  chainId: 4,
});

///////// Alternative Auth Instantiation with MetaMask /////////
// When using SDK in a browser
//
// const accWithProvider = new Auth({
//   projectId: process.env.INFURA_PROJECT_ID,
//   secretId: process.env.INFURA_PROJECT_SECRET,
//   rpcUrl: process.env.EVM_RPC_URL,
//   chainId: 5,
//   provider: window.ethereum,
// });
//
//////////////////////////////////////////////////////////////

const sdk = new SDK(acc);

// Create a new contract
const newContract = await sdk.deploy({
  template: TEMPLATES.ERC721Mintable,
  params: {
    name: '1507Contract',
    symbol: 'TOC',
    contractURI: 'URI',
  },
});
console.log('contract address: \n', newContract.contractAddress);

// READ API
// Get contract metadata
// const contractMetadata = await sdk.getContractMetadata({
//   contractAddress: '0x9daB8FcFe91688d360FeB9ba83F74F29dfC82287',
// });
// console.log(contractMetadata);

// Get all NFTs for the specified address
// const mynfts = await sdk.getNFTs({ publicAddress: process.env.WALLET_PUBLIC_ADDRESS });
// console.log(mynfts);

// Get all NFTs for the specified contract
// const nfts = await sdk.getNFTsForCollection({
//   contractAddress: '0x9daB8FcFe91688d360FeB9ba83F74F29dfC82287',
// });
// console.log(nfts);

// Get the token metadata
// const tokenMetadata = await sdk.getTokenMetadata({
//   contractAddress: '0x9daB8FcFe91688d360FeB9ba83F74F29dfC82287',
//   tokenId: 0,
// });
// console.log(tokenMetadata);

// Load an existing contract
// const existingContract = await sdk.loadContract({
//   template: TEMPLATES.ERC721Mintable,
//   contractAddress: '0x9daB8FcFe91688d360FeB9ba83F74F29dfC82287',
// });

// console.log('contract address: \n', existingContract.contractAddress);

// // mint a NFT
const mint = await newContract.mint({
  publicAddress: process.env.WALLET_PUBLIC_ADDRESS,
  tokenURI: 'https://ipfs.io/ipfs/QmajL9pQBCMhvkwJdVYSBkMXaQnDdsMcEvKYSxmyUc5WYy',
});

const minted = await mint.wait();
console.log(minted);

const mint2 = await newContract.mint({
  publicAddress: process.env.WALLET_PUBLIC_ADDRESS,
  tokenURI: 'localfile',
});

const minted2 = await mint2.wait();
console.log(minted2);

// // Transfer a NFT
// const transfer = await existingContract.transfer({
//   from: ownerOfToken,
//   to: anotherAddress,
//   tokenId: 0,
// });

// const transfered = await transfer.wait();
// console.log(transfered);

// // ROLES (MINTER and ADMIN)
// // Grant MINTER Role
// const add = await existingContract.addMinter({ publicAddress });

// const added = await add.wait();
// console.log(added);

// // check MINTER role
// const isMinter = await existingContract.isMinter({ publicAddress });
// console.log(isMinter);

// // APPROVAL
// // Set approval for all
// const setApproval = await existingContract.setApprovalForAll({
//   to: publicAddress,
//   approvalStatus: true,
// });
// const approvalSet = await setApproval.wait();
// console.log(approvalSet);

// // Transfer NFT with approval
// // 1. owner mints a token
// const tx = await newContract.mint({
//   publicAddress: process.env.WALLET_PUBLIC_ADDRESS,
//   tokenURI: 'https://ipfs.io/ipfs/QmRfModHffFedTkHSW1ZEn8f19MdPztn9WV3kY1yjaKvBy',
// });
// const receipt = await tx.wait();
// console.log(receipt);

// // 2. owner approves publicAddress to transfer token that he owns
// const txApprove = await existingContract.approveTransfer({ to: publicAddress, tokenId: 1 });
// await txApprove.wait();

// // new auth as "publicAddress"
// const accountPublic = new Auth({
//   privateKey: privateKeyPublicAddress,
//   projectId: process.env.INFURA_PROJECT_ID,
//   secretId: process.env.INFURA_PROJECT_SECRET,
//   rpcUrl: 'http://0.0.0.0:8545',
//   chainId: 5,
// });
// const sdkPublic = new SDK(accountPublic);
// const existing = await sdkPublic.loadContract({
//   template: TEMPLATES.ERC721Mintable,
//   contractAddress: contractObject.contractAddress,
// });

// // 3. publicAddress transfers token of owner
// const txTransfer = await existing.transfer({ from: owner, to: thirdUser, tokenId: 1 });

// const receipt = await txTransfer.wait();
// console.log(receipt);

// // ROYALTIES
// // Set Royalties for a contract
// const royalties = await newContract.setRoyalties({
//   publicAddress: process.env.WALLET_PUBLIC_ADDRESS,
//   fee: 50,
// });
// const royaltiesSet = await royalties.wait();
// console.log(royaltiesSet);

// // Get Royalties info for a token at a specific sellPrice
// const infos = await newContract.royaltyInfo({ tokenId: 1, sellPrice: 100000 });
// console.log(infos);

// const isMinter = await newContract.isMinter({ publicAddress: process.env.WALLET_PUBLIC_ADDRESS });
// console.log(isMinter);
