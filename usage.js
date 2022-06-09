/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */

import { config as loadEnv } from 'dotenv';
import { SDK, Auth, TEMPLATES } from './index.js';
import Provider from './src/lib/Provider/Provider.js';

loadEnv();

const acc = new Auth({
  privateKey: process.env.WALLET_PRIVATE_KEY,
  projectId: process.env.INFURA_PROJECT_ID,
  secretId: process.env.INFURA_PROJECT_SECRET,
  rpcUrl: process.env.EVM_RPC_URL,
  chainId: 5,
});

///////// Alternative Auth Instantiation with MetaMask /////////
// When using SDK in a browser
//
// const provider = Provider.getInjectedProvider(window.ethereum);
// const accWithProvider = new Auth({
//   projectId: process.env.INFURA_PROJECT_ID,
//   secretId: process.env.INFURA_PROJECT_SECRET,
//   rpcUrl: process.env.EVM_RPC_URL,
//   chainId: 5,
//   provider,
// });
//
//////////////////////////////////////////////////////////////

const sdk = new SDK(acc);

// Create a new contract
// const newContract = await sdk.deploy({
//   template: TEMPLATES.ERC721Mintable,
//   params: {
//     name: '1403Contract',
//     symbol: 'QZC',
//     contractURI: 'URI',
//   },
// });

// READ API
// Get ERC20 Balance
// const erc20Balance = await sdk.getEthBalance({
//   publicAddress: process.env.WALLET_PUBLIC_ADDRESS,
// });
// console.log(erc20Balance);

// Get ETH Balance
// const ethBalance = await sdk.getEthBalance({
//   publicAddress: process.env.WALLET_PUBLIC_ADDRESS,
// });
// console.log(ethBalance);

// Get contract metadata
// const contractMetadata = await sdk.getContractMetadata({
//   contractAddress: '0x2a66707e4ffe929cf866bc048e54ce28f6b7275f',
// });
// console.log(contractMetadata);

// Get all NFTs for the specified address
// const mynfts = await sdk.getNFTs({ publicAddress });
// console.log(mynfts);

// Get all NFTs for the specified contract
// const nfts = await sdk.getNFTsForCollection({
//   contractAddress: '0x2a66707e4ffe929cf866bc048e54ce28f6b7275f',
// });
// console.log(nfts);

// Get the token metadata
// const tokenMetadata = await sdk.getTokenMetadata({
//   contractAddress: '0x2a66707e4ffe929cf866bc048e54ce28f6b7275f',
//   tokenId: 0,
// });
// console.log(tokenMetadata);

// Load an existing contract
const existingContract = await sdk.loadContract({
  template: TEMPLATES.ERC721Mintable,
  contractAddress: '0x959A9b5F9Ceed6B4B1B09cE6AFCFb32162c70bB9',
});

console.log('contract address: \n', existingContract.contractAddress);

// mint a NFT
const mint = await existingContract.mint({
  publicAddress: process.env.WALLET_PUBLIC_ADDRESS,
  tokenURI: 'https://ipfs.io/ipfs/QmajL9pQBCMhvkwJdVYSBkMXaQnDdsMcEvKYSxmyUc5WYy',
});

const minted = await mint.wait();
console.log(minted);

// Transfer a NFT
const transfer = await existingContract.transfer({
  from: ownerOfToken,
  to: anotherAddress,
  tokenId: 0,
});

const transfered = await transfer.wait();
console.log(transfered);

// ROLES (MINTER and ADMIN)
// Grant MINTER Role
const add = await existingContract.addMinter({ publicAddress });

const added = await add.wait();
console.log(added);

// check MINTER role
const isMinter = await existingContract.isMinter({ publicAddress });
console.log(isMinter);

// APPROVAL
// Set approval for all
const setApproval = await existingContract.setApprovalForAll({
  to: publicAddress,
  approvalStatus: true,
});
const approvalSet = await setApproval.wait();
console.log(approvalSet);

// Transfer NFT with approval
// 1. owner mints a token
const tx = await existingContract.mint({
  publicAddress: owner,
  tokenURI: 'https://ipfs.io/ipfs/QmRfModHffFedTkHSW1ZEn8f19MdPztn9WV3kY1yjaKvBy',
});
await tx.wait();

// 2. owner approves publicAddress to transfer token that he owns
const txApprove = await existingContract.approveTransfer({ to: publicAddress, tokenId: 1 });
await txApprove.wait();

// new auth as "publicAddress"
const accountPublic = new Auth({
  privateKey: privateKeyPublicAddress,
  projectId: process.env.INFURA_PROJECT_ID,
  secretId: process.env.INFURA_PROJECT_SECRET,
  rpcUrl: 'http://0.0.0.0:8545',
  chainId: 5,
});
const sdkPublic = new SDK(accountPublic);
const existing = await sdkPublic.loadContract({
  template: TEMPLATES.ERC721Mintable,
  contractAddress: contractObject.contractAddress,
});

// 3. publicAddress transfers token of owner
const txTransfer = await existing.transfer({ from: owner, to: thirdUser, tokenId: 1 });

const receipt = await txTransfer.wait();
console.log(receipt);

// ROYALTIES
// Set Royalties for a contract
const royalties = await existingContract.setRoyalties({ publicAddress, fee: 1000 });
const royaltiesSet = await royalties.wait();
console.log(royaltiesSet);

// Get Royalties info for a token at a specific sellPrice
const infos = await existingContract.royaltyInfo({ tokenId: 1, sellPrice: 10 });
console.log(infos);
