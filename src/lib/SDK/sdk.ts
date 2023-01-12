import { ethers, utils } from 'ethers';
import Auth from '../Auth/Auth';
import HttpService from '../../services/httpService';
import { NFT_API_URL } from '../constants';
import ERC721Mintable, {
  DeployParams as MintableDeploy,
} from '../ContractTemplates/ERC721Mintable';
import ERC721UserMintable, {
  DeployParams as UserMintableDeploy,
} from '../ContractTemplates/ERC721UserMintable';
import { Logger, log } from '../Logger';
import { Components } from '../../services/nft-api';
import { metadataFolderSchema, metadataSchema } from './sdk.schema';
import { isJson } from '../utils';
import ERC1155Mintable, { DeployERC1155Params } from '../ContractTemplates/ERC1155Mintable';

const classes = {
  ERC721Mintable,
  ERC721UserMintable,
  ERC1155Mintable,
};

export type NftDTO = Components['schemas']['NftModel'];
export type MetadataDTO = Components['schemas']['MetadataModel'];
export type TransfersDTO = Components['schemas']['TransfersModel'];
export type MetadataInfo = {
  symbol: string;
  name: string;
  tokenType: string;
};

// TODO: fix type & function overloading in "deploy"
type DeployOptionsMintable = {
  template: string;
  params: MintableDeploy;
};
type DeployOptionsUserMintable = {
  template: string;
  params: UserMintableDeploy;
};

type DeployOptionsERC1155UserMintable = {
  template: string;
  params: DeployERC1155Params;
};

type LoadContractOptions = {
  template: string;
  contractAddress: string;
};

type GetTokenMetadataOptions = {
  contractAddress: string;
  tokenId: number;
};

export type GetTransfersByBlockNumberOptions = {
  blockHashNumber: string;
  cursor?: string;
};

type GetStatusOptions = {
  txHash: string;
};

type PublicAddressOptions = {
  publicAddress: string;
  includeMetadata?: boolean;
  cursor?: string;
};

export type ContractAddressOptions = {
  contractAddress: string;
  cursor?: string;
};

export type GetNftTransfersByWallet = {
  walletAddress: string;
  cursor?: string;
};

export class SDK {
  /* Private property */
  private readonly auth;

  private readonly apiPath;

  private readonly httpClient;

  private readonly ipfsClient;

  constructor(auth: Auth) {
    if (!(auth instanceof Auth)) {
      log.throwArgumentError(Logger.message.invalid_auth_instance, 'auth', auth, {
        location: Logger.location.SDK_CONSTRUCTOR,
      });
    }
    this.auth = auth;
    this.apiPath = `/networks/${this.auth.getChainId()}`;
    this.httpClient = new HttpService(NFT_API_URL, this.auth.getApiAuth());
    this.ipfsClient = this.auth.getIpfsClient();
  }

  /** Get provider
   * @returns {ethers.Wallet | ethers.providers.JsonRpcProvider} return the provider
   */
  getProvider() {
    return this.auth.getSigner();
  }

  /**
   * Deploy Contract on the blockchain
   * @param {object} opts object containing all parameters
   * @param {string} opts.template name of the template to use (ERC721Mintable, ...)
   * @param {object} opts.params template parameters (name, symbol, contractURI, ...)
   * @returns {Promise<ERC721Mintable>} Contract instance
   */
  async deploy(opts: DeployOptionsMintable): Promise<ERC721Mintable>;
  async deploy(opts: DeployOptionsUserMintable): Promise<ERC721UserMintable>;
  async deploy(opts: DeployOptionsERC1155UserMintable): Promise<ERC1155Mintable>;
  async deploy(opts: any): Promise<any> {
    if (!opts.template) {
      log.throwMissingArgumentError(Logger.message.no_template_type_supplied, {
        location: Logger.location.SDK_DEPLOY,
      });
    }
    if (Object.keys(opts.params).length === 0) {
      log.throwMissingArgumentError(Logger.message.no_parameters_supplied, {
        location: Logger.location.SDK_DEPLOY,
      });
    }

    const signer = this.auth.getSigner();
    const contract = new classes[opts.template as keyof typeof classes](signer);

    await contract.deploy(opts.params);
    return contract;
  }

  /**
   * Load a contract from an existing contract address and a template
   * @param {object} opts object containing all parameters
   * @param {string} opts.template name of the template to use (ERC721Mintable, ...)
   * @param {string} opts.contractAddress address of the contract to load
   * @returns {Promise<any>} Contract instance
   */
  async loadContract(opts: LoadContractOptions): Promise<any> {
    if (!opts.template) {
      log.throwMissingArgumentError(Logger.message.no_template_type_supplied, {
        location: Logger.location.SDK_LOADCONTRACT,
      });
    }
    if (!opts.contractAddress) {
      log.throwMissingArgumentError(Logger.message.no_address_supplied, {
        location: Logger.location.SDK_LOADCONTRACT,
      });
    }

    const signer = this.auth.getSigner();
    const contract = new classes[opts.template as keyof typeof classes](signer);

    await contract.loadContract({ contractAddress: opts.contractAddress });
    return contract;
  }

