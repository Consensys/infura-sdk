/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */

import fs from 'fs';
import { Logger, log } from '../lib/Logger/index';

import { isURI } from '../lib/utils';
import IpfsServerClient from '../../e2e/utils/utils.ts/ipfsServerClient';
import axios from 'axios';
export default class IPFS {
  ipfsServerClient;

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

    this.ipfsServerClient = new IpfsServerClient({
      baseURL: 'https://ipfs.infura.io:5001/api/v0/',
      projectId: projectId || '',
      apiKeySecret: apiKeySecret || '',
    });
  }

  /** Upload free content data on ipfs
   * @param {string} metadata any string
   * @returns {Promise<string>} Ipfs hash of the stored data
   */
  async uploadContent({ source }: { source: string }) {
    return `ipfs://${await this.ipfsServerClient.add(source)}`;
  }

  /** Upload file on ipfs
   * @param {string} metadata path to local file or url
   * @returns {Promise<string>} Ipfs hash of the stored data
   */
  async uploadFile({ source }: { source: string }) {
    try {
      if (isURI(source)) {
        const response = await axios.get(source, { responseType: 'stream' });
        return `ipfs://${await this.ipfsServerClient.add(response.data)}`;
      }

      if (!fs.existsSync(source)) {
        throw Logger.message.unexisting_file;
      }

      const inputSrc = fs.createReadStream(source);

      return `ipfs://${await this.ipfsServerClient.add(inputSrc)}`;
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
      const files = sources.map((source, index) => {
        return {
          path: isErc1155 ? `${index}.json` : `${index}`,
          content: source,
        };
      });
      return `ipfs://${await this.ipfsServerClient.addAll(files)}/`;
    } catch (error) {
      return log.throwError(Logger.message.an_error_occured_with_ipfs_api, Logger.code.IPFS, {
        location: Logger.location.IPFSSERVICE_UPLOADDIRECTORY,
        error,
      });
    }
  }
}
