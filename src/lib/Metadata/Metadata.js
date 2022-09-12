/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

import IPFS from '../../services/ipfsService.js';

export default class Metadata {
  constructor({ ipfsInfuraProjectId, ipfsInfuraSecetKey }) {
    this.client = new IPFS('ipfs.infura.io:5001', ipfsInfuraProjectId, ipfsInfuraSecetKey);
  }
}
