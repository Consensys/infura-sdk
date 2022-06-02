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

const newContract = await sdk.deploy({
  template: TEMPLATES.ERC721Mintable,
  params: {
    name: '1403Contract',
    symbol: 'QZC',
    contractURI: 'URI',
  },
});

// const existingContract = await sdk.loadContract({
//   template: TEMPLATES.ERC721Mintable,
//   contractAddress: '0x959A9b5F9Ceed6B4B1B09cE6AFCFb32162c70bB9',
// });
console.log('contract address: \n', newContract.contractAddress);

// mintNFT
// const tx = await newContract.mint(
//   '0x975D72d053AF7Bcf109b2964a752a678E52B50f9',
//   'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
// );
// console.log('submitted tx: \n', tx);

// const confirmed = await tx.wait();

// console.log('confirmed tx: \n', confirmed);

// Role
// // grant
// const role = await newContract.addMinter('0xAc7cdddB692c7265CA896c1a7fCa85F30f576570');
// const tx = await role.wait();
// console.log(tx);

// // check
// const check = await newContract.isMinter('0xAc7cdddB692c7265CA896c1a7fCa85F30f576570');
// console.log(check);

// // remove
// const remove = await newContract.removeMinter('0xAc7cdddB692c7265CA896c1a7fCa85F30f576570');
// const removed = await remove.wait();
// console.log(removed);

// // grant
// const role1 = await newContract.addMinter('0xAc7cdddB692c7265CA896c1a7fCa85F30f576570');
// const tx1 = await role1.wait();
// console.log(tx1);

// renounce
// const newAcc = new Auth({
//   privateKey: '0xf78b67122c8ce32a4f1ff85da8e6eb87746ffe22d4910cbc01444e8a98d53fe7',
//   projectId: process.env.INFURA_PROJECT_ID,
//   secretId: process.env.INFURA_PROJECT_SECRET,
//   rpcUrl: process.env.EVM_RPC_URL,
//   chainId: 5,
// });

// const newSdk = new SDK(newAcc);
// const existing = await newSdk.loadContract({
//   template: TEMPLATES.ERC721Mintable,
//   contractAddress: '0x49B614fDC0C26cf47d0a132c2F8420041359d2C2',
// });
// const renounce = await existing.renounceMinter('0xAc7cdddB692c7265CA896c1a7fCa85F30f576570');
// const renounced = await renounce.wait();
// console.log(renounced);
