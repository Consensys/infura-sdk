/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */
import { ethers } from 'ethers';

export default class Auth {
  #privateKey = null;

  #projectId = null;

  #secretId = null;

  #rpcUrl = null;

  #provider = null;

  #chainId = null;

  constructor({ privateKey, projectId, secretId, rpcUrl, chainId }) {
    if (!privateKey) throw new Error('[Auth.constructor] privateKey is missing!');
    if (!projectId) throw new Error('[Auth.constructor] projectId is missing!');
    if (!secretId) throw new Error('[Auth.constructor] secretId is missing!');
    if (!chainId) throw new Error('[Auth.constructor] chainId is missing!');

    if (rpcUrl) {
      this.#rpcUrl = rpcUrl;
    }

    this.#privateKey = privateKey;
    this.#projectId = projectId;
    this.#secretId = secretId;
    this.#chainId = chainId;
  }

  getChainId() {
    return this.#chainId;
  }

  getApiAuthHeader() {
    return {
      Authorization: `Basic ${this.#base64encode(this.#projectId, this.#secretId)}`,
    };
  }

  #base64encode() {
    return Buffer.from(`${this.#projectId}:${this.#secretId}`).toString('base64');
  }

  getApiAuth() {
    return this.#base64encode();
  }

  getSigner() {
    if (!this.#provider) throw new Error('[Auth.getSigner] You need to set a provider');
    return new ethers.Wallet(this.#privateKey, this.#provider);
  }

  getProvider(injectedProvider) {
    if (!injectedProvider && !this.#rpcUrl) {
      throw new Error(
        '[Auth.getProvider] You need to pass an rpcUrl to the constructor or pass an injected provider to this function!',
      );
    }

    if (injectedProvider) {
      this.#provider = new ethers.providers.Web3Provider(injectedProvider);
      return this.#provider;
    }

    // eslint-disable-next-line new-cap
    this.#provider = new ethers.providers.getDefaultProvider(this.#rpcUrl);
    return this.#provider;
  }
}
