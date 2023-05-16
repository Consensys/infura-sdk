import { ethers, utils } from 'ethers';
import Auth from '../Auth/Auth';
import { NFT_API_URL } from '../constants';
import ERC721Mintable from '../ContractTemplates/ERC721Mintable';
import ERC721UserMintable from '../ContractTemplates/ERC721UserMintable';
import { Logger, log } from '../Logger';
import { metadataFolderSchema, metadataSchema } from './sdk.schema';
import { ApiVersion, isJson } from '../utils';
import ERC1155Mintable from '../ContractTemplates/ERC1155Mintable';
import IPFS from '../../services/ipfsService';
import {
  DeployOptionsERC1155UserMintable,
  DeployOptionsMintable,
  DeployOptionsUserMintable,
  GetStatusOptions,
  LoadContractOptions,
} from './types';
import { Chains } from '../Auth/availableChains';
import Api from '../Api/api';
import HttpService from '../../services/httpService';

export const classes = {
  ERC721Mintable,
  ERC721UserMintable,
  ERC1155Mintable,
};

export class SDK {
  /* Private property */
  private readonly auth: Auth;

  public readonly api: Api;

  private readonly ipfsClient: IPFS;

  constructor(auth: Auth, apiVersion = ApiVersion.V1) {
    if (!Object.values<string>(ApiVersion).includes(apiVersion)) {
      log.throwArgumentError(Logger.message.invalid_api_version, 'apiVersion', apiVersion, {
        location: Logger.location.SDK_CONSTRUCTOR,
      });
    }
    if (!(auth instanceof Auth)) {
      log.throwArgumentError(Logger.message.invalid_auth_instance, 'auth', auth, {
        location: Logger.location.SDK_CONSTRUCTOR,
      });
    }
    this.auth = auth;
    const apiPath = `/networks/${this.auth.getChainId()}`;
    const httpClient = new HttpService(NFT_API_URL, this.auth.getApiAuth(), apiVersion);

    this.api = new Api(apiPath, httpClient, apiVersion);
    this.ipfsClient = this.auth.getIpfsClient();
  }

  /** Get provider
   * @returns {ethers.Wallet | ethers.providers.JsonRpcProvider} return the provider
   */
  getProvider() {
    return this.auth.getSigner();
  }

  infuraSupported() {
    return (
      this.auth.getChainId() !== Chains.bsc &&
      this.auth.getChainId() !== Chains.bsctest &&
      this.auth.getChainId() !== Chains.cronos &&
      this.auth.getChainId() !== Chains.fantom
    );
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
    if (!this.infuraSupported()) {
      log.throwArgumentError(
        Logger.message.chain_not_supported_write_operations,
        'chainId',
        this.auth.getChainId(),
        {
          location: Logger.location.SDK_DEPLOY,
        },
      );
    }
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
    if (!this.infuraSupported()) {
      log.throwArgumentError(
        Logger.message.chain_not_supported_write_operations,
        'chainId',
        this.auth.getChainId(),
        {
          location: Logger.location.SDK_LOADCONTRACT,
        },
      );
    }
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
