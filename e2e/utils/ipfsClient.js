import { HttpService } from '../../src/services/httpService.js';

export default class IpfsApiClient {
  httpClient;

  constructor() {
    this.url = 'ipfs://';
    this.httpClient = new HttpService(this.url);
  }

  getIpfsImage = async ipfsHash => {
    const response = await this.httpClient.get(`https://nft-api.infura-ipfs.io/ipfs/${ipfsHash}`);

    return { status: response.status, data: response.data };
  };
}
