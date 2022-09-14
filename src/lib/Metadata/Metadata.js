/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

import { readFileSync } from 'fs';
import IPFS from '../../services/ipfsService.js';
import { ERROR_LOG, errorLogger } from '../error/handler.js';

export default class Metadata {
  DEFAULT_ERROR = 'Image / Metadata input has not been uploaded: ';

  VALIDATION_ERROR = 'Input should be a valid JSON or a filepath: ';

  UNSUPPORTED_ERROR = 'Input is not supported (not JSON or filepath): ';

  constructor({ ipfsInfuraProjectId, ipfsInfuraSecetKey }) {
    // TODO: change location for logger
    if (!ipfsInfuraProjectId) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Ipfs_constructor,
          message: ERROR_LOG.message.no_infura_projectID_supplied,
        }),
      );
    }

    // TODO: change location for logger
    if (!ipfsInfuraSecetKey) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Ipfs_constructor,
          message: ERROR_LOG.message.no_infura_projectSecret_supplied,
        }),
      );
    }

    // Hardcoded url?
    this.client = new IPFS({
      ipfsUrl: 'ipfs.infura.io:5001',
      projectId: ipfsInfuraProjectId,
      projectSecret: ipfsInfuraSecetKey,
    });
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
      switch (typeof candidateInput) {
        // file path
        case 'string':
          metadata = JSON.parse(readFileSync(candidateInput));
          break;

        // JSON object
        case 'object':
          metadata = JSON.parse(candidateInput);
          break;

        // unsupported input
        default:
          throw new Error(this.UNSUPPORTED_ERROR);
      }
    } catch (error) {
      throw new Error(this.VALIDATION_ERROR, error);
    }
    return metadata;
  }
}
