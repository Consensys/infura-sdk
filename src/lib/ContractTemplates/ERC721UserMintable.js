import { ethers, utils } from 'ethers';

import smartContractArtifact from './artifacts/ERC721UserMintable.js';
import { addGasPriceToOptions, isURI } from '../utils.js';
import { networkErrorHandler, errorLogger, ERROR_LOG } from '../error/handler.js';
import BaseERC721 from './components/BaseERC721.js';
import AccessControl from './components/AccessControl.js';
import Royalties from './components/Royalties.js';
import { GAS_LIMIT } from '../constants.js';

export default class ERC721UserMintable extends BaseERC721 {
  /* eslint-disable no-underscore-dangle */
  accessControl;

  royalties;

  #signer;

  constructor(signer) {
    super();
    this.#signer = signer;
    this.accessControl = new AccessControl();
    this.royalties = new Royalties();
  }

  /**
   * Deploy ERC721UserMintable Contract. Used by the SDK class
   * @param {string} name Name of the contract
   * @param {string} symbol Symbol of the contract
   * @param {string} baseURI baseURI for the contract
   * (link to a JSON file describing the contract's metadata)
   * @param {string} maxSupply Maximum supply of tokens for the contract
   * @param {string} price Price to mint one token (in Ether)
   * @param {string} maxTokenRequest Maximum tokens that can be requested per tx
   * @returns void
   */
  async deploy({
    name,
    symbol,
    baseURI,
    contractURI,
    maxSupply,
    price,
    maxTokenRequest,
    gas = null,
  }) {
    console.log(this);
    if (this.contractAddress || this._contractDeployed) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_deploy,
          message: ERROR_LOG.message.contract_already_deployed,
        }),
      );
    }

    if (!this.#signer) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_deploy,
          message: ERROR_LOG.message.no_signer_instance_supplied,
        }),
      );
    }

    if (!name) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_deploy,
          message: ERROR_LOG.message.no_name_supplied,
        }),
      );
    }

    if (!symbol) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_deploy,
          message: ERROR_LOG.message.no_symbol_supplied,
        }),
      );
    }

    if (baseURI === undefined) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_deploy,
          message: ERROR_LOG.message.no_baseURI_supplied,
        }),
      );
    }

    /* eslint-disable no-console */
    if (!isURI(baseURI)) {
      console.warn(`WARNING: The ContractURI "${baseURI}" is not a link.`);
      console.warn('WARNING: BaseURI should be a link to a valid folder.');
    }

    if (contractURI === undefined) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_deploy,
          message: ERROR_LOG.message.no_contractURI_supplied,
        }),
      );
    }

    /* eslint-disable no-console */
    if (!isURI(contractURI)) {
      console.warn(`WARNING: The ContractURI "${contractURI}" is not a link.`);
      console.warn('WARNING: ContractURI should be a public link to a valid JSON metadata file');
    }

    if (maxSupply === undefined) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_deploy,
          message: ERROR_LOG.message.invalid_max_supply,
        }),
      );
    }

    if (price === undefined) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_deploy,
          message: ERROR_LOG.message.invalid_price,
        }),
      );
    }

    if (maxTokenRequest === undefined) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_deploy,
          message: ERROR_LOG.message.invalid_max_token_request,
        }),
      );
    }

    try {
      const factory = new ethers.ContractFactory(
        smartContractArtifact.abi,
        smartContractArtifact.bytecode,
        this.#signer,
      );

      const priceInWei = utils.parseEther(price);

      const options = addGasPriceToOptions({}, gas);
      const contract = await factory.deploy(
        name,
        symbol,
        baseURI,
        contractURI,
        maxSupply,
        priceInWei,
        maxTokenRequest,
        options,
      );
      this._contractDeployed = await contract.deployed();

      this.#setContracts();
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_deploy,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Load an ERC721UserMintable contract from an existing contract address. Used by the SDK class
   * @param {string} contractAddress Address of the ERC721UserMintable contract to load
   * @returns void
   */
  async loadContract({ contractAddress }) {
    if (this.contractAddress || this._contractDeployed) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_loadContract,
          message: ERROR_LOG.message.contract_already_loaded,
        }),
      );
    }

    if (!contractAddress || !ethers.utils.isAddress(contractAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_loadContract,
          message: ERROR_LOG.message.invalid_contract_address,
        }),
      );
    }

    try {
      this._contractDeployed = new ethers.Contract(
        contractAddress,
        smartContractArtifact.abi,
        this.#signer,
      );
      this.#setContracts();
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_loadContract,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Mint tokens by specifying quantity and sending in the correct value
   * @param {string} quantity Integer representation of quantity to mint
   * @param {string} cost Value (in Ether) of mint (cost per token * quantity)
   * @returns
   */
  async mint({ quantity, cost }) {
    if (!this._contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_mint,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!quantity || !Number.isInteger(quantity) || quantity < 1) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_mint,
          message: ERROR_LOG.message.invalid_quantity,
        }),
      );
    }

    const parsedCost = ethers.utils.parseEther(cost);

    try {
      return await this._contractDeployed.mint(quantity, {
        value: parsedCost,
        gasLimit: GAS_LIMIT,
      });
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_mint,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Returns the value of the mint per token (in Ether)
   * @returns {Number} value in Ether of the mint per token
   */
  async price() {
    try {
      const price = await this._contractDeployed.price();
      return utils.formatEther(price);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_price,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Reserves (mints) an amount of tokens to the owner of the contract
   * @param quantity The quantity of tokens to mint to the owner (1-20)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async reserve({ quantity, gas = null }) {
    if (!this._contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_reserve,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!quantity || !Number.isInteger(quantity) || !(quantity > 0 && quantity)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_reserve,
          message: ERROR_LOG.message.invalid_quantity,
        }),
      );
    }

    try {
      const options = addGasPriceToOptions({}, gas);
      return await this._contractDeployed.reserve(quantity, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_reserve,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Sets the status of the contract to revealed and sets the baseURI
   * @param baseURI The baseURI of the contract
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async reveal({ baseURI, gas = null }) {
    if (!this._contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_reveal,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!baseURI) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_reveal,
          message: ERROR_LOG.message.invalid_baseURI,
        }),
      );
    }

    try {
      const options = addGasPriceToOptions({}, gas);
      return await this._contractDeployed.reveal(baseURI, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_reveal,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * setBaseURI function: Set the "baseURI" metadata for the specified contract
   * @param {string} baseURI baseURI for the contract
   * (URI to a JSON file describing the contract's metadata)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async setBaseURI({ baseURI, gas = null }) {
    if (!this._contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_setBaseURI,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!baseURI) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_setBaseURI,
          message: ERROR_LOG.message.invalid_baseURI,
        }),
      );
    }

    /* eslint-disable no-console */
    if (!isURI(baseURI)) {
      console.warn(`WARNING: The ContractURI "${baseURI}" is not a link.`);
      console.warn('WARNING: BaseURI should be a link to a valid folder.');
    }

    try {
      const options = addGasPriceToOptions({}, gas);
      return await this._contractDeployed.setBaseURI(baseURI, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_setBaseURI,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Sets the price (in Ether) of the mint
   * @param {string} price Price of the mint (per token) in Ether as a string
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async setPrice({ price, gas = null }) {
    if (!this._contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_setPrice,
          message: ERROR_LOG.message.contract_not_deployed,
        }),
      );
    }

    if (price === undefined) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_setPrice,
          message: ERROR_LOG.message.invalid_price,
        }),
      );
    }

    try {
      const priceInWei = utils.parseEther(price);
      const options = addGasPriceToOptions({}, gas);
      return await this._contractDeployed.setPrice(priceInWei, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_setPrice,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Toggles the sale status of the contract
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async toggleSale(gas = null) {
    if (!this._contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_toggleSale,
          message: ERROR_LOG.message.contract_not_deployed,
        }),
      );
    }

    try {
      const options = addGasPriceToOptions({}, gas);
      return await this._contractDeployed.toggleSale(options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_toggleSale,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Withdraws ether balance to owner address
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async withdraw(gas = null) {
    if (!this.contractAddress && !this._contractDeployed) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_withdraw,
          message: ERROR_LOG.message.contract_not_deployed,
        }),
      );
    }

    try {
      const options = addGasPriceToOptions({}, gas);
      return await this._contractDeployed.withdraw(options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_withdraw,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  #setContracts() {
    this.contractAddress = this._contractDeployed.address;
    this.accessControl.setContract(this._contractDeployed);
    this.royalties.setContract(this._contractDeployed);
  }
}
