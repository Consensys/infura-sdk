import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import { Readable } from 'stream';
import { Logger, log } from '../../../src/lib/Logger';

export default class IpfsServerClient {
  private instance: AxiosInstance;

  constructor({
    baseURL,
    projectId,
    apiKeySecret,
  }: {
    baseURL: string;
    projectId: string;
    apiKeySecret: string;
  }) {
    if (!baseURL)
      log.throwMissingArgumentError(Logger.message.no_base_url, {
        location: Logger.location.IPFS_SERVER_CONSTRUCTOR,
      });

    if (!projectId)
      log.throwMissingArgumentError(Logger.message.no_projectId_supplied, {
        location: Logger.location.IPFS_SERVER_CONSTRUCTOR,
      });

    if (!apiKeySecret)
      log.throwMissingArgumentError(Logger.message.no_secretId_supplied, {
        location: Logger.location.IPFS_SERVER_CONSTRUCTOR,
      });

    this.instance = axios.create({
      baseURL,
      headers: {
        authorization: `Basic ${Buffer.from(`${projectId}:${apiKeySecret}`).toString('base64')}`,
      },
    });
  }

  async add(content: string | Readable): Promise<string> {
    const formData = new FormData();
    formData.append('file', content);

    try {
      const response = await this.instance.post('/add', formData, {
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
        },
      });
      return response.data.Hash;
    } catch (error) {
      return log.throwArgumentError(
        Logger.message.an_error_occured_with_ipfs_api,
        'file',
        content,
        {
          location: Logger.location.IPFSSERVICE_UPLOADFILE,
          error: `${error}`,
        },
      );
    }
  }

  async addAll(files: { path: string; content: any }[]): Promise<any> {
    const formData = new FormData();

    files.forEach(file => {
      formData.append(file.path, file.content, {
        filename: file.path,
      });
    });

    try {
      const response = await this.instance.post(`/add?wrap-with-directory=true`, formData, {
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
        },
      });

      const arr = response.data.split('\n').filter(Boolean).map(JSON.parse);
      const lastItem = arr.pop();
      return lastItem.Hash;
    } catch (error) {
      return log.throwArgumentError(Logger.message.an_error_occured_with_ipfs_api, 'file', files, {
        location: Logger.location.IPFSSERVICE_UPLOADFILE,
        error: `${error}`,
      });
    }
  }
}
