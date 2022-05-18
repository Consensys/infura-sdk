/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */

export default class Auth {
  constructor({ apiSecret, apiKey, chainId }) {
    this.apiSecret = apiSecret;
    this.apiKey = apiKey;
    this.chainId = this.setChainId(chainId);
  }

  getApiCredentials() {
    // TODO: Base64 encode this
    return this.apiKey + this.apiSecret;
  }

  getChainId() {
    return this.chainId;
  }

  _setChainId(chainId) {
    return 'mainnet';
  }
}
