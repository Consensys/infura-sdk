import { ethers } from 'ethers';
import smartContractArtifact from './artifacts/ERC1155Mintable.js';
import { addGasPriceToOptions, isURI, isBoolean } from '../utils.js';
import { networkErrorHandler, errorLogger, ERROR_LOG } from '../error/handler.js';
import { GAS_LIMIT } from '../constants.js';
import AccessControl from './components/AccessControl.js';
import Royalties from './components/Royalties.js';

export default class ERC1155Mintable {
  /* eslint-disable no-underscore-dangle */
  accessControl;

  royalties;

  #signer;

  constructor(signer) {
    this.#signer = signer;
    this.accessControl = new AccessControl();
    this.royalties = new Royalties();
  }

  /**
   * Deploy ERC1155Mintable Contract. Used by the SDK class
   * @param {string} baseURI BaseURI of the contract
   * @param {string} ContractURI contractURI of the contract
   * @param {array} ids IDs of valid tokens for the contract
   * @param {number} gas (Optional) gas parameter to pass to transaction
   * (link to a JSON file describing the contract's metadata)
   * @notice Warning: This method will consume gas (varies depending on array size)
   * @returns void
   */
  async deploy({ baseURI, contractURI, ids = [], gas = null }) {
    if (this.contractAddress || this._contractDeployed) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_deploy,
          message: ERROR_LOG.message.contract_already_deployed,
        }),
      );
    }

    if (!this.#signer) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_deploy,
          message: ERROR_LOG.message.no_signer_instance_supplied,
        }),
      );
    }

    if (baseURI === undefined) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_deploy,
          message: ERROR_LOG.message.no_baseURI_supplied,
        }),
      );
    }

    /* eslint-disable no-console */
    if (!isURI(baseURI)) {
      console.warn(`WARNING: The BaseURI "${baseURI}" is not a link.`);
      console.warn('WARNING: BaseURI should be a public link to a valid folder.');
    }

    if (contractURI === undefined) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_deploy,
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
      const contract = await factory.deploy(baseURI, contractURI, ids, options);
      this._contractDeployed = await contract.deployed();

      this.#setContracts();
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_deploy,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Load an ERC1155Mintable contract from an existing contract address. Used by the SDK class
   * @param {string} contractAddress Address of the ERC1155Mintable contract to load
   * @returns void
   */
  async loadContract({ contractAddress }) {
    if (this.contractAddress || this._contractDeployed) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_loadContract,
          message: ERROR_LOG.message.contract_already_loaded,
        }),
      );
    }

    if (!contractAddress || !ethers.utils.isAddress(contractAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_loadContract,
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
          location: ERROR_LOG.location.ERC1155Mintable_loadContract,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Mint function: Mint a token for publicAddress
   * @param {string} to destination address of the minted token
   * @param {number} id ID of the token to mint
   * @param {number} quantity Quantity of the specified token to mint
   * @param {number} gas (Optional) gas parameter to pass to transaction
   * @notice Warning: This method will consume gas (52000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async mint({ to, id, quantity, gas = null }) {
    if (!this._contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_mint,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!to || !ethers.utils.isAddress(to)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_mint,
          message: ERROR_LOG.message.invalid_public_address,
        }),
      );
    }

    if (!quantity || !Number.isInteger(quantity) || quantity < 1) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_mint,
          message: ERROR_LOG.message.invalid_quantity,
        }),
      );
    }

    try {
      const options = addGasPriceToOptions({}, gas);
      return await this._contractDeployed.mint(to, id, quantity, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_mint,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Mint function: Mint multiple tokens for publicAddress
   * @param {string} to destination address of the minted token
   * @param {number} id ID of the token to mint
   * @param {number} quantity Quantity of the specified token to mint
   * @param {number} gas (Optional) gas parameter to pass to transaction
   * @notice Warning: This method will consume gas (varies depending on size of array)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async mintBatch({ to, ids = null, quantities = null, gas = null }) {
    if (!this._contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_mintBatch,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!to || !ethers.utils.isAddress(to)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_mintBatch,
          message: ERROR_LOG.message.invalid_public_address,
        }),
      );
    }

    if (ids.length !== quantities.length) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_mintBatch,
          message: ERROR_LOG.message.different_array_lengths,
        }),
      );
    }

    quantities.forEach(quantity => {
      if (!quantity || !Number.isInteger(quantity) || quantity < 1) {
        throw new Error(
          errorLogger({
            location: ERROR_LOG.location.ERC1155Mintable_mintBatch,
            message: ERROR_LOG.message.invalid_quantity,
          }),
        );
      }
    });

    try {
      const options = addGasPriceToOptions({}, gas);
      return await this._contractDeployed.mintBatch(to, ids, quantities, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_mintBatch,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Allow admin of contract to add new valid token IDs
   * @param {number[]} ids array of IDs to add
   * @param {number} gas (Optional) gas parameter to pass to transaction
   * @notice Warning: This method will consume gas (varies depending on size of array)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async addIds({ ids = [], gas = null }) {
    if (!this._contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_addIds,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!ids || ids.length < 1) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_addIds,
          message: ERROR_LOG.message.invalid_ids,
        }),
      );
    }

    try {
      const options = addGasPriceToOptions({}, gas);
      return await this._contractDeployed.addIds(ids, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_addIds,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * setBaseURI function: Set the "baseURI" metadata for the specified contract
   * @param {string} baseURI baseURI for the contract
   * @param {number} gas (Optional) gas parameter to pass to transaction
   * (URI to a JSON file describing the contract's metadata)
   * @notice Warning: This method will consume gas (35000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async setBaseURI({ baseURI, gas = null }) {
    if (!this._contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_setBaseURI,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!baseURI) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_setBaseURI,
          message: ERROR_LOG.message.invalid_baseURI,
        }),
      );
    }

    /* eslint-disable no-console */
    if (!isURI(baseURI)) {
      console.warn(`WARNING: The BaseURI "${baseURI}" is not a link.`);
      console.warn('WARNING: BaseURI should be a public link to a valid folder.');
    }

    try {
      const options = addGasPriceToOptions({}, gas);
      return await this._contractDeployed.setURI(baseURI, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_setBaseURI,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * setContractURI function: Set the "contractURI" metadata for the specified contract
   * @param {string} contractURI ContractURI for the contract
   * (URI to a JSON file describing the contract's metadata)
   * @param {number} gas (Optional) gas parameter to pass to transaction
   * @notice Warning: This method will consume gas (35000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async setContractURI({ contractURI, gas = null }) {
    if (!this._contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.BaseERC1155_setContractURI,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!contractURI) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.BaseERC1155_setContractURI,
          message: ERROR_LOG.message.invalid_contractURI,
        }),
      );
    }

    /* eslint-disable no-console */
    if (!isURI(contractURI)) {
      console.warn(`WARNING: The ContractURI "${contractURI}" is not a link.`);
      console.warn('WARNING: ContractURI should be a public link to a valid JSON metadata file');
    }

    try {
      const options = addGasPriceToOptions({}, gas);
      return await this._contractDeployed.setContractURI(contractURI, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.BaseERC1155_setContractURI,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * SafeTransfer function: safeTransfer the token 'tokenId' between 'from' and 'to addresses.
   * @param {string} from Address who will transfer the token
   * @param {string} to Address that will receive the token
   * @param {number} tokenId ID of the token that will be transfered
   * @param {number} quantity quantity of the given tokenId to be transferred
   * @param {number} gas (Optional) gas parameter to pass to transaction
   * @notice Warning: This method will consume gas (53000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async transfer({ from, to, tokenId, quantity, gas = null }) {
    if (!this._contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_transfer,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!from || !ethers.utils.isAddress(from)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_transfer,
          message: ERROR_LOG.message.invalid_from_address,
        }),
      );
    }

    if (!to || !ethers.utils.isAddress(to)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_transfer,
          message: ERROR_LOG.message.invalid_to_address,
        }),
      );
    }

    if (!Number.isInteger(tokenId)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_transfer,
          message: ERROR_LOG.message.tokenId_must_be_integer,
        }),
      );
    }

    if (!quantity || !Number.isInteger(quantity) || quantity < 1) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_transfer,
          message: ERROR_LOG.message.invalid_quantity,
        }),
      );
    }

    try {
      let options = { gasLimit: GAS_LIMIT };
      options = addGasPriceToOptions(options, gas);
      return await this._contractDeployed.safeTransferFrom(from, to, tokenId, quantity, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_transfer,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * TransferBatch function: safeBatchTransfer the 'tokenIds' between 'from' and 'to addresses.
   * @param {string} from Address who will transfer the token
   * @param {string} to Address that will receive the token
   * @param {number} tokenIds IDs of the tokens that will be transferred
   * @param {number} quantities quantities of the given tokenId to be transferred
   * @param {number} gas (Optional) gas parameter to pass to transaction
   * @notice Warning: This method will consume gas (varies depending on array size)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async transferBatch({ from, to, tokenIds, quantities, gas = null }) {
    if (!this._contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_transferBatch,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!from || !ethers.utils.isAddress(from)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_transferBatch,
          message: ERROR_LOG.message.invalid_from_address,
        }),
      );
    }

    if (!to || !ethers.utils.isAddress(to)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_transferBatch,
          message: ERROR_LOG.message.invalid_to_address,
        }),
      );
    }

    if (tokenIds.length !== quantities.length) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_transferBatch,
          message: ERROR_LOG.message.different_array_lengths,
        }),
      );
    }

    tokenIds.forEach(tokenId => {
      if (!Number.isInteger(tokenId)) {
        throw new Error(
          errorLogger({
            location: ERROR_LOG.location.ERC1155Mintable_transferBatch,
            message: ERROR_LOG.message.tokenId_must_be_integer,
          }),
        );
      }
    });

    quantities.forEach(quantity => {
      if (!quantity || !Number.isInteger(quantity) || quantity < 1) {
        throw new Error(
          errorLogger({
            location: ERROR_LOG.location.ERC1155Mintable_transferBatch,
            message: ERROR_LOG.message.invalid_quantity,
          }),
        );
      }
    });

    try {
      let options = { gasLimit: GAS_LIMIT };
      options = addGasPriceToOptions(options, gas);
      return await this._contractDeployed.safeBatchTransferFrom(
        from,
        to,
        tokenIds,
        quantities,
        options,
      );
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC1155Mintable_transferBatch,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * setApprovalForAll will give the full approval rights for a given address
   * @param {string} to Address which will receive the approval rights
   * @param {boolean} approvalStatus Boolean representing the approval to be given (true)
   *  or revoked (false)
   * @param {number} gas (Optional) gas parameter to pass to transaction
   * @notice Warning: This method will consume gas (46000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async setApprovalForAll({ to, approvalStatus, gas = null }) {
    if (!this._contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.BaseERC1155_setApprovalForAll,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!to || !ethers.utils.isAddress(to)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.BaseERC1155_setApprovalForAll,
          message: ERROR_LOG.message.no_to_address,
        }),
      );
    }

    if (!isBoolean(approvalStatus)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.BaseERC1155_setApprovalForAll,
          message: ERROR_LOG.message.approvalStatus_must_be_boolean,
        }),
      );
    }

    try {
      const options = addGasPriceToOptions({}, gas);
      return await this._contractDeployed.setApprovalForAll(to, approvalStatus, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.BaseERC1155_setApprovalForAll,
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
