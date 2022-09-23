/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */

import { config as loadEnv } from 'dotenv';
import path from 'path';
import { SDK, Auth, TEMPLATES, Metadata } from './index.js';
loadEnv();

const projectId = process.env.INFURA_IPFS_PROJECT_ID;
const projectSecret = process.env.INFURA_IPFS_PROJECT_SECRET;

const myMetadataStorage = new Metadata({ projectId, projectSecret });

/**
 * METADATA
 */
// CREATE CONTRACT URI
// upload collection metadata from JSON object
const collectionMetadata = {
  name: 'My awesome collection',
  description: "A long description explaining why it's awesome",
  image: path.join(__dirname, 'test', 'ipfs-test/consensys.png'), // accepts absolute path and URL
  external_link: 'https://myawesomewebsite.net',
};
const { cid } = await myMetadataStorage.createContractURI(collectionMetadata);

// upload collection metadata from JSON file
const myjson = path.join(__dirname, 'test', 'ipfs-test/collectionMetadata.json');
const contractURI_file = await myMetadataStorage.createContractURI(myjson);

// CREATE METADATA URI
// upload token metadata from JSON object
const tokenMetadata = {
  description: 'Friendly OpenSea Creature that enjoys long swims in the ocean.',
  external_url: 'https://openseacreatures.io/3',
  image: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
  animation_url: path.join(__dirname, 'test', 'ipfs-test/consensys.png'),
  name: 'Dave Starbelly',
  attributes: [],
};
const { cid: cidFile } = await myMetadataStorage.createTokenURI(tokenMetadata);

// upload token metadata from JSON file
const mynftjson = path.join(__dirname, 'test', 'ipfs-test/nftMetadata.json');
const tokenURI_file = await myMetadataStorage.createTokenURI(mynftjson);

/**
 *
 * SDK
 *
 */
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
    contractURI: `https://ipfs.io/ipfs/${cid}`,
  },
});
console.log('contract address: \n', newContract.contractAddress);
