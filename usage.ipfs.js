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
});

const sdk = new SDK(acc);

/**
 * METADATA
 */
// CREATE CONTRACT Metadata
Metadata.OpenSeaCollectionLevelStandard({
  name: 'My awesome collection',
  description: "A long description explaining why it's awesome",
  image: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
  external_link: 'https://myawesomewebsite.net',
});

/**
 * METADATA
 */
// CREATE Token Metadata
Metadata.OpenSeaTokenLevelStandard({
  description: 'Friendly OpenSea Creature that enjoys long swims in the ocean.',
  external_url: 'https://openseacreatures.io/3',
  image: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
  animation_url: path.join(__dirname, 'test', 'ipfs-test/consensys.png'),
  name: 'Dave Starbelly',
  attributes: [],
});

/**
 * METADATA
 */
// CREATE free Metadata
Metadata.freeLevelMetadata({
  test: 'test.',
});
