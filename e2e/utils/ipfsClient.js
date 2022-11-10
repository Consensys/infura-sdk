import { HttpService } from '../../src/services/httpService.js';

export default class IpfsApiClient {
  httpClient;

  constructor() {
    this.url = 'https://nft-api.infura-ipfs.io/ipfs/';
    this.httpClient = new HttpService(this.url, process.env.INFURA_IPFS_PROJECT_SECRET);
  }

  getIpfsImage = async ipfsHash => {
    const response = await this.httpClient.get(`${this.url}${ipfsHash}`);

    return { status: response.status, data: response.data };
  };
}
