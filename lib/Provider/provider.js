import { ethers } from 'ethers';

export class Provider {
  static fromJsonRPCProvider(providerUrl) {
    return new ethers.providers.getDefaultProvider(providerUrl);
  }

  static fromInjectedProvider(injectedProvider) {
    return new ethers.providers.Web3Provider(injectedProvider);
  }
}
