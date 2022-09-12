/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

import { readFileSync } from 'fs';
import IPFS from '../../services/ipfsService.js';

export default class Metadata {
  DEFAULT_ERROR = 'Image / Metadata input has not been uploaded: ';

  VALIDATION_ERROR = 'Input should be a valid JSON or a filepath: ';

  constructor({ ipfsInfuraProjectId, ipfsInfuraSecetKey }) {
    this.client = new IPFS('ipfs.infura.io:5001', ipfsInfuraProjectId, ipfsInfuraSecetKey);
  }

  async storeNftMetadata(metadataInput) {
    let result;
    const metadata = this.parseInput(metadataInput);

    // upload 'image' property to IPFS
    try {
      const cidImg = await this.client.uploadFile({ source: metadata?.image });
      metadata.image = `https://ipfs.io/ipfs/${cidImg}`;
    } catch (error) {
      throw new Error(this.DEFAULT_ERROR, error);
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
      throw new Error(this.DEFAULT_ERROR, error);
    }
    return result;
  }

  async storeCollectionMetadata(metadataInput) {
    let result;
    const metadata = this.parseInput(metadataInput);

    // upload 'image' property to IPFS
    try {
      const cidImg = await this.client.uploadFile({ source: metadata?.image });
      metadata.image = `https://ipfs.io/ipfs/${cidImg}`;
    } catch (error) {
      throw new Error(this.DEFAULT_ERROR, error);
    }

    // upload complete metadata to IPFS
    try {
      const cidFile = await this.client.uploadFile({ source: metadata });
      result = {
        type: 'collectionMetadata',
        cid: cidFile,
        name: metadata?.name,
      };
    } catch (error) {
      throw new Error(this.DEFAULT_ERROR, error);
    }
    return result;
  }

  parseInput(candidateInput) {
    let metadata;
    try {
      // JSON object
      if (typeof candidateInput === 'object') {
        metadata = JSON.parse(candidateInput);
        // string == file path
      } else if (typeof candidateInput === 'string') {
        metadata = JSON.parse(readFileSync(candidateInput));
      }
    } catch (error) {
      throw new Error(this.VALIDATION_ERROR, error);
    }
    return metadata;
  }
}
