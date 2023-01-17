import { utils } from 'ethers';
import { log, Logger } from '../Logger';
import HttpService from '../../services/httpService';
import { MetadataDTO, MetadataInfo, NftDTO, TransfersDTO } from '../SDK/types';
import { isValidPositiveNumber } from '../utils';

type PublicAddressOptions = {
  publicAddress: string;
  includeMetadata?: boolean;
  cursor?: string;
};

type ContractAddressOptions = {
  contractAddress: string;
  cursor?: string;
};

type GetTokenMetadataOptions = {
  contractAddress: string;
  tokenId: number;
};

export type GetTransfersByBlockNumberOptions = {
  blockNumber: string;
  cursor?: string;
};

export type GetTransfersByBlockHashOptions = {
  blockHash: string;
  cursor?: string;
};

export type GetNftTransfersByWallet = {
  walletAddress: string;
  cursor?: string;
};

export type GetNftTransfersFromBlockToBlock = {
  fromBlock: number;
  toBlock: number;
  cursor?: string;
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
    } = await this.httpClient.get(apiUrl, { cursor: opts.cursor });

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

    const { data } = await this.httpClient.get(apiUrl, { cursor: opts.cursor });

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

    const { data } = await this.httpClient.get(apiUrl, { cursor: opts.cursor });
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

  /**
   * Get transfers by block number
   * @param {object} opts object containing all parameters
   * @param {string} opts.blockNumber number of the block to get transfers from
   * @returns {Promise<object>} Transfers list
   */
  async getTransfersByBlockNumber(opts: GetTransfersByBlockNumberOptions): Promise<TransfersDTO> {
    if (!opts.blockNumber) {
      log.throwMissingArgumentError(Logger.message.invalid_block_number, {
        location: Logger.location.SDK_GETTRANSFERSBYBLOCKNUMBER,
      });
    }

    const apiUrl = `${this.apiPath}/nfts/block/transfers`;
    const { data } = await this.httpClient.get(apiUrl, {
      blockHashNumber: opts.blockNumber,
      cursor: opts.cursor,
    });
    return data;
  }

  /**
   * Get transfers by block hash
   * @param {object} opts object containing all parameters
   * @param {string} opts.blockHash number of the block to get transfers from
   * @returns {Promise<object>} Transfers list
   */
  async getTransfersByBlockHash(opts: GetTransfersByBlockHashOptions): Promise<TransfersDTO> {
    if (!opts.blockHash) {
      log.throwMissingArgumentError(Logger.message.invalid_block_hash, {
        location: Logger.location.SDK_GETTRANSFERSBYBLOCKHASH,
      });
    }

    const apiUrl = `${this.apiPath}/nfts/block/transfers`;
    const { data } = await this.httpClient.get(apiUrl, {
      blockHashNumber: opts.blockHash,
      cursor: opts.cursor,
    });
    return data;
  }

  /**
   * Get transfers by wallet address
   * @param {object} opts object containing all parameters
   * @returns {Promise<object>} Transfers list
   */
  async getNftsTransfersByWallet(opts: GetNftTransfersByWallet): Promise<TransfersDTO> {
    if (!opts.walletAddress || !utils.isAddress(opts.walletAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_account_address, {
        location: Logger.location.SDK_GET_TRANSFERS_BY_WALLET,
      });
    }

    const apiUrl = `${this.apiPath}/accounts/${opts.walletAddress}/assets/transfers`;
    const { data } = await this.httpClient.get(apiUrl, { cursor: opts.cursor });
    return data;
  }

  /**
   * Get transfers from block to block
   * @param {object} opts object containing all parameters
   * @returns {Promise<object>} Transfers list
   */
  async getTransferFromBlockToBlock(opts: GetNftTransfersFromBlockToBlock): Promise<TransfersDTO> {
    if (!opts.fromBlock || !isValidPositiveNumber(opts.fromBlock)) {
      log.throwMissingArgumentError(Logger.message.invalid_block, {
        location: Logger.location.SDK_GET_TRANSFERS_FROM_BLOCK_TO_BLOCK,
      });
    }

    if (!opts.toBlock || !isValidPositiveNumber(opts.toBlock)) {
      log.throwMissingArgumentError(Logger.message.invalid_block, {
        location: Logger.location.SDK_GET_TRANSFERS_FROM_BLOCK_TO_BLOCK,
      });
    }

    const apiUrl = `${this.apiPath}/nfts/transfers`;
    const { fromBlock, toBlock, cursor } = opts;
    const { data } = await this.httpClient.get(apiUrl, { fromBlock, toBlock, cursor });
    return data;
  }
}
