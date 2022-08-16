/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */
/* eslint-disable */
import { ERROR_LOG, errorLogger } from '../error/handler.js';
import fs from 'fs';
import { create as ipfsClient, globSource } from 'ipfs-http-client';

export default class IPFS {
  #ipfsClient;

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

    const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

    this.#ipfsClient = ipfsClient({
      url: ipfsUrl,
      headers: {
        authorization: auth,
      },
    });
  }

  async uploadFile({ source }) {
    try {
      return await this.#save({ source });
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
      return await this.#saveDirectory({ source });
    } catch (error) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Ipfs_uploadFile,
          message: error.message || ERROR_LOG.message.an_error_occured_with_ipfs_api,
        }),
      );
    }
  }

  async unPinFile({ hash }) {
    try {
      return await this.#ipfsClient.pin.rm(hash);
    } catch (error) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Ipfs_unPinFile,
          message: error.message || ERROR_LOG.message.an_error_occured_with_ipfs_api,
        }),
      );
    }
  }

  async #save({ source }) {
    const isFile = fs.lstatSync(source).isFile();
    if (!isFile) {
      throw new Error('Source should be a file');
    }
    const stream = fs.createReadStream(source);

    return (await this.#ipfsClient.add(stream)).cid.toString();
  }

  async #saveDirectory({ source }) {
    const isDirectory = fs.lstatSync(source).isDirectory();
    if (!isDirectory) {
      throw new Error('Source should be a Directory');
    }

    const uploadedDirectory = [];
    for await (const file of this.#ipfsClient.addAll(globSource(source, '**/*'), {
      wrapWithDirectory: true,
    })) {
      uploadedDirectory.push(file);
    }

    return [...uploadedDirectory].pop().cid.toString();
  }
}
