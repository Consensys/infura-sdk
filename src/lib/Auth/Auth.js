/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */
import { availableChains, getChainName } from './availableChains.js';
import Signer from '../Signer/Signer.js';
import Provider from '../Provider/Provider.js';
import { isValidString } from '../utils.js';
import { errorLogger, ERROR_LOG } from '../error/handler.js';

export default class Auth {
  #privateKey;

  #projectId;

  #secretId;

  #rpcUrl;

  #provider;

  #chainId;

  constructor({ privateKey, projectId, secretId, rpcUrl, chainId, provider }) {
    if (!privateKey && !provider) {
      // throw new Error('[Auth.constructor] privateKey or provider missing');
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Auth_constructor,
          message: ERROR_LOG.message.no_parameters_supplied,
        }),
      );
    }
    if (privateKey && provider) {
      // throw new Error('[Auth.constructor] please provide only privateKey or provider');
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Auth_constructor,
          message: ERROR_LOG.message.only_privateKey_or_provider_required,
        }),
      );
    }
    if (!projectId) {
      // throw new Error('[Auth.constructor] projectId is missing!');
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Auth_constructor,
          message: ERROR_LOG.message.no_projectId_supplied,
        }),
      );
    }
    if (!secretId) {
      // throw new Error('[Auth.constructor] secretId is missing!')
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Auth_constructor,
          message: ERROR_LOG.message.no_secretId_supplied,
        }),
      );
    }
    if (!chainId) {
      // throw new Error('[Auth.constructor] chainId is missing!')
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Auth_constructor,
          message: ERROR_LOG.message.no_chainId_supplied,
        }),
      );
    }
    if (!availableChains.includes(chainId)) {
      // throw new Error(`[Auth.constructor] chainId: ${chainId} is not supported!`);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Auth_constructor,
          message: ERROR_LOG.message.chain_not_supported,
        }),
      );
    }

    this.#privateKey = privateKey;
    this.#projectId = projectId;
    this.#secretId = secretId;
    this.#chainId = chainId;
    this.#rpcUrl = rpcUrl;

    if (!isValidString(this.#rpcUrl)) {
      this.#rpcUrl = `https://${getChainName(chainId)}.infura.io/v3/${this.#projectId}`;
    }

    this.setProvider(provider);
  }

  getChainId() {
    return this.#chainId;
  }

  getRpcUrl() {
    return this.#rpcUrl;
  }

  getApiAuthHeader() {
    return {
      Authorization: `Basic ${this.#base64encode()}`,
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

  setProvider(provider) {
    if (this.#privateKey) {
      this.#provider = Provider.getProvider(this.#rpcUrl);
      return;
    }
    if (provider) {
      this.#provider = Provider.getInjectedProvider(provider);
    }
  }
}
