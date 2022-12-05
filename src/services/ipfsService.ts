/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */

import fs from 'fs';
import { create as ipfsClient, urlSource } from 'ipfs-http-client';
import { Logger, log } from '../lib/Logger/index';

import { isURI } from '../lib/utils';
import { ImportCandidateStream } from './types';
export default class IPFS {
  ipfsClient;

  constructor({
    projectId,
    apiKeySecret,
  }: {
    projectId: string | undefined;
    apiKeySecret: string | undefined;
  }) {
    if (!projectId) {
      log.throwArgumentError(Logger.message.no_infura_projectID_supplied, 'projectId', projectId, {
        location: Logger.location.IPFSSERVICE_CONSTRUCTOR,
      });
    }

    if (!apiKeySecret) {
      log.throwArgumentError(
        Logger.message.no_infura_projectSecret_supplied,
        'apiKeySecret',
        apiKeySecret,
        {
          location: Logger.location.IPFSSERVICE_CONSTRUCTOR,
        },
      );
    }

    this.ipfsClient = ipfsClient({
      url: 'https://ipfs.infura.io:5001',
      headers: {
        authorization: `Basic ${Buffer.from(`${projectId}:${apiKeySecret}`).toString('base64')}`,
      },
    });
  }

  /** Upload free content data on ipfs
   * @param {string} metadata any string
   * @returns {Promise<string>} Ipfs hash of the stored data
   */
  async uploadContent({ source }: { source: string }) {
    return `ipfs://${(await this.ipfsClient.add(source)).cid.toString()}`;
  }

  /** Upload file on ipfs
   * @param {string} metadata path to local file or url
   * @returns {Promise<string>} Ipfs hash of the stored data
   */
  async uploadFile({ source }: { source: string }) {
    try {
      if (isURI(source)) {
        const inputSrc = urlSource(source);
        return `ipfs://${(await this.ipfsClient.add(inputSrc)).cid.toString()}`;
      }

      if (!fs.existsSync(source)) {
        throw Logger.message.unexisting_file;
      }

      const inputSrc = fs.createReadStream(source);

      return `ipfs://${(await this.ipfsClient.add(inputSrc)).cid.toString()}`;
    } catch (error) {
      return log.throwArgumentError(Logger.message.an_error_occured_with_ipfs_api, 'file', source, {
        location: Logger.location.IPFSSERVICE_UPLOADFILE,
        error: `${error}`,
      });
    }
  }

  /** upload array of metadata on ipfs
   * @param {Array<any>} metadata an array of valid JSON Metadata
   * @returns {Promise<string>} Ipfs hash of the stored data
   */
  async uploadArray({ sources, isErc1155 = false }: { sources: Array<any>; isErc1155: boolean }) {
    if (sources.length <= 0) {
      return log.throwArgumentError(Logger.message.array_should_not_be_empty, 'sources', sources, {
        location: Logger.location.IPFSSERVICE_UPLOADDIRECTORY,
      });
    }
    try {
      const uploadedDirectory = [];
      const files = sources.map((source, index) => {
        return {
          path: isErc1155 ? `${index}.json` : `${index}`,
          content: source,
        };
      }) as ImportCandidateStream;

      for await (const file of this.ipfsClient.addAll(files, {
        wrapWithDirectory: true,
      })) {
        uploadedDirectory.push(file);
      }
      const item = [...uploadedDirectory].pop();
      return `ipfs://${item?.cid.toString()}/`;
    } catch (error) {
      return log.throwError(Logger.message.an_error_occured_with_ipfs_api, Logger.code.IPFS, {
        location: Logger.location.IPFSSERVICE_UPLOADDIRECTORY,
        error,
      });
    }
  }

  async unPinFile({ hash }: { hash: string }) {
    try {
      return await this.ipfsClient.pin.rm(hash);
    } catch (error) {
      return log.throwError(Logger.message.an_error_occured_with_ipfs_api, Logger.code.IPFS, {
        location: Logger.location.IPFSSERVICE_UNPINFILE,
        error,
      });
    }
  }

  async closeConnection() {
    this.ipfsClient.stop();
  }
}
