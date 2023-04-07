import { ethers } from 'ethers';
import smartContractArtifact from './artifacts/ERC721Mintable';
import { isURI, addGasPriceToOptions } from '../utils';
import { Logger, log } from '../Logger';
import { GAS_LIMIT, DEFAULT_ADMIN_ROLE, DEFAULT_MINTER_ROLE } from '../constants';
import HasRoyalty from '../ContractComponents/hasRoyalty';
import HasAccessControl from '../ContractComponents/hasAccessControl';
import BaseERC721 from '../ContractComponents/baseERC721';
import preparePolygonTransaction from './utils';
import { Chains } from '../Auth/availableChains';

export type DeployParams = {
  name: string;
  symbol: string;
  contractURI: string;
  gas?: string;
};

type ContractAddressOptions = {
  contractAddress: string;
};

type MintOptions = {
  publicAddress: string;
  tokenURI: string;
  gas?: string;
};

type SetContractURIOptions = {
  contractURI: string;
  gas?: string;
};

export default class ERC721Mintable {
  private readonly gasLimit = GAS_LIMIT;

  readonly ADMIN_ROLE = DEFAULT_ADMIN_ROLE;

  readonly MINTER_ROLE = DEFAULT_MINTER_ROLE;

  contractAddress: string;

  royalty: HasRoyalty;

  accessControl: HasAccessControl;

  baseERC721: BaseERC721;

  private contractDeployed: ethers.Contract;

  private readonly signer;

  constructor(signer: ethers.Wallet | ethers.providers.JsonRpcSigner) {
    this.signer = signer;
    this.royalty = new HasRoyalty();
    this.accessControl = new HasAccessControl();
    this.baseERC721 = new BaseERC721();
  }

  /**
   * Deploy ERC721Mintable Contract. Used by the SDK class
   * @param {object} params object containing all parameters
   * @param {string} params.name Name of the contract
   * @param {string} params.symbol Symbol of the contract
   * @param {string} params.contractURI ContractURI for the contract
   * (link to a JSON file describing the contract's metadata)
   * @notice Warning: This method will consume gas (4000000 gas estimated)
   * @returns {Promise<ERC721Mintable>} Contract
   */
  async deploy(params: DeployParams): Promise<ERC721Mintable> {
    if (this.contractAddress || this.contractDeployed) {
      log.throwArgumentError(
        Logger.message.contract_already_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.ERC721MINTABLE_DEPLOY,
        },
      );
    }

    if (!this.signer) {
      log.throwArgumentError(Logger.message.no_signer_instance_supplied, 'signer', this.signer, {
        location: Logger.location.ERC721MINTABLE_DEPLOY,
      });
    }

    if (!params.name) {
      log.throwArgumentError(Logger.message.no_name_supplied, 'name', params.name, {
        location: Logger.location.ERC721MINTABLE_DEPLOY,
      });
    }

    if (params.symbol === undefined) {
      log.throwArgumentError(Logger.message.no_symbol_supplied, 'symbol', params.symbol, {
        location: Logger.location.ERC721MINTABLE_DEPLOY,
      });
    }

    if (params.contractURI === undefined) {
      log.throwArgumentError(
        Logger.message.no_contractURI_supplied,
        'contractURI',
        params.contractURI,
        {
          location: Logger.location.ERC721MINTABLE_DEPLOY,
        },
      );
    }

    /* eslint-disable no-console */
    if (!isURI(params.contractURI)) {
      console.warn(Logger.message.warning_contractURI);
      console.warn(Logger.message.warning_contractURI_tips);
    }

