/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */

import axios from 'axios';

export class HttpService {
  constructor(baseURL, apiKey, apiVersion = 1) {
    if (!baseURL) throw new Error('[httpService.constructor] baseURL is missing!');
    if (!apiKey) throw new Error('[httpService.constructor] apiKey is missing!');

    this.instance = axios.create({
      baseURL: baseURL,
      headers: {
        Authorization: `Basic ${apiKey}`,
        'X-Csi-Version': apiVersion,
      },
    });
  }

  async get(uri) {
    try {
      const response = await this.instance.get(uri);
      return response;
    } catch (error) {
      throw new Error(err).stack;
    }
  }

  async post(uri, params) {
    return this.instance.post(uri, params);
  }
}
