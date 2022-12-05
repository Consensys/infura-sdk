/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

import axios, { AxiosInstance } from 'axios';
import { log, Logger } from '../../../src/lib/Logger';

export default class HttpClient {
  private instance: AxiosInstance;

  constructor(baseURL: string) {
    if (!baseURL)
      log.throwMissingArgumentError(Logger.message.no_base_url, {
        location: Logger.location.HTTPSERVICE_CONSTRUCTOR,
      });

    this.instance = axios.create({
      baseURL,
    });
  }

  async get(uri: string) {
    try {
      return await this.instance.get(uri);
    } catch (error) {
      return log.throwError(Logger.message.axios_error, Logger.code.API, {
        location: Logger.location.HTTPSERVICE_GET,
        error,
      });
    }
  }

  async post(uri: string, params?: any) {
    try {
      return await this.instance.post(uri, params);
    } catch (error) {
      return log.throwError(Logger.message.axios_error, Logger.code.API, {
        location: Logger.location.HTTPSERVICE_POST,
        error,
      });
    }
  }
}
