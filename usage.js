/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */

import { config as loadEnv } from 'dotenv';
import { SDK, Auth, TEMPLATES } from './index.js';

loadEnv();

const acc = new Auth({
  privateKey: process.env.WALLET_PRIVATE_KEY,
  projectId: process.env.INFURA_PROJECT_ID,
  secretId: process.env.INFURA_PROJECT_SECRET,
  rpcUrl: process.env.EVM_RPC_URL,
  chainId: 5,
});

const sdk = new SDK(acc);

// const newContract = await sdk.deploy({
//   template: TEMPLATES.ERC721Mintable,
//   params: {
//     name: '1403Contract',
//     symbol: 'QZC',
//     contractURI: 'URI',
//   },
// });

// const erc20Balance = await sdk.getEthBalance({
//   publicAddress: process.env.WALLET_PUBLIC_ADDRESS,
// });
// console.log(erc20Balance);
// console.log(typeof erc20Balance);

const existingContract = await sdk.loadContract({
  template: TEMPLATES.ERC721Mintable,
  contractAddress: '0x959A9b5F9Ceed6B4B1B09cE6AFCFb32162c70bB9',
});
//console.log('contract address: \n', existingContract.contractAddress);

// mintNFT
const mint = await existingContract.mint({
  publicAddress: process.env.WALLET_PUBLIC_ADDRESS,
  tokenURI: 'https://ipfs.io/ipfs/QmajL9pQBCMhvkwJdVYSBkMXaQnDdsMcEvKYSxmyUc5WYy',
});
const minted = await mint.wait();
console.log(minted);
