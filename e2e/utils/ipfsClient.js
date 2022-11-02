import { HttpService } from '../../src/services/httpService.js';

const token = 'Mjg5MTBkNDRiMzlkNGE5OThjMmVjYWVjYzEyMTlkMzQ6ZTBhMjgzNjBlMWY1NDM2NjhiMjg3NjNjMzI0OWE0OGQ=';

export default class IpfsApiClient {
  httpClient;

  constructor() {
    this.url = 'ipfs://';
    this.httpClient = new HttpService(this.url, token);
  }

  getIpfsImage = async ipfsHash => {
    const response = await this.httpClient.get(`https://nft-api.infura-ipfs.io/ipfs/${ipfsHash}`);

    return { status: response.status, data: response.data };
  };
}
