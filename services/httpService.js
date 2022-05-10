/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */

import axios from 'axios';

export default class HttpService {
  constructor() {}

  get(uri) {
    return axios.get(uri);
  }

  post(uri, params) {
    return axios.post(uri, params);
  }
}
