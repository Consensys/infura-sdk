/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */
/* eslint-disable */
import { HttpService } from '../../services/httpService.js';
import { ERROR_LOG, errorLogger } from '../error/handler.js';
import { isURI, toBase64 } from '../utils.js';
import fs from 'fs';
import FormData from 'form-data';

export default class IPFS {
  #httpClient;

  constructor({ ipfsUrl, projectId = null, projectSecret = null }) {
    this.#httpClient = new HttpService(ipfsUrl, toBase64({ projectId, secretId: projectSecret }));
  }

  async uploadFile({ name, source }) {
    try {
      return await this.#save({ name, source });
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
    const { data } = await this.#httpClient.post('/api/v0/pin/rm', null, {
      params: {
        arg: hash,
      },
    });

    return data;
  }

  async #save({ name, source }) {
    const stream = await this.#createStream(source);

    const formData = new FormData();
    formData.append('file', stream, `${name}`);

    const { data } = await this.#httpClient.post('/api/v0/add', formData, {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
      },
    });

    return data;
  }

  async #createStream(image) {
    if (isURI(image)) {
      const response = await HttpService.getImageStream(image);
      return response.data;
    }
    return fs.createReadStream(image);
  }
}
