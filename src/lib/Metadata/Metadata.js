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

  constructor({ projectId, projectSecret, ipfsUrl = 'ipfs.infura.io:5001' }) {
    // TODO: change location for logger
    if (!projectId) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Ipfs_constructor,
          message: ERROR_LOG.message.no_infura_projectID_supplied,
        }),
      );
    }

    // TODO: change location for logger
    if (!projectSecret) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Ipfs_constructor,
          message: ERROR_LOG.message.no_infura_projectSecret_supplied,
        }),
      );
    }

    this.client = new IPFS({
      ipfsUrl,
      projectId,
      projectSecret,
    });
  }

  async storeNftMetadata(metadataInput) {
    let result;
    const metadata = this.parseInput(metadataInput);

    try {
      // upload 'image' property to IPFS
      if (metadata.image) {
        const cidImg = await this.client.uploadFile({ source: metadata?.image });
        metadata.image = `https://ipfs.io/ipfs/${cidImg}`;
      }
      // upload 'animation_url' property to IPFS
      if (metadata.animation_url) {
        const cidAnim = await this.client.uploadFile({ source: metadata?.animation_url });
        metadata.animation_url = `https://ipfs.io/ipfs/${cidAnim}`;
      }
    } catch (error) {
      throw new Error(this.DEFAULT_ERROR, error);
    }

    // upload metadata file to IPFS
    try {
      const cidFile = await this.client.uploadFile({ source: metadata });
      result = {
        type: 'nftMetadata',
        cid: cidFile,
        ...metadata,
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
        ...metadata,
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
          metadata = candidateInput;
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
