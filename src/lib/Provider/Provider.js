/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

import { ethers } from 'ethers';

export default class Provider {
  static getProvider(rpcUrl) {
    if (!rpcUrl) throw new Error('[Provider.getProvider] rpcUrl is missing!');

    // eslint-disable-next-line new-cap
    return new ethers.providers.getDefaultProvider(rpcUrl);
  }

  static getInjectedProvider(injectedProvider) {
    if (!injectedProvider) throw new Error('[Provider.getProvider] rpcUrl is missing!');

    // eslint-disable-next-line new-cap
    return new ethers.providers.Web3Provider(injectedProvider);
  }
}
