/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

import axios, { AxiosInstance } from 'axios';
import { Logger, log } from '../lib/Logger';
import { ApiVersion } from '../lib/utils';

export default class HttpService {
  private instance: AxiosInstance;

  constructor(baseURL: string, apiKey: string, apiVersion: ApiVersion) {
    if (!baseURL)
      log.throwMissingArgumentError(Logger.message.no_base_url, {
        location: Logger.location.HTTPSERVICE_CONSTRUCTOR,
      });
    if (!apiKey)
      log.throwMissingArgumentError(Logger.message.no_api_key, {
        location: Logger.location.HTTPSERVICE_CONSTRUCTOR,
      });

    this.instance = axios.create({
      baseURL,
      headers: {
        Authorization: `Basic ${apiKey}`,
        'X-Infura-User-Agent': 'infura/sdk-ts 1.0.0',
        'X-Csi-Version': apiVersion.toString(),
      },
    });
  }

  async get(uri: string, params?: any) {
    try {
      return await this.instance.get(uri, { params });
    } catch (error: any) {
      const reason = error?.response?.data?.message;
      const message = reason
        ? `${Logger.message.axios_error} : ${reason}`
        : `${Logger.message.axios_error}`;
      return log.throwError(message, Logger.code.API, {
        location: Logger.location.HTTPSERVICE_GET,
        error,
      });
    }
  }

  async post(uri: string, params?: any) {
    try {
      return await this.instance.post(uri, params);
    } catch (error: any) {
      const reason = error?.response?.data?.message;
      const message = reason
        ? `${Logger.message.axios_error} : ${reason}`
        : `${Logger.message.axios_error}`;
      return log.throwError(message, Logger.code.API, {
        location: Logger.location.HTTPSERVICE_POST,
        error,
      });
    }
  }
}
