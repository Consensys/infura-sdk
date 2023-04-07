import { utils } from 'ethers';
import { log, Logger } from '../Logger';
import HttpService from '../../services/httpService';
import {
  CollectionsDTO,
  MetadataDTO,
  MetadataInfo,
  NftDTO,
  TransfersDTO,
  TradeDTO,
  OwnersDTO,
  SearchNftDTO,
} from '../SDK/types';
import { ApiVersion, isValidPositiveNumber } from '../utils';

type PublicAddressOptions = {
  publicAddress: string;
  includeMetadata?: boolean;
  cursor?: string;
  tokenAddresses?: string[];
};

type ContractAddressOptions = {
  contractAddress: string;
  cursor?: string;
};

type GetNftsForCollectionOptions = ContractAddressOptions & { resync?: boolean };

type GetTokenMetadataOptions = {
  contractAddress: string;
  tokenId: string;
  resyncMetadata?: boolean;
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
  fromBlock?: number;
  toBlock?: number;
  cursor?: string;
};

export type GetNftTransfersFromBlockToBlock = {
  fromBlock: number;
  toBlock: number;
  cursor?: string;
};

export type GetNftTransfersByContractAndToken = {
  contractAddress: string;
  tokenId: string;
  cursor?: string;
};

export type GetNftTransfersByContractAddress = {
  contractAddress: string;
  fromBlock?: number;
  toBlock?: number;
  cursor?: string;
};
export type GetNftOwnersByContractAddress = {
  contractAddress: string;
  cursor?: string;
};

export type GetNftOwnersByTokenAddressAndTokenId = {
  tokenAddress: string;
  tokenId: string;
  cursor?: string;
};

export type GetLowestTradePrice = {
  tokenAddress: string;
  days?: number;
};

export type GetCollectionsByWallet = {
  walletAddress: string;
  cursor?: string;
};

export type SearchNftsByString = {
  query: string;
  cursor?: string;
};

export default class Api {
  private readonly apiPath: string;

  private readonly httpClient: HttpService;

  private readonly apiVersion: string;

  constructor(apiPath: string, httpClient: HttpService, apiVersion: ApiVersion) {
    this.apiPath = apiPath;
    this.httpClient = httpClient;
    this.apiVersion = apiVersion;
  }

