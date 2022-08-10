/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */
/* eslint-disable */

import httpService from '../services/httpService.js';
import errorLogger from '../error/handler.js';

export default class IPFS {
  #projectId;
  #projectSecret;
  #ipfsUrl;

  constructor({ projectId, projectSecret, ipfsUrl }) {
    this.#projectId = projectId;
    this.#projectSecret = projectSecret;
    this.#ipfsUrl = ipfsUrl;
  }

  saveMedia({ name, data }) {}

  saveMetadata({ name, data }) {}
}
