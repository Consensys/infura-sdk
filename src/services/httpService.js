/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */

import axios from 'axios';
const version = require('../../package.json').version;
export class HttpService {
  constructor(baseURL, apiKey) {
    if (!baseURL) throw new Error('[httpService.constructor] baseURL is missing!');
    if (!apiKey) throw new Error('[httpService.constructor] apiKey is missing!');

    this.instance = axios.create({
      baseURL: baseURL,
      headers: {
        Authorization: `Basic ${apiKey}`,
        'X-Infura-User-Agent': `infura/sdk-js ${version}`,
      },
    });
  }

  async get(uri) {
    try {
      return await this.instance.get(uri);
    } catch (error) {
      throw new Error(`[API.ERROR][httpService.get] An error occured: ${error}`);
    }
  }

  async post(uri, data, params) {
    return this.instance.post(uri, data, params);
  }

  static async getImageStream(imageUrl) {
    try {
      return await axios.get(imageUrl, {
        responseType: 'stream',
      });
    } catch (error) {
      throw new Error(`[API.ERROR][httpService.getImageStream] An error occured: ${error}`);
    }
  }
}
