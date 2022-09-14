/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */

import { config as loadEnv } from 'dotenv';
import { SDK, Auth, TEMPLATES, Metadata } from './index.js';
loadEnv();

const projectId = process.env.INFURA_IPFS_PROJECT_ID;
const projectSecret = process.env.INFURA_IPFS_PROJECT_SECRET;
const ipfsUrl = process.env.INFURA_IPFS_ENDPOINT;

const collectionMetadata = {
  name: 'My awesome collection',
  description: "A long description explaining why it's awesome",
  image: './collection_cover.png',
  external_link: 'https://myawesomewebsite.net',
};

const myMetadataStorage = new Metadata({ projectId, projectSecret, ipfsUrl });
const contractURI = myMetadataStorage.createContractURI(collectionMetadata);

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
    name: '1507Contract',
    symbol: 'TOC',
    contractURI: contractURI,
  },
});
console.log('contract address: \n', newContract.contractAddress);
