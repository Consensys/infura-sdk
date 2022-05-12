/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

import { ExternallyOwnedAccount } from './lib/NFT/externallyOwnedAccount.js';

export * from './lib/NFT/externallyOwnedAccount.js';
export default {
  ExternallyOwnedAccount,
};

account = new ExternallyOwnedAccount();
contract = account.createSmartContract();
contract.deploy();
contract.mint();
