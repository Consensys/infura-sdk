/*!
 * Copyright(c) CConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */
import axios from 'axios';

export class HttpService {
  instance = null;
  _timeout = 1000;

  constructor(baseURL) {
    this.instance = axios.create({
      baseURL: baseURL,
      //timeout: this._timeout,
    });
  }
}
