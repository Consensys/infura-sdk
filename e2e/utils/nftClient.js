import { toBase64 } from '../../src/lib/utils.js';
import { NFT_API_URL } from '../../src/lib/NFT/constants.js';
import { HttpService } from '../../src/services/httpService.js';

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
    this.httpClient = new HttpService(
      this.url,
      toBase64({
        projectId: process.env.INFURA_PROJECT_ID,
        secretId: process.env.INFURA_PROJECT_SECRET,
      }),
    );
  }

  getNftCollectionMetadata = async tokenAddress => {
    const response = await this.httpClient.get(`${this.url}/nfts/${tokenAddress}`);

    return { status: response.status, data: response.data };
  };

  getAllNftsByOwner = async ownerAddress => {
    const response = await this.httpClient.get(`${this.url}/accounts/${ownerAddress}/assets/nfts`);

    return { status: response.status, data: response.data };
  };

  getNftMetadeta = async (tokenAddress, tokenId) => {
    const response = await this.httpClient.get(
      `${this.url}/nfts/${tokenAddress}/tokens/${tokenId}`,
    );

    return { status: response.status, data: response.data };
  };

  getAllNfsFromCollection = async collectionAddress => {
    const response = await this.httpClient.get(`${this.url}/nfts/${collectionAddress}/tokens`);
    return { status: response.status, data: response.data };
  };
}
