/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */

import { config as loadEnv } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { SDK, Auth, Metadata } from './index.js';
loadEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const acc = new Auth({
  privateKey: process.env.WALLET_PRIVATE_KEY,
  projectId: process.env.INFURA_PROJECT_ID,
  secretId: process.env.INFURA_PROJECT_SECRET,
  rpcUrl: process.env.EVM_RPC_URL,
  chainId: 5,
  ipfs: {
    projectId: process.env.INFURA_IPFS_PROJECT_ID,
    apiKeySecret: process.env.INFURA_IPFS_PROJECT_SECRET,
  },
});

const sdk = new SDK(acc);

/**
 * METADATA
 */
// CREATE CONTRACT Metadata
const collectionMetadata = Metadata.OpenSeaCollectionLevelStandard({
  name: 'My awesome collection',
  description: "A long description explaining why it's awesome",
  image: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
  external_link: 'https://myawesomewebsite.net',
});

console.log('collectionMetadata ----', collectionMetadata);

/**
 * METADATA
 */
// CREATE Token Metadata
const tokenMetadata = Metadata.OpenSeaTokenLevelStandard({
  description: 'Friendly OpenSea Creature that enjoys long swims in the ocean.',
  external_url: 'https://openseacreatures.io/3',
  image: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
  name: 'Dave Starbelly',
  attributes: [],
});

console.log('tokenMetadata ----', tokenMetadata);

const storeMetadata = await sdk.store(tokenMetadata);

const storeImageUrl = await sdk.store(
  'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
);

const storeImageFile = await sdk.store('./integration-test/ipfs-test/metamask.jpeg');

console.log('storeMetadata ----', storeMetadata);
console.log('storeImageUrl ----', storeImageUrl);
console.log('storeImageFile ----', storeImageFile);

const storeArrayMetadata = await sdk.store([
  {
    description: 'test1',
    external_url: 'test1',
    image: 'test1',
    name: 'Dave Starbelly',
    attributes: [],
  },
  {
    description: 'test2',
    external_url: 'test2',
    image: 'test2',
    name: 'Dave Starbelly',
    attributes: [],
  },
]);

console.log('storeArrayMetadata ----', storeArrayMetadata);
/**
 * METADATA
 */
// CREATE free Metadata
Metadata.freeLevelMetadata({
  test: 'test.',
});
