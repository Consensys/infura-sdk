/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

import { ethers } from 'ethers';

import { errorLogger, ERROR_LOG } from '../error/handler.js';

export default class Signer {
  static getWallet(privateKey, provider) {
    if (!privateKey) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Signer_constructor,
          message: ERROR_LOG.message.no_privateKey,
        }),
      );
    }

    if (!provider) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Signer_constructor,
          message: ERROR_LOG.message.no_provider,
        }),
      );
    }

    return new ethers.Wallet(privateKey, provider);
  }
}