  getApiVersion() {
    return this.apiVersion;
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
    if (!opts.publicAddress) {
      log.throwMissingArgumentError(Logger.message.invalid_public_address, {
        location: Logger.location.SDK_GETNFTS,
      });
    }

    if (!utils.isAddress(opts.publicAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_public_address, {
        location: Logger.location.SDK_GETNFTS,
      });

      log.throwArgumentError(
        Logger.message.invalid_token_address,
        'publicAddress',
        opts.publicAddress,
        {
          location: Logger.location.SDK_GETNFTS,
        },
      );
    }

    if (opts.tokenAddresses) {
      opts.tokenAddresses.forEach(item => {
        if (!utils.isAddress(item)) {
          log.throwArgumentError(Logger.message.invalid_token_address, 'tokenAddresses', item, {
            location: Logger.location.SDK_GETNFTS,
          });
        }
      });
    }

    const apiUrl = `${this.apiPath}/accounts/${opts.publicAddress}/assets/nfts`;

    const { data } = await this.httpClient.get(apiUrl, {
      cursor: opts.cursor,
      tokenAddresses: opts.tokenAddresses,
    });

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
  async getNFTsForCollection(opts: GetNftsForCollectionOptions): Promise<NftDTO> {
    if (!opts.contractAddress || !utils.isAddress(opts.contractAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_contract_address, {
        location: Logger.location.SDK_GETNFTSFORCOLLECTION,
      });
    }
    const apiUrl = `${this.apiPath}/nfts/${opts.contractAddress}/tokens`;

    const { data } = await this.httpClient.get(apiUrl, {
      cursor: opts.cursor,
      resync: !!opts.resync,
    });
    return data;
  }

  /** Get a token metadata
   * @param {object} opts object containing all parameters
   * @param {string} opts.contractAddress address of the contract which holds the token
   * @param {string} opts.tokenId ID of the token
   * @returns {Promise<object>} Token metadata
   */
  async getTokenMetadata(opts: GetTokenMetadataOptions): Promise<MetadataDTO> {
    if (!opts.contractAddress || !utils.isAddress(opts.contractAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_contract_address, {
        location: Logger.location.SDK_GETTOKENMETADATA,
      });
    }

    if (!opts.tokenId) {
      log.throwMissingArgumentError(Logger.message.no_tokenId_supplied, {
        location: Logger.location.SDK_GETTOKENMETADATA,
      });
    }

    const apiUrl = `${this.apiPath}/nfts/${opts.contractAddress}/tokens/${opts.tokenId}`;

    const { data } = await this.httpClient.get(apiUrl, {
      resyncMetadata: !!opts.resyncMetadata,
    });
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
    if (opts.fromBlock != null && !isValidPositiveNumber(opts.fromBlock)) {
      log.throwArgumentError(Logger.message.invalid_block_number, 'fromBlock', opts.fromBlock, {
        location: Logger.location.SDK_GET_TRANSFERS_BY_WALLET,
      });
    }
    if (opts.toBlock != null && !isValidPositiveNumber(opts.toBlock)) {
      log.throwArgumentError(Logger.message.invalid_block_number, 'toBlock', opts.toBlock, {
        location: Logger.location.SDK_GET_TRANSFERS_BY_WALLET,
      });
    }
    if (opts.fromBlock != null && opts.toBlock != null && opts.fromBlock > opts.toBlock) {
      log.throwError(Logger.message.invalid_block_range, Logger.code.INVALID_ARGUMENT, {
        location: Logger.location.SDK_GET_TRANSFERS_BY_WALLET,
        fromBlock: opts.fromBlock,
        toBlock: opts.toBlock,
      });
    }

    const apiUrl = `${this.apiPath}/accounts/${opts.walletAddress}/assets/transfers`;
    const { data } = await this.httpClient.get(apiUrl, {
      fromBlock: opts.fromBlock,
      toBlock: opts.toBlock,
      cursor: opts.cursor,
    });
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

  /**
   * Get transfers by tokenId
   * @param {object} opts object containing all parameters
   * @returns {Promise<object>} Transfers list
   */
  async getTransfersByTokenId(opts: GetNftTransfersByContractAndToken): Promise<TransfersDTO> {
    if (!opts.contractAddress || !utils.isAddress(opts.contractAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_contract_address, {
        location: Logger.location.SDK_GET_TRANSFERS_BY_TOKEN_ID,
      });
    }

    if (!opts.tokenId) {
      log.throwMissingArgumentError(Logger.message.no_tokenId_supplied, {
        location: Logger.location.SDK_GET_TRANSFERS_BY_TOKEN_ID,
      });
    }

    const apiUrl = `${this.apiPath}/nfts/${opts.contractAddress}/tokens/${opts.tokenId}/transfers`;
    const { contractAddress, tokenId, cursor } = opts;
    const { data } = await this.httpClient.get(apiUrl, { contractAddress, tokenId, cursor });
    return data;
  }

  /**
   * Get transfers by contract address
   * @param {object} opts object containing all parameters
   * @returns {Promise<object>} Transfers list
   */
  async getTransfersByContractAddress(
    opts: GetNftTransfersByContractAddress,
  ): Promise<TransfersDTO> {
    if (!opts.contractAddress || !utils.isAddress(opts.contractAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_contract_address, {
        location: Logger.location.SDK_GET_TRANSFERS_BY_CONTRACT,
      });
    }
    if (opts.fromBlock != null && !isValidPositiveNumber(opts.fromBlock)) {
      log.throwArgumentError(Logger.message.invalid_block_number, 'fromBlock', opts.fromBlock, {
        location: Logger.location.SDK_GET_TRANSFERS_BY_CONTRACT,
      });
    }
    if (opts.toBlock != null && !isValidPositiveNumber(opts.toBlock)) {
      log.throwArgumentError(Logger.message.invalid_block_number, 'toBlock', opts.toBlock, {
        location: Logger.location.SDK_GET_TRANSFERS_BY_CONTRACT,
      });
    }
    if (opts.fromBlock != null && opts.toBlock != null) {
      if (opts.fromBlock > opts.toBlock) {
        log.throwError(Logger.message.invalid_block_range, Logger.code.INVALID_ARGUMENT, {
          location: Logger.location.SDK_GET_TRANSFERS_BY_CONTRACT,
          fromBlock: opts.fromBlock,
          toBlock: opts.toBlock,
        });
      }
      if (opts.toBlock - opts.fromBlock > 1000000) {
        log.throwError(Logger.message.block_range_too_large, Logger.code.INVALID_ARGUMENT, {
          location: Logger.location.SDK_GET_TRANSFERS_BY_CONTRACT,
          fromBlock: opts.fromBlock,
          toBlock: opts.toBlock,
        });
      }
    }

    const apiUrl = `${this.apiPath}/nfts/${opts.contractAddress}/transfers`;
    const { contractAddress, fromBlock, toBlock, cursor } = opts;
    const { data } = await this.httpClient.get(apiUrl, {
      contractAddress,
      fromBlock,
      toBlock,
      cursor,
    });
    return data;
  }

  /**
   * Get lowest trade for a given token
   * @param {object} opts object containing all parameters
   * @returns {Promise<object>} Trade information
   */
  async getLowestTradePrice(opts: GetLowestTradePrice): Promise<TradeDTO> {
    if (!opts.tokenAddress || !utils.isAddress(opts.tokenAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_token_address, {
        location: Logger.location.SDK_GET_LOWEST_TRADE_PRICE,
      });
    }

    const apiUrl = `${this.apiPath}/nfts/${opts.tokenAddress}/tradePrice`;
    const { tokenAddress, days } = opts;
    const { data } = await this.httpClient.get(apiUrl, { tokenAddress, days });
    return data;
  }

  /**
   * Get nft owners by contract address
   * @param {object} opts object containing all parameters
   * @returns {Promise<object>} OwnersDTO
   */

  async getOwnersbyContractAddress(opts: GetNftOwnersByContractAddress): Promise<OwnersDTO> {
    if (!opts.contractAddress || !utils.isAddress(opts.contractAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_contract_address, {
        location: Logger.location.SDK_GET_OWNERS_BY_TOKEN_ADDRESS,
      });
    }

    const apiUrl = `${this.apiPath}/nfts/${opts.contractAddress}/owners`;
    const { data } = await this.httpClient.get(apiUrl, { cursor: opts.cursor });
    return data;
  }

  /**
   * Get nft owners by token address and token id
   * @param {object} opts object containing all parameters
   * @returns {Promise<object>} OwnersDTO
   */

  async getOwnersbyTokenAddressAndTokenId(
    opts: GetNftOwnersByTokenAddressAndTokenId,
  ): Promise<OwnersDTO> {
    if (!opts.tokenAddress || !utils.isAddress(opts.tokenAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_token_address, {
        location: Logger.location.SDK_GET_OWNERS_BY_TOKEN_ADDRESS_AND_TOKEN_ID,
      });
    }

    if (!opts.tokenId) {
      log.throwMissingArgumentError(Logger.message.no_tokenId_supplied, {
        location: Logger.location.SDK_GET_OWNERS_BY_TOKEN_ADDRESS_AND_TOKEN_ID,
      });
    }

    const apiUrl = `${this.apiPath}/nfts/${opts.tokenAddress.toLowerCase()}/${opts.tokenId}/owners`;
    const { data } = await this.httpClient.get(apiUrl, { cursor: opts.cursor });
    return data;
  }

  /* Get NFT collections owned by a given wallet address.
   * @param {object} opts object containing all parameters
   * @returns {Promise<object>} Transfers list
   */
  async getCollectionsByWallet(opts: GetCollectionsByWallet): Promise<CollectionsDTO> {
    if (!opts.walletAddress || !utils.isAddress(opts.walletAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_account_address, {
        location: Logger.location.SDK_GET_COLLECTION_BY_WALLET,
      });
    }

    const apiUrl = `${this.apiPath}/accounts/${opts.walletAddress}/assets/collections`;
    const { cursor } = opts;
    const { data } = await this.httpClient.get(apiUrl, { cursor });
    return data;
  }

  /**
   * search Nfts that match a specific query string
   * @param {object} opts object containing all parameters
   * @returns {Promise<object>} Nfts  list
   */
  async searchNfts(opts: SearchNftsByString): Promise<SearchNftDTO> {
    if (!opts.query || opts.query.trim().length < 3) {
      log.throwMissingArgumentError(Logger.message.invalid_search_string, {
        location: Logger.location.SDK_GET_SEARCH_NFT,
      });
    }

    const apiUrl = `${this.apiPath}/nfts/search`;
    const { cursor, query } = opts;
    const { data } = await this.httpClient.get(apiUrl, { query, cursor });
    return data;
  }
}
