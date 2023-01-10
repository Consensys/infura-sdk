import { utils } from 'ethers';
import { log, Logger } from '../Logger';
import HttpService from '../../services/httpService';
import { MetadataDTO, MetadataInfo, NftDTO } from '../SDK/types';

type PublicAddressOptions = {
  publicAddress: string;
  includeMetadata?: boolean;
};

type ContractAddressOptions = {
  contractAddress: string;
};

type GetTokenMetadataOptions = {
  contractAddress: string;
  tokenId: number;
};

export default class Api {
  private readonly apiPath: string;

  private readonly httpClient: HttpService;

  constructor(apiPath: string, httpClient: HttpService) {
    this.apiPath = apiPath;
    this.httpClient = httpClient;
  }

  /**
   * Get contract metadata by contract address
   * @param {object} opts object containing all parameters
   * @param {string} opts.contractAddress address of the contract
   * @returns {Promise<MetadataInfo>} Contract metadata object
   */
  async getContractMetadata(opts: ContractAddressOptions): Promise<MetadataInfo> {
    if (!opts.contractAddress || !utils.isAddress(opts.contractAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_contract_address, {
        location: Logger.location.SDK_GETCONTRACTMETADATA,
      });
    }

    const apiUrl = `${this.apiPath}/nfts/${opts.contractAddress}`;
    const {
      data: { symbol, name, tokenType },
    } = await this.httpClient.get(apiUrl);

    return { symbol, name, tokenType };
  }

  /**
   * Get NFTs by an account address
   * @param {object} opts object containing all parameters
   * @param  {string} opts.address Account address
   * @param  {string} opts.includeMetadata flag to include the metadata object in the results
   * @returns {Promise<Array>} List of NFTs with metadata if 'includeMetadata' flag is true
   */
  async getNFTs(opts: PublicAddressOptions): Promise<NftDTO> {
    if (!opts.publicAddress || !utils.isAddress(opts.publicAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_public_address, {
        location: Logger.location.SDK_GETNFTS,
      });
    }

    const apiUrl = `${this.apiPath}/accounts/${opts.publicAddress}/assets/nfts`;

    const { data } = await this.httpClient.get(apiUrl);

    if (!opts.includeMetadata) {
      return {
        ...data,
        assets: data.assets.map((asset: any) => {
          const { metadata, ...rest } = asset;
          return rest;
        }),
      };
    }

    return data;
  }

  /** Get list of NFTs for the specified contract address
   * @param {object} opts object containing all parameters
   * @param {string} opts.contractAddress address of the contract to get the list of NFTs
   * @returns {Promise<object>} List of NFTs with metadata
   */
  async getNFTsForCollection(opts: ContractAddressOptions): Promise<NftDTO> {
    if (!opts.contractAddress || !utils.isAddress(opts.contractAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_contract_address, {
        location: Logger.location.SDK_GETNFTSFORCOLLECTION,
      });
    }
    const apiUrl = `${this.apiPath}/nfts/${opts.contractAddress}/tokens`;

    const { data } = await this.httpClient.get(apiUrl);
    return data;
  }

  /** Get a token metadata
   * @param {object} opts object containing all parameters
   * @param {string} opts.contractAddress address of the contract which holds the token
   * @param {number} opts.tokenId ID of the token
   * @returns {Promise<object>} Token metadata
   */
  async getTokenMetadata(opts: GetTokenMetadataOptions): Promise<MetadataDTO> {
    if (!opts.contractAddress || !utils.isAddress(opts.contractAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_contract_address, {
        location: Logger.location.SDK_GETTOKENMETADATA,
      });
    }

    if (!Number.isFinite(opts.tokenId)) {
      log.throwArgumentError(Logger.message.tokenId_must_be_integer, 'tokenId', opts.tokenId, {
        location: Logger.location.SDK_GETTOKENMETADATA,
      });
    }

    const apiUrl = `${this.apiPath}/nfts/${opts.contractAddress}/tokens/${opts.tokenId}`;

    const { data } = await this.httpClient.get(apiUrl);
    return data;
  }
}
