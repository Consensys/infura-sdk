/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */

import axios from 'axios';

export class HttpService {
  constructor(baseURL, apiKey) {
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
