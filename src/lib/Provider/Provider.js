/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

import { ethers } from 'ethers';
import { errorLogger, ERROR_LOG } from '../error/handler.js';

export default class Provider {
  static getProvider(rpcUrl) {
    if (!rpcUrl) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Provider_getProvider,
          message: ERROR_LOG.message.no_rpcURL,
        }),
      );
    }

    // eslint-disable-next-line new-cap
    return new ethers.providers.getDefaultProvider(rpcUrl);
  }

  static getInjectedProvider(injectedProvider) {
    if (!injectedProvider) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Provider_getInjectedProvider,
          message: ERROR_LOG.message.no_privateKey,
        }),
      );
    }

    try {
      // eslint-disable-next-line new-cap
      return new ethers.providers.Web3Provider(injectedProvider);
    } catch (e) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Provider_getInjectedProvider,
          message: ERROR_LOG.message.invalid_provider,
        }),
      );
    }
  }
}
