import HttpClient from './httpClient';

export default class IpfsApiClient {
  httpClient;

  url: string;

  constructor() {
    this.url = 'https://nft-api.infura-ipfs.io/ipfs/';
    this.httpClient = new HttpClient(this.url);
  }

  getIpfsImage = async (ipfsHash: string) => {
    const response = await this.httpClient.get(`${this.url}${ipfsHash}`);

    return { status: response.status, data: response.data };
  };
}
