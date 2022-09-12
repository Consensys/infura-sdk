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

  async storeNftMetadata(metadataInput) {
    let metadata; let
      result;
    // Load input
    try {
      metadata = JSON.parse(metadataInput);
    } catch (error) {
      throw new Error('Input should be a valid JSON: ', error);
    }

    // upload 'image' property to IPFS
    try {
      const cidImg = await this.client.uploadFile({ source: metadata?.image });
      metadata.image = `https://ipfs.io/ipfs/${cidImg}`;
    } catch (error) {
      throw new Error('Image input has not been uploaded: ', error);
    }

    // upload complete metadata to IPFS
    try {
      const cidFile = await this.client.uploadFile({ source: metadata });
      result = {
        type: 'nftMetadata',
        cid: cidFile,
        name: metadata?.name,
      };
    } catch (error) {
      throw new Error('Image input has not been uploaded: ', error);
    }
    return result;
  }
}
