/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

import { ethers } from 'ethers';

export default class Signer {
  static getWallet(privateKey, provider) {
    if (!privateKey) throw new Error('[Signer.constructor] privateKey is missing!');
    if (!provider) throw new Error('[Signer.constructor] provider is missing!');
    return new ethers.Wallet(privateKey, provider);
  }
}