    try {
      const factory = new ethers.ContractFactory(
        smartContractArtifact.abi,
        smartContractArtifact.bytecode,
        this.signer,
      );

      const chainId = await this.signer.getChainId();
      let options;
      // If Polygon mainnet, set up options propperly to avoid underpriced transaction error
      /* istanbul ignore next */
      if (chainId === Chains.polygon)
        options = await preparePolygonTransaction(await this.signer.getTransactionCount());
      else options = addGasPriceToOptions({}, params.gas);
      const contract = await factory.deploy(
        params.name,
        params.symbol,
        params.contractURI,
        options,
      );

      this.contractDeployed = await contract.deployed();
      this.contractAddress = contract.address;
      this.royalty.setContract(this.contractDeployed);
      this.accessControl.setContract(this.contractDeployed);
      this.baseERC721.setContract(this.contractDeployed);
      return this;
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.ERC721MINTABLE_DEPLOY,
        error,
      });
    }
  }

  /**
   * Mint function: Mint a token for publicAddress with the tokenURI provided
   * @param {object} params object containing all parameters
   * @param {string} params.publicAddress destination address of the minted token
   * @param {string} params.tokenURI link to the JSON object containing metadata about the token
   * @notice Warning: This method will consume gas (120000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async mint(params: MintOptions): Promise<ethers.providers.TransactionResponse> {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.ERC721MINTABLE_MINT,
        },
      );
    }

    if (!params.publicAddress || !ethers.utils.isAddress(params.publicAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_public_address, {
        location: Logger.location.ERC721MINTABLE_MINT,
      });
    }

    if (!params.tokenURI) {
      log.throwMissingArgumentError(Logger.message.no_tokenURI_supplied, {
        location: Logger.location.ERC721MINTABLE_MINT,
      });
    }

    /* eslint-disable no-console */
    if (!isURI(params.tokenURI)) {
      console.warn(Logger.message.warning_tokenURI);
      console.warn(Logger.message.warning_tokenURI_tips);
    }

    try {
      const chainId = await this.signer.getChainId();
      let options;
      /* istanbul ignore next */
      if (chainId === Chains.polygon)
        options = await preparePolygonTransaction(await this.signer.getTransactionCount());
      else options = addGasPriceToOptions({ gasLimit: this.gasLimit }, params.gas);
      return this.contractDeployed.mintWithTokenURI(params.publicAddress, params.tokenURI, options);
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.ERC721MINTABLE_MINT,
        error,
      });
    }
  }

  /**
   * Load an ERC721Mintable contract from an existing contract address. Used by the SDK class
   * @param {object} params object containing all parameters
   * @param {string} params.contractAddress Address of the ERC721Mintable contract to load
   * @returns {ERC721Mintable} Contract
   */
  loadContract(params: ContractAddressOptions): ERC721Mintable {
    if (this.contractAddress || this.contractDeployed) {
      log.throwArgumentError(
        Logger.message.contract_already_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.ERC721MINTABLE_LOADCONTRACT,
        },
      );
    }

    if (!params.contractAddress || !ethers.utils.isAddress(params.contractAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_contract_address, {
        location: Logger.location.ERC721MINTABLE_LOADCONTRACT,
      });
    }

    try {
      this.contractAddress = <string>params.contractAddress;

      this.contractDeployed = new ethers.Contract(
        this.contractAddress,
        smartContractArtifact.abi,
        this.signer,
      );
      this.royalty.setContract(this.contractDeployed);
      this.accessControl.setContract(this.contractDeployed);
      this.baseERC721.setContract(this.contractDeployed);
      return this;
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.ERC721MINTABLE_LOADCONTRACT,
        error,
      });
    }
  }

  /**
   * setContractURI function: Set the "contractURI" metadata for the specified contract
   * @param {object} params object containing all parameters
   * @param {string} params.contractURI ContractURI for the contract
   * (URI to a JSON file describing the contract's metadata)
   * @notice Warning: This method will consume gas (35000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async setContractURI(
    params: SetContractURIOptions,
  ): Promise<ethers.providers.TransactionResponse> {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.ERC721MINTABLE_SET_CONTRACT_URI,
        },
      );
    }

    if (!params.contractURI) {
      log.throwMissingArgumentError(Logger.message.no_contractURI_supplied, {
        location: Logger.location.ERC721MINTABLE_SET_CONTRACT_URI,
      });
    }

    /* eslint-disable no-console */
    if (!isURI(params.contractURI)) {
      console.warn(Logger.message.warning_contractURI);
      console.warn(Logger.message.warning_contractURI_tips);
    }

    try {
      const options = addGasPriceToOptions({}, params.gas);
      return this.contractDeployed.setContractURI(params.contractURI, options);
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.ERC721MINTABLE_SET_CONTRACT_URI,
        error,
      });
    }
  }
}
