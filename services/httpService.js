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

    this.instance = axios.create({
      baseURL: baseURL,
      headers: {
        Authorization: `Basic ${apiKey}`,
      },
    });
  }

  get(uri) {
    return this.instance.get(uri);
  }

  post(uri, params) {
    return this.instance.post(uri, params);
  }
}
