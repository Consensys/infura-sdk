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
  privateKey: process.env.PRIVATE_KEY,
  projectId: process.env.PROJECT_ID,
  secretId: process.env.SECRET_ID,
  rpcUrl: process.env.RPC_URL,
  chainId: 4,
});

const sdk = new SDK(acc);

// const newContract = await sdk.deploy({
//   template: TEMPLATES.ERC721Mintable,
//   params: {
//     name: '1311Contract',
//     symbol: 'TOC',
//     contractURI: 'URI',
//   },
// });

//console.log(newContract.contractAddress); // 0x959A9b5F9Ceed6B4B1B09cE6AFCFb32162c70bB9

const existingContract = await sdk.loadContract({
  template: TEMPLATES.ERC721Mintable,
  contractAddress: '0x959A9b5F9Ceed6B4B1B09cE6AFCFb32162c70bB9',
});

console.log('contract address: \n', existingContract.contractAddress);

// mintNFT
const tx = await existingContract.mint(
  '0x975D72d053AF7Bcf109b2964a752a678E52B50f9',
  'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
);
console.log('submitted tx: \n', tx);

const confirmed = await tx.wait();

console.log('confirmed tx: \n', confirmed);
