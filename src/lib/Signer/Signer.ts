/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

import { ethers } from 'ethers';
import { Logger, log } from '../Logger';

export default class Signer {
  static getWallet(
    privateKey: string,
    provider: ethers.providers.BaseProvider | ethers.providers.Web3Provider,
  ): ethers.Wallet {
    if (!privateKey)
      log.throwMissingArgumentError(Logger.message.no_privateKey, {
        location: Logger.location.SIGNER_GETWALLET,
      });
    if (!provider)
      log.throwMissingArgumentError(Logger.message.no_provider, {
        location: Logger.location.SIGNER_GETWALLET,
      });
    return new ethers.Wallet(privateKey, provider);
  }
}
