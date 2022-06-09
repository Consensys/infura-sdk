/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */
import { ethers } from 'ethers';
import { availableChains, getChainName } from './availableChains.js';
import Signer from '../Signer/Signer.js';
import Provider from '../Provider/Provider.js';

export default class Auth {
  #privateKey;

  #projectId;

  #secretId;

  #rpcUrl;

  #provider;

  #signer;

  #chainId;

  constructor({ privateKey, projectId, secretId, rpcUrl, chainId, provider }) {
    if (!privateKey && !provider) {
      throw new Error('[Auth.constructor] privateKey or provider missing');
    }
    if (privateKey && provider) {
      throw new Error('[Auth.constructor] please provide only privateKey or provider');
    }
    if (!projectId) throw new Error('[Auth.constructor] projectId is missing!');
    if (!secretId) throw new Error('[Auth.constructor] secretId is missing!');
    if (!chainId) throw new Error('[Auth.constructor] chainId is missing!');
    if (!availableChains.includes(chainId)) {
      throw new Error(`[Auth.constructor] chainId: ${chainId} is not supported!`);
    }

    this.#rpcUrl = rpcUrl || `https://${getChainName(chainId)}.infura.io/v3/${this.#projectId}`;
    this.#privateKey = privateKey;
    this.#projectId = projectId;
    this.#secretId = secretId;
    this.#chainId = chainId;

    this.setProviderAndSigner(privateKey, provider);
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
    return btoa(`${this.#projectId}:${this.#secretId}`);
  }

  getApiAuth() {
    return this.#base64encode();
  }

  async getSigner() {
    if (this.#privateKey) {
      return Signer.getWallet(this.#privateKey, this.#provider);
    }
    return this.#provider.getSigner();
  }

  setProviderAndSigner(privateKey, provider) {
    if (privateKey) {
      // eslint-disable-next-line new-cap
      this.#provider = Provider.getProvider(this.#rpcUrl);
      return;
    }
    if (provider instanceof ethers.providers.Provider) {
      this.#provider = provider;
      return;
    }
    throw new Error('[Auth.setProviderAndSigner] Invalid provider given');
  }
}
