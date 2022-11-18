import { HttpService } from '../../src/services/httpService.js';
import { toBase64 } from '../../src/lib/utils.js';

export default class IpfsApiClient {
  httpClient;

  constructor() {
    this.url = 'https://nft-api.infura-ipfs.io/ipfs/';
    const apiKey = toBase64({
      projectId: process.env.INFURA_IPFS_PROJECT_ID,
      secretId: process.env.INFURA_IPFS_PROJECT_SECRET,
    });
    this.httpClient = new HttpService(this.url, apiKey);
  }

  getIpfsImage = async ipfsHash => {
    const response = await this.httpClient.get(`${this.url}${ipfsHash}`);

    return { status: response.status, data: response.data };
  };
}
