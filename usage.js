/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */

import SDK from './lib/SDK/index';
import Auth from './lib/Auth/index';

const acc = new Auth({
  chainId: 1,
  privateKey: 'stringlong',
  projectId: '9876456789',
  secretId: '0987654567890',
  rpcUrl: 'http://0.0.0.0:8545',
});

const sdk = new SDK(acc);

const newContract = await sdk.deploy({
  template: 'templatename',
  params: {
    name: 'testing',
  },
});

const existingContract = await sdk.loadContract({
  template: 'templatename',
  contractAddress: '0x09765678',
});
