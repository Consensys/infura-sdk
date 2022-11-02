/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */

import axios from 'axios';

export class HttpService {
  constructor(baseURL, apiKey) {
    if (!baseURL) throw new Error('[httpService.constructor] baseURL is missing!');
    if (!apiKey) throw new Error('[httpService.constructor] apiKey is missing!');

    // TODO: read from pkg.json the version info
    this.instance = axios.create({
      baseURL,
      headers: {
        Authorization: `Basic ${apiKey}`,
        'X-Infura-User-Agent': 'infura/sdk-js 1.0.2',
      },
    });
  }

  async get(uri) {
    try {
      return await this.instance.get(uri);
    } catch (error) {
      console.log(this.instance);
      throw new Error(`[API.ERROR][httpService.get] An error occured: ${error}`);
    }
  }

  async post(uri, params) {
    return this.instance.post(uri, params);
  }
}