  /**
   * Returns the current network's gas price in Gwei for transactions
   * @returns {Promise<string>} Current price of gas in Gwei
   */
  async getGasPrice(): Promise<string> {
    const signer = this.auth.getSigner();
    const gasPrice = await signer.getGasPrice();
    return utils.formatUnits(gasPrice, 'gwei');
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
   * @param {string} opts.blockHashNumber number of the block to get transfers from
   * @returns {Promise<object>} Transfers list
   */
  async getTransfersByBlockNumber(opts: GetTransfersByBlockNumberOptions): Promise<TransfersDTO> {
    if (!opts.blockHashNumber) {
      log.throwMissingArgumentError(Logger.message.invalid_block_number, {
        location: Logger.location.SDK_GETTRANSFERSBYBLOCKNUMBER,
      });
    }

    const apiUrl = `${this.apiPath}/nfts/block/transfers`;
    const { data } = await this.httpClient.get(apiUrl, { blockHashNumber: opts.blockHashNumber });
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
        location: Logger.location.SDK_GETTRANSFERSBYWALLET,
      });
    }

    const apiUrl = `${this.apiPath}/accounts/${opts.walletAddress}/assets/transfers`;
    const { data } = await this.httpClient.get(apiUrl, { cursor: opts.cursor });
    return data;
  }

  /** Get tx status
   * @param {object} opts object containing all parameters
   * @param {string} opts.txHash hash of the transaction
   * @returns {Promise<ethers.providers.TransactionReceipt>} Transaction information
   */
  async getStatus(opts: GetStatusOptions): Promise<ethers.providers.TransactionReceipt> {
    if (!utils.isHexString(opts.txHash)) {
      log.throwArgumentError(Logger.message.invalid_transaction_hash, 'txHash', opts.txHash, {
        location: Logger.location.SDK_GETSTATUS,
      });
    }

    const signer = this.getProvider();
    return signer.provider.getTransactionReceipt(opts.txHash);
  }

  /** Store file on ipfs
   * @param {string} metadata path to local file or url
   * @returns {Promise<string>} Ipfs hash of the stored data
   */
  async storeFile({ metadata }: { metadata: string }) {
    if (!this.ipfsClient) {
      log.throwArgumentError(Logger.message.invalid_ipfs_setup, 'ipfs', this.ipfsClient, {
        location: Logger.location.SDK_STOREFILE,
      });
    }

    const result = metadataSchema.validate({ metadata });
    if (result.error) {
      return log.throwError(result.error.details[0].message, Logger.code.INVALID_ARGUMENT, {
        location: Logger.location.SDK_STOREFILE,
        error: result.error.details[0].message,
      });
    }

    return this.ipfsClient.uploadFile({ source: metadata });
  }

  /** Store metadata on ipfs
   * @param {string} metadata valid json metadata
   * @returns {Promise<string>} Ipfs hash of the stored data
   */
  async storeMetadata({ metadata }: { metadata: string }) {
    if (!this.ipfsClient) {
      log.throwArgumentError(Logger.message.invalid_ipfs_setup, 'ipfs', this.ipfsClient, {
        location: Logger.location.SDK_STOREMETADATA,
      });
    }

    const result = metadataSchema.validate({ metadata });
    if (result.error) {
      return log.throwError(result.error.details[0].message, Logger.code.INVALID_ARGUMENT, {
        location: Logger.location.SDK_STOREMETADATA,
        error: result.error.details[0].message,
      });
    }

    return this.ipfsClient.uploadContent({ source: metadata });
  }

  /** Store array of metadata on ipfs
   * @param {Array<any>} metadata an array of valid JSON Metadata
   * @returns {Promise<string>} Ipfs hash of the stored data
   */
  async createFolder({ metadata, isErc1155 = false }: { metadata: string[]; isErc1155: boolean }) {
    if (!this.ipfsClient) {
      log.throwArgumentError(Logger.message.invalid_ipfs_setup, 'ipfs', this.ipfsClient, {
        location: Logger.location.SDK_CREATEFOLDER,
      });
    }

    const result = metadataFolderSchema.validate({ metadata });
    if (result.error) {
      return log.throwError(result.error.details[0].message, Logger.code.INVALID_ARGUMENT, {
        location: Logger.location.SDK_CREATEFOLDER,
        error: result.error.details[0].message,
      });
    }
    metadata.forEach(data => {
      if (!isJson(data)) {
        log.throwArgumentError(Logger.message.data_must_be_valid_json, 'data', data, {
          location: Logger.location.SDK_CREATEFOLDER,
        });
      }
    });

    return this.ipfsClient.uploadArray({ sources: metadata, isErc1155 });
  }
}
