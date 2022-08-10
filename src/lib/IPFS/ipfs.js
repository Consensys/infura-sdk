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

  saveMedia({ name, data }) {
    // check media type by extension (check for npm package for validating extensions)
    // this.#save()
  }

  saveMetadata({ name, data }) {
    // check if file is json
    // this.#save()
  }

  #save({ name, data }) {
    // check if data is local file or http via startsWith
    // convert file to buffer and create stream
    // post to ipfs url
  }
}
