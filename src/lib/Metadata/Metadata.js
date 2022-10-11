/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

import { readFileSync } from 'fs';

import IPFS from '../../services/ipfsService.js';
import { ERROR_LOG, errorLogger } from '../error/handler.js';

export default class Metadata {
  IPFS_BASE_URL = 'https://ipfs.io/ipfs/';

  constructor({ projectId, projectSecret }) {
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
      projectId,
      projectSecret,
    });
  }

  createTokenURI(metadataInput) {
    return this.upload({
      metadataObject: Metadata.parseInput(metadataInput),
      isContract: false,
    });
  }

  createContractURI(metadataInput) {
    return this.upload({
      metadataObject: Metadata.parseInput(metadataInput),
      isContract: true,
    });
  }

  async upload({ metadataObject, isContract }) {
    let result = { ...metadataObject };
    result.image = await this.uploadFileAndGetLink({
      obj: metadataObject,
      field: 'image',
    });
    result.animation_url = await this.uploadFileAndGetLink({
      obj: metadataObject,
      field: 'animation_url',
    });

    try {
      // upload metadata file to IPFS
      const cidFile = await this.client.uploadObject({ source: result });
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

  async uploadFileAndGetLink({ obj, field }) {
    let res;
    try {
      res = obj[field]
        ? this.IPFS_BASE_URL + (await this.client.uploadFile({ source: obj[field] }))
        : '';
    } catch (error) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Metadata_uploadFileAndGetLink,
          message: error.message || ERROR_LOG.message.media_upload_failed,
        }),
      );
    }
    return res;
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
