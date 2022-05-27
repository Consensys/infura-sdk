/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */

import { config as loadEnv } from 'dotenv';
import { SDK, Auth, TEMPLATES } from './index.js';
import { ACCOUNT_ADDRESS } from './test/__mocks__/utils.js';

loadEnv();

const acc = new Auth({
  privateKey: process.env.PRIVATE_KEY,
  projectId: process.env.PROJECT_ID,
  secretId: process.env.SECRET_ID,
  rpcUrl: process.env.RPC_URL,
  chainId: 4,
});

const sdk = new SDK(acc);

const newContract = await sdk.deploy({
  template: TEMPLATES.ERC721Mintable,
  params: {
    name: 'testing',
  },
});
// console.log(newContract);

const existingContract = await sdk.loadContract({
  template: 'templatename',
  contractAddress: '0x09765678',
});

// console.log(existingContract);

// mintNFT
// if (newContract.mint(ACCOUNT_ADDRESS, 'https://infura.io/images/404.png')) {
//   console.log(`yay, I successfully minted an NFT to ${ACCOUNT_ADDRESS}!!`);
// } else console.log('something unexpected happened');
