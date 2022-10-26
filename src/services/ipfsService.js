/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */

import fs from 'fs';
import { create as ipfsClient, globSource, urlSource } from 'ipfs-http-client';

import { ERROR_LOG, errorLogger } from '../lib/error/handler.js';
import { isURI, toBase64 } from '../lib/utils.js';

export default class IPFS {
  ipfsClient;

  constructor({ projectId, projectSecret }) {
    if (!projectId) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Ipfs_constructor,
          message: ERROR_LOG.message.no_infura_projectID_supplied,
        }),
      );
    }

    if (!projectSecret) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Ipfs_constructor,
          message: ERROR_LOG.message.no_infura_projectSecret_supplied,
        }),
      );
    }

    this.ipfsClient = ipfsClient({
      url: 'https://ipfs.infura.io:5001',
      headers: {
        authorization: `Basic ${toBase64({ projectId, secretId: projectSecret })}`,
      },
    });
  }

  async uploadFile({ source }) {
    try {
      if (isURI(source)) {
        const inputSrc = urlSource(source);
        return (await this.ipfsClient.add(inputSrc)).cid.toString();
      }

      if (fs.existsSync(source)) {
        const inputSrc = fs.createReadStream(source);
        return (await this.ipfsClient.add(inputSrc)).cid.toString();
      }

      return (await this.ipfsClient.add(source)).cid.toString();
    } catch (error) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Ipfs_uploadFile,
          message: error.message || ERROR_LOG.message.an_error_occured_with_ipfs_api,
        }),
      );
    }
  }

  async uploadDirectory({ source }) {
    try {
      const uploadedDirectory = [];
      for await (const file of this.ipfsClient.addAll(globSource(source, '**/*'), {
        wrapWithDirectory: true,
      })) {
        uploadedDirectory.push(file);
      }

      return [...uploadedDirectory].pop().cid.toString();
    } catch (error) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Ipfs_uploadDirectory,
          message: error.message || ERROR_LOG.message.an_error_occured_with_ipfs_api,
        }),
      );
    }
  }

  async unPinFile({ hash }) {
    try {
      return await this.ipfsClient.pin.rm(hash);
    } catch (error) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Ipfs_unPinFile,
          message: error.message || ERROR_LOG.message.an_error_occured_with_ipfs_api,
        }),
      );
    }
  }
}
