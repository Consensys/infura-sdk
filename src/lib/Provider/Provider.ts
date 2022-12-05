/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

import { ethers } from 'ethers';
import { Logger, log } from '../Logger';

export default class Provider {
  static getProvider(rpcUrl: string | undefined): ethers.providers.BaseProvider {
    if (!rpcUrl)
      log.throwMissingArgumentError(Logger.message.no_rpcURL, {
        location: Logger.location.PROVIDER_GETPROVIDER,
      });

    return new (ethers.providers.getDefaultProvider as any)(rpcUrl);
  }

  static getInjectedProvider(
    injectedProvider: ethers.providers.ExternalProvider | ethers.providers.JsonRpcFetchFunc,
  ): ethers.providers.Web3Provider {
    if (!injectedProvider)
      log.throwMissingArgumentError(Logger.message.no_provider, {
        location: Logger.location.PROVIDER_GETINJECTEDPROVIDER,
      });

    try {
      return new ethers.providers.Web3Provider(injectedProvider);
    } catch (error) {
      return log.throwArgumentError(
        Logger.message.invalid_provider,
        'injectedProvider',
        injectedProvider,
        {
          location: Logger.location.PROVIDER_GETINJECTEDPROVIDER,
          error,
        },
      );
    }
  }
}
