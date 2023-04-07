import { ethers, utils } from 'ethers';
import smartContractArtifact from './artifacts/ERC721UserMintable';
import HasRoyalty from '../ContractComponents/hasRoyalty';
import HasAccessControl from '../ContractComponents/hasAccessControl';
import BaseERC721 from '../ContractComponents/baseERC721';
import { addGasPriceToOptions, isURI, isValidPrice } from '../utils';
import { Logger, log } from '../Logger';
import preparePolygonTransaction from './utils';
import { Chains } from '../Auth/availableChains';

export type DeployParams = {
  name: string;
  symbol: string;
  baseURI: string;
  contractURI: string;
  maxSupply: number;
  price: string;
  maxTokenRequest: number;
  gas?: string;
};

type ContractAddressOptions = {
  contractAddress: string;
};

type MintOptions = {
  quantity: number;
  cost: string;
};

type ReserveOptions = {
  quantity: number;
  gas?: string;
};

type RevealOptions = {
  baseURI: string;
  gas?: string;
};

type SetPriceOptions = {
  price: string;
  gas?: string;
};

type SetBaseURIOptions = {
  baseURI: string;
  gas?: string;
};

export default class ERC721UserMintable {
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
   * Deploy ERC721UserMintable Contract. Used by the SDK class
   * @param {object} params object containing all parameters
   * @param {string} params.name Name of the contract
   * @param {string} params.symbol Symbol of the contract
   * @param {string} params.baseURI baseURI for the contract
   * @param {string} params.maxSupply Maximum supply of tokens for the contract
   * @param {string} params.price Price to mint one token
   * @returns {Promise<ERC721Mintable>} Contract
   */
  async deploy(params: DeployParams): Promise<ERC721UserMintable> {
    if (this.contractAddress || this.contractDeployed) {
      log.throwArgumentError(
        Logger.message.contract_already_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.ERC721USERMINTABLE_DEPLOY,
        },
      );
    }

    if (!this.signer) {
      log.throwArgumentError(Logger.message.no_signer_instance_supplied, 'signer', this.signer, {
        location: Logger.location.ERC721USERMINTABLE_DEPLOY,
      });
    }

    if (!params.name) {
      log.throwArgumentError(Logger.message.no_name_supplied, 'name', params.name, {
        location: Logger.location.ERC721USERMINTABLE_DEPLOY,
      });
    }

    if (!params.symbol) {
      log.throwArgumentError(Logger.message.no_symbol_supplied, 'symbol', params.symbol, {
        location: Logger.location.ERC721USERMINTABLE_DEPLOY,
      });
    }

    if (!params.baseURI) {
      log.throwArgumentError(Logger.message.no_baseURI_supplied, 'baseURI', params.baseURI, {
        location: Logger.location.ERC721USERMINTABLE_DEPLOY,
      });
    }

    if (!params.contractURI) {
      log.throwArgumentError(
        Logger.message.invalid_contractURI,
        'contractURI',
        params.contractURI,
        {
          location: Logger.location.ERC721USERMINTABLE_DEPLOY,
        },
      );
    }

    if (!params.maxSupply) {
      log.throwArgumentError(Logger.message.invalid_max_supply, 'maxSupply', params.maxSupply, {
        location: Logger.location.ERC721USERMINTABLE_DEPLOY,
      });
    }

    if (!isValidPrice(params.price)) {
      log.throwArgumentError(Logger.message.invalid_price, 'price', params.price, {
        location: Logger.location.ERC721USERMINTABLE_DEPLOY,
      });
    }

    if (!params.maxTokenRequest) {
      log.throwArgumentError(
        Logger.message.invalid_max_token_request,
        'maxSupply',
        params.maxSupply,
        {
          location: Logger.location.ERC721USERMINTABLE_DEPLOY,
        },
      );
    }

    /* eslint-disable no-console */
    if (!isURI(params.baseURI)) {
      console.warn(Logger.message.warning_contractURI);
      console.warn(Logger.message.warning_contractURI_tips);
    }

