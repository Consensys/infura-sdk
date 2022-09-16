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

  constructor({ ipfsUrl, projectId, projectSecret }) {
    if (!ipfsUrl) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Ipfs_constructor,
          message: ERROR_LOG.message.no_infura_ipfsUrl_supplied,
        }),
      );
    }

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
      url: ipfsUrl,
      headers: {
        authorization: `Basic ${toBase64({ projectId, secretId: projectSecret })}`,
      },
    });
  }

  async uploadFile({ source }) {
    try {
      // input can be a local file (absolute path) or a URL
      const inputSrc = isURI(source)
        ? urlSource(source)
        : fs.lstatSync(source).isFile()
        ? fs.createReadStream(source)
        : '';
      if (!inputSrc) {
        throw new Error('Source should be a file or a valid URL');
      }

      return (await this.ipfsClient.add(inputSrc)).cid.toString();
    } catch (error) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Ipfs_uploadFile,
          message: error.message || ERROR_LOG.message.an_error_occured_with_ipfs_api,
        }),
      );
    }
  }

  async uploadObject({ source }) {
    try {
      return (
        await this.ipfsClient.add({
          content: JSON.stringify(source),
        })
      ).cid.toString();
    } catch (error) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Ipfs_uploadObject,
          message: error.message || ERROR_LOG.message.an_error_occured_with_ipfs_api,
        }),
      );
    }
  }

  async uploadDirectory({ source }) {
    try {
      const isDirectory = fs.lstatSync(source).isDirectory();
      if (!isDirectory) {
        // TODO: add logger
        throw new Error('Source should be a Directory');
      }

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
