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

  constructor({ projectId, apiKeySecret }) {
    if (!projectId) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Ipfs_constructor,
          message: ERROR_LOG.message.no_infura_projectID_supplied,
        }),
      );
    }

    if (!apiKeySecret) {
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
        authorization: `Basic ${toBase64({ projectId, secretId: apiKeySecret })}`,
      },
    });
  }

  /** Upload free content data on ipfs
   * @param {string} metadata any string
   * @returns {Promise<string>} Ipfs hash of the stored data
   */
  async uploadContent({ source }) {
    return `ipfs://${(await this.ipfsClient.add(source)).cid.toString()}`;
  }

  /** Upload file on ipfs
   * @param {string} metadata path to local file or url
   * @returns {Promise<string>} Ipfs hash of the stored data
   */
  async uploadFile({ source }) {
    try {
      if (isURI(source)) {
        const inputSrc = urlSource(source);
        return `ipfs://${(await this.ipfsClient.add(inputSrc)).cid.toString()}`;
      }

      if (!fs.existsSync(source)) {
        throw new Error(
          errorLogger({
            location: ERROR_LOG.location.Ipfs_uploadFile,
            message: ERROR_LOG.message.unexisting_file,
          }),
        );
      }
      const inputSrc = fs.createReadStream(source);
      return `ipfs://${(await this.ipfsClient.add(inputSrc)).cid.toString()}`;
    } catch (error) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Ipfs_uploadFile,
          message: error.message || ERROR_LOG.message.an_error_occured_with_ipfs_api,
        }),
      );
    }
  }

  /** upload array of metadata on ipfs
   * @param {Array<any>} metadata an array of valid JSON Metadata
   * @returns {Promise<string>} Ipfs hash of the stored data
   */
  async uploadArray({ sources, isErc1155 = false }) {
    if (!sources.length > 0) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Ipfs_uploadDirectory,
          message: ERROR_LOG.message.array_should_not_be_empty,
        }),
      );
    }
    try {
      const uploadedDirectory = [];
      const files = sources.map((source, index) => {
        return {
          path: isErc1155 === true ? `${index}.json` : `${index}`,
          content: source,
        };
      });

      for await (const file of this.ipfsClient.addAll(files, {
        wrapWithDirectory: true,
      })) {
        uploadedDirectory.push(file);
      }

      return `ipfs://${[...uploadedDirectory].pop().cid.toString()}`;
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

  async closeConnection() {
    this.ipfsClient.stop();
  }
}