    try {
      const factory = new ethers.ContractFactory(
        smartContractArtifact.abi,
        smartContractArtifact.bytecode,
        this.signer,
      );

      const priceInWei = utils.parseEther(params.price);

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
        params.baseURI,
        params.contractURI,
        params.maxSupply,
        priceInWei,
        params.maxTokenRequest,
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
        location: Logger.location.ERC721USERMINTABLE_DEPLOY,
        error,
      });
    }
  }

  /**
   * Load an ERC721UserMintable contract from an existing contract address. Used by the SDK class
   * @param {object} params object containing all parameters
   * @param {string} contractAddress Address of the ERC721UserMintable contract to load
   * @returns {ERC721UserMintable} Contract
   */
  loadContract(params: ContractAddressOptions): ERC721UserMintable {
    if (this.contractAddress || this.contractDeployed) {
      log.throwArgumentError(
        Logger.message.contract_already_loaded,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.ERC721USERMINTABLE_LOADCONTRACT,
        },
      );
    }

    if (!params.contractAddress || !ethers.utils.isAddress(params.contractAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_contract_address, {
        location: Logger.location.ERC721USERMINTABLE_LOADCONTRACT,
      });
    }

    try {
      this.contractDeployed = new ethers.Contract(
        params.contractAddress,
        smartContractArtifact.abi,
        this.signer,
      );

      this.contractAddress = params.contractAddress;
      this.royalty.setContract(this.contractDeployed);
      this.accessControl.setContract(this.contractDeployed);
      this.baseERC721.setContract(this.contractDeployed);
      return this;
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.ERC721USERMINTABLE_LOADCONTRACT,
        error,
      });
    }
  }

  /**
   * Mint function: Mint a token for publicAddress with the tokenURI provided
   * @param {object} params object containing all parameters
   * @param {number} params.quantity amount of token to mint
   * @param {string} params.cost cost for each token
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
          location: Logger.location.ERC721USERMINTABLE_MINT,
        },
      );
    }

    if (!params.quantity || !Number.isInteger(params.quantity) || params.quantity < 1) {
      log.throwArgumentError(Logger.message.invalid_mint_quantity, 'quantity', params.quantity, {
        location: Logger.location.ERC721USERMINTABLE_MINT,
      });
    }

    const parsedCost = ethers.utils.parseEther(params.cost);

    try {
      const chainId = await this.signer.getChainId();
      let options;
      // If Polygon mainnet, set up options propperly to avoid underpriced transaction error
      /* istanbul ignore next */
      if (chainId === Chains.polygon)
        options = await preparePolygonTransaction(await this.signer.getTransactionCount());
      else options = addGasPriceToOptions({ value: parsedCost }, undefined);

      // return this.contractDeployed.mint(params.quantity, options);
      return this.contractDeployed.mint(params.quantity, { value: parsedCost, ...options });
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.ERC721USERMINTABLE_MINT,
        error,
      });
    }
  }

  /**
   * Returns the value of the mint per token (in Ether)
   * @returns {string} value in Ether of the mint per token
   */
  async price(): Promise<string> {
    try {
      const price = await this.contractDeployed.price();
      return utils.formatEther(price);
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.ERC721USERMINTABLE_PRICE,
        error,
      });
    }
  }

  /**
   * Reserves (mints) an amount of tokens to the owner of the contract
   * @param {object} params object containing all parameters
   * @param {number} params.quantity The quantity of tokens to mint to the owner (1-20)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async reserve(params: ReserveOptions) {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.ERC721USERMINTABLE_RESERVE,
        },
      );
    }

    if (!params.quantity || !Number.isInteger(params.quantity) || !(params.quantity > 0)) {
      log.throwArgumentError(Logger.message.invalid_mint_quantity, 'quantity', params.quantity, {
        location: Logger.location.ERC721USERMINTABLE_RESERVE,
      });
    }

    try {
      const options = addGasPriceToOptions({}, params.gas);
      return this.contractDeployed.reserve(params.quantity, options);
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.ERC721USERMINTABLE_RESERVE,
        error,
      });
    }
  }

  /**
   * Sets the status of the contract to revealed and sets the baseURI
   * @param {object} params object containing all parameters
   * @param {string} params.baseURI The baseURI of the contract
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async reveal(params: RevealOptions): Promise<ethers.providers.TransactionResponse> {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.ERC721USERMINTABLE_REVEAL,
        },
      );
    }

    if (!params.baseURI) {
      log.throwMissingArgumentError(Logger.message.invalid_baseURI, {
        location: Logger.location.ERC721USERMINTABLE_REVEAL,
      });
    }

    try {
      const options = addGasPriceToOptions({}, params.gas);
      return this.contractDeployed.reveal(params.baseURI, options);
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.ERC721USERMINTABLE_REVEAL,
        error,
      });
    }
  }

  /**
   * setBaseURI function: Set the "baseURI" metadata for the specified contract
   * @param {object} params object containing all parameters
   * @param {string} params.baseURI baseURI for the contract
   * (URI to a JSON file describing the contract's metadata)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async setBaseURI(params: SetBaseURIOptions): Promise<ethers.providers.TransactionResponse> {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.ERC721USERMINTABLE_SET_BASE_URI,
        },
      );
    }

    if (!params.baseURI) {
      log.throwMissingArgumentError(Logger.message.invalid_baseURI, {
        location: Logger.location.ERC721USERMINTABLE_SET_BASE_URI,
      });
    }

    try {
      const options = addGasPriceToOptions({}, params.gas);
      return this.contractDeployed.setBaseURI(params.baseURI, options);
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.ERC721USERMINTABLE_SET_BASE_URI,
        error,
      });
    }
  }

  /**
   * Sets the price (in Ether) of the mint
   * @param {object} params object containing all parameters
   * @param {string} params.price Price of the mint (per token) in Ether as a string
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async setPrice(params: SetPriceOptions): Promise<ethers.providers.TransactionResponse> {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.ERC721USERMINTABLE_SET_PRICE,
        },
      );
    }

    if (params.price === undefined || !isValidPrice(params.price)) {
      log.throwMissingArgumentError(Logger.message.invalid_price, {
        location: Logger.location.ERC721USERMINTABLE_SET_PRICE,
      });
    }

    try {
      const priceInWei = utils.parseEther(params.price);
      const options = addGasPriceToOptions({}, params.gas);
      return this.contractDeployed.setPrice(priceInWei, options);
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.ERC721MINTABLE_MINT,
        error,
      });
    }
  }

  /**
   * Toggles the sale status of the contract
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async toggleSale(gas?: string): Promise<ethers.providers.TransactionResponse> {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.ERC721USERMINTABLE_TOGGLE_SALE,
        },
      );
    }

    try {
      const options = addGasPriceToOptions({}, gas);
      return this.contractDeployed.toggleSale(options);
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.ERC721USERMINTABLE_TOGGLE_SALE,
        error,
      });
    }
  }

  /**
   * Withdraws ether balance to owner address
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async withdraw(gas?: string): Promise<ethers.providers.TransactionResponse> {
    if (!this.contractAddress && !this.contractDeployed) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.ERC721USERMINTABLE_WITHDRAW,
        },
      );
    }

    try {
      const options = addGasPriceToOptions({}, gas);
      return this.contractDeployed.withdraw(options);
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.ERC721USERMINTABLE_WITHDRAW,
        error,
      });
    }
  }
}
