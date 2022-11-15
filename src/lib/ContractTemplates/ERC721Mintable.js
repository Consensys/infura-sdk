import { ethers } from 'ethers';
import smartContractArtifact from './artifacts/ERC721Mintable.js';
import { addGasPriceToOptions, isURI } from '../utils.js';
import { networkErrorHandler, errorLogger, ERROR_LOG } from '../error/handler.js';
import { GAS_LIMIT } from '../constants.js';
import BaseERC721 from './components/BaseERC721.js';
import AccessControl from './components/AccessControl.js';
import Royalties from './components/Royalties.js';

export default class ERC721Mintable extends BaseERC721 {
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
   * Deploy ERC721Mintable Contract. Used by the SDK class
   * @param {string} name Name of the contract
   * @param {string} symbol Symbol of the contract
   * @param {string} contractURI ContractURI for the contract
   * (link to a JSON file describing the contract's metadata)
   * @notice Warning: This method will consume gas (4000000 gas estimated)
   * @returns void
   */
  async deploy({ name, symbol, contractURI, gas = null }) {
    if (this.contractAddress || this._contractDeployed) {
      // throw new Error('[ERC721Mintable.deploy] The contract has already been deployed!');
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_deploy,
          message: ERROR_LOG.message.contract_already_deployed,
        }),
      );
    }

    if (!this.#signer) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_deploy,
          message: ERROR_LOG.message.no_signer_instance_supplied,
        }),
      );
    }

    if (!name) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_deploy,
          message: ERROR_LOG.message.no_name_supplied,
        }),
      );
    }

    if (symbol === undefined) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_deploy,
          message: ERROR_LOG.message.no_symbol_supplied,
        }),
      );
    }

    if (contractURI === undefined) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_deploy,
          message: ERROR_LOG.message.no_contractURI_supplied,
        }),
      );
    }

    /* eslint-disable no-console */
    if (!isURI(contractURI)) {
      console.warn(`WARNING: The ContractURI "${contractURI}" is not a link.`);
      console.warn('WARNING: ContractURI should be a public link to a valid JSON metadata file');
    }

    try {
      const factory = new ethers.ContractFactory(
        smartContractArtifact.abi,
        smartContractArtifact.bytecode,
        this.#signer,
      );

      const options = addGasPriceToOptions({}, gas);
      const contract = await factory.deploy(name, symbol, contractURI, options);
      this._contractDeployed = await contract.deployed();

      this.#setContracts();
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_deploy,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Mint function: Mint a token for publicAddress with the tokenURI provided
   * @param {string} publicAddress destination address of the minted token
   * @param {string} tokenURI link to the JSON object containing metadata about the token
   * @notice Warning: This method will consume gas (120000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async mint({ publicAddress, tokenURI, gas = null }) {
    if (!this._contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_mint,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_mint,
          message: ERROR_LOG.message.invalid_public_address,
        }),
      );
    }

    if (!tokenURI) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_mint,
          message: ERROR_LOG.message.no_tokenURI_supplied,
        }),
      );
    }

    /* eslint-disable no-console */
    if (!isURI(tokenURI)) {
      console.warn(`WARNING: The TokenURI "${tokenURI}" is not a link.`);
      console.warn('WARNING: TokenURI should be a public link to a valid JSON metadata file');
    }

    try {
      let options = { gasLimit: GAS_LIMIT };
      options = addGasPriceToOptions(options, gas);
      return await this._contractDeployed.mintWithTokenURI(publicAddress, tokenURI, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_mint,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Load an ERC721Mintable contract from an existing contract address. Used by the SDK class
   * @param {string} contractAddress Address of the ERC721Mintable contract to load
   * @returns void
   */
  async loadContract({ contractAddress }) {
    if (this.contractAddress || this._contractDeployed) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_loadContract,
          message: ERROR_LOG.message.contract_already_loaded,
        }),
      );
    }

    if (!contractAddress || !ethers.utils.isAddress(contractAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_loadContract,
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
          location: ERROR_LOG.location.ERC721Mintable_loadContract,
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
