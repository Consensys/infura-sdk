/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

import { readFileSync } from 'fs';

import IPFS from '../../services/ipfsService.js';
import { ERROR_LOG, errorLogger } from '../error/handler.js';

export default class Metadata {
  constructor({ projectId, projectSecret, ipfsUrl = 'ipfs.infura.io:5001' }) {
    if (!projectId) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Metadata_constructor,
          message: ERROR_LOG.message.no_infura_projectID_supplied,
        }),
      );
    }

    if (!projectSecret) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Metadata_constructor,
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

  createTokenURI(metadataInput) {
    return this.upload({
      metadataObject: Metadata.parseInput(metadataInput),
      isContract: false,
      includeAnimation: true,
    });
  }

  createContractURI(metadataInput) {
    return this.upload({
      metadataObject: Metadata.parseInput(metadataInput),
      isContract: true,
    });
  }

  async upload({ metadataObject, isContract, includeAnimation = false }) {
    let result = { ...metadataObject };
    try {
      // upload 'image' property to IPFS
      if (metadataObject.image) {
        const cidImg = await this.client.uploadFile({ source: metadataObject.image });
        result.image = `https://ipfs.io/ipfs/${cidImg}`;
      }

      // upload 'animation_url' property to IPFS
      if (includeAnimation && metadataObject.animation_url) {
        const cidAnim = await this.client.uploadFile({ source: metadataObject.animation_url });
        result.animation_url = `https://ipfs.io/ipfs/${cidAnim}`;
      }
    } catch (error) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Metadata_upload,
          message: error.message || ERROR_LOG.message.media_upload_failed,
        }),
      );
    }

    try {
      // upload metadata file to IPFS
      const cidFile = await this.client.uploadObject({ source: metadataObject });
      result = {
        type: isContract ? 'collectionMetadata' : 'nftMetadata',
        cid: cidFile,
        ...result,
      };
    } catch (error) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Metadata_upload,
          message: error.message || ERROR_LOG.message.metadata_upload_failed,
        }),
      );
    }
    return result;
  }

  static parseInput(candidateInput) {
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
          throw new Error(
            errorLogger({
              location: ERROR_LOG.location.Metadata_parseInput,
              message: ERROR_LOG.message.unsupported_input,
            }),
          );
      }
    } catch (error) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Metadata_parseInput,
          message: ERROR_LOG.message.invalid_input,
        }),
      );
    }
    return metadata;
  }
}
