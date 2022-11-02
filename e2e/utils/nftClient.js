import { NFT_API_URL } from '../../src/lib/NFT/constants.js';
import { HttpService } from '../../src/services/httpService.js';

const token = 'Mjg5MTBkNDRiMzlkNGE5OThjMmVjYWVjYzEyMTlkMzQ6ZTBhMjgzNjBlMWY1NDM2NjhiMjg3NjNjMzI0OWE0OGQ=';

export default class NFTApiClient {
  url;

  apiKey;

  network;

  networkId;

  httpClient;

  constructor() {
    this.url = NFT_API_URL;
    this.networkId = 5;

    this.url = `${this.url}/networks/${this.networkId}`;
    console.log(this.url);
    this.httpClient = new HttpService(this.url, token);
  }

  getNftCollectionMetadata = async tokenAddress => {
    console.log(this.url);
    const response = await this.httpClient.get(`${this.url}/nfts/${tokenAddress}`);

    return { status: response.status, data: response.data };
  };

  getAllNftsByOwner = async ownerAddress => {
    console.log(this.url);
    const response = await this.httpClient.get(`${this.url}/accounts/${ownerAddress}/assets/nfts`);

    return { status: response.status, data: response.data };
  };

  getNftMetadeta = async (tokenAddress, tokenId) => {
    console.log(this.url);
    const response = await this.httpClient.get(
      `${this.url}/nfts/${tokenAddress}/tokens/${tokenId}`,
    );

    return { status: response.status, data: response.data };
  };

  getAllNfsFromCollection = async collectionAddress => {
    console.log(this.url);
    const response = await this.httpClient.get(`${this.url}/nfts/${collectionAddress}/tokens`);
    return { status: response.status, data: response.data };
  };
}
