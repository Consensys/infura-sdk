import { ethers, utils } from 'ethers';

import smartContractArtifact from './artifacts/ERC721Mintable.js';
import { isBoolean, isDefined, isURI } from '../utils.js';
import { TEMPLATES } from '../NFT/constants.js';
import { networkErrorHandler, errorLogger, ERROR_LOG } from '../error/handler.js';
import { GAS_LIMIT, DEFAULT_ADMIN_ROLE, DEFAULT_MINTER_ROLE } from '../constants.js';

export default class ERC721Mintable {
  #gasLimit = GAS_LIMIT;

  ADMIN_ROLE = DEFAULT_ADMIN_ROLE;

  MINTER_ROLE = DEFAULT_MINTER_ROLE;

  contractAddress;

  #contractDeployed;

  #signer;

  #template = TEMPLATES.ERC721Mintable;

  constructor(signer) {
    this.#signer = signer;
  }

  getTemplate() {
    return this.#template;
  }

  /* eslint-disable class-methods-use-this */
  #addGasPriceToOptions(options, gas) {
    const newOptions = options;
    if (gas) {
      if (typeof parseFloat(gas) !== 'number') {
        throw new Error(
          errorLogger({
            location: ERROR_LOG.location.ERC721Mintable_addGasPriceToOptions,
            message: ERROR_LOG.message.invalid_gas_price_supplied,
          }),
        );
      }
      try {
        const gasPrice = ethers.utils.parseUnits(gas, 'gwei');
        newOptions.gasPrice = gasPrice;
      } catch (error) {
        const { message, type } = networkErrorHandler(error);
        throw new Error(
          `${type}[ERC721Mintable.addGasPriceToOptions] An error occured: ${message}`,
        );
      }
    }
    return newOptions;
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
    if (this.contractAddress || this.#contractDeployed) {
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

      const options = this.#addGasPriceToOptions({}, gas);
      const contract = await factory.deploy(name, symbol, contractURI, options);

      this.#contractDeployed = await contract.deployed();

      this.contractAddress = contract.address;
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
   * Set royalties information for the receiver address with the provided fee
   * @param {string} - address
   * @param {number} - fee
   * @notice Warning: This method will consume gas (49000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} - Transaction
   */
  async setRoyalties({ publicAddress, fee, gas = null }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_setRoyalties,
          message: ERROR_LOG.message.contract_not_deployed,
        }),
      );
    }

    if (!publicAddress || !utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_setRoyalties,
          message: ERROR_LOG.message.no_address_supplied,
        }),
      );
    }

    if (!fee || !Number.isInteger(fee) || !(fee > 0 && fee < 10000)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_setRoyalties,
          message: ERROR_LOG.message.fee_must_be_between_0_and_10000,
        }),
      );
    }

    try {
      const options = this.#addGasPriceToOptions({ gasLimit: this.#gasLimit }, gas);
      return await this.#contractDeployed.setRoyalties(publicAddress, fee, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_setRoyalties,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Returns receiver address and royalty amount based on sell price
   * @param {number} - Token ID
   * @param {number} - Sell price
   * @returns {Promise<object>} - Returns receiver address and bigNumber
   * representing royalty amount based on sell price
   */
  async royaltyInfo({ tokenId, sellPrice }) {
    if (!this.#contractDeployed) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_royaltyInfo,
          message: ERROR_LOG.message.contract_not_deployed,
        }),
      );
    }

    if (!isDefined(tokenId)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_royaltyInfo,
          message: ERROR_LOG.message.no_tokenId_supplied,
        }),
      );
    }

    if (!sellPrice) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_royaltyInfo,
          message: ERROR_LOG.message.no_sell_price_supplied,
        }),
      );
    }

    try {
      return await this.#contractDeployed.royaltyInfo(tokenId, sellPrice);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_royaltyInfo,
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
    if (!this.#contractDeployed && !this.contractAddress) {
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
      let options = { gasLimit: this.#gasLimit };
      options = this.#addGasPriceToOptions(options, gas);
      return await this.#contractDeployed.mintWithTokenURI(publicAddress, tokenURI, options);
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
   * Add minter function: Grant the 'minter' role to an address
   * @param {string} publicAddress the address to be elevated at 'minter' role
   * @notice Warning: This method will consume gas (30000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async addMinter({ publicAddress, gas = null }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_addMinter,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_addMinter,
          message: ERROR_LOG.message.invalid_public_address,
        }),
      );
    }

    try {
      const options = this.#addGasPriceToOptions({}, gas);
      return await this.#contractDeployed.grantRole(this.MINTER_ROLE, publicAddress, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_addMinter,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Renounce minter function: Renounce the 'minter' role
   * @param {string} publicAddress the address that will renounce its 'minter' role
   * @notice Warning: This method will consume gas (40000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async renounceMinter({ publicAddress, gas = null }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_renounceMinter,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_renounceMinter,
          message: ERROR_LOG.message.invalid_public_address,
        }),
      );
    }

    try {
      const options = this.#addGasPriceToOptions({}, gas);
      return await this.#contractDeployed.renounceRole(this.MINTER_ROLE, publicAddress, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_renounceMinter,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Remove minter function: Remove the 'minter' role to an address
   * @param {string} publicAddress the address that will loose the 'minter' role
   * @notice Warning: This method will consume gas (30000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async removeMinter({ publicAddress, gas = null }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_removeMinter,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_removeMinter,
          message: ERROR_LOG.message.invalid_public_address,
        }),
      );
    }

    try {
      const options = this.#addGasPriceToOptions({}, gas);
      return await this.#contractDeployed.revokeRole(this.MINTER_ROLE, publicAddress, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_removeMinter,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Is minter function: Check if an address has the 'minter' role or not
   * @param {string} publicAddress the address to check
   * @returns {Promise<boolean>} Promise that will return a boolean
   */
  async isMinter({ publicAddress }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_isMinter,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_isMinter,
          message: ERROR_LOG.message.invalid_public_address,
        }),
      );
    }

    try {
      return await this.#contractDeployed.hasRole(this.MINTER_ROLE, publicAddress);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_isMinter,
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
    if (this.contractAddress || this.#contractDeployed) {
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
      this.#contractDeployed = new ethers.Contract(
        contractAddress,
        smartContractArtifact.abi,
        this.#signer,
      );

      this.contractAddress = contractAddress;
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

  /**
   * Transfer function: Transfer the token 'tokenId' between 'from' and 'to addresses.
   * @param {string} from Address who will transfer the token
   * @param {string} to Address that will receive the token
   * @param {number} tokenId ID of the token that will be transfered
   * @notice Warning: This method will consume gas (62000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async transfer({ from, to, tokenId, gas = null }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_transfer,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!from || !ethers.utils.isAddress(from)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_transfer,
          message: ERROR_LOG.message.invalid_from_address,
        }),
      );
    }

    if (!to || !ethers.utils.isAddress(to)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_transfer,
          message: ERROR_LOG.message.invalid_to_address,
        }),
      );
    }

    if (!Number.isInteger(tokenId)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_transfer,
          message: ERROR_LOG.message.tokenId_must_be_integer,
        }),
      );
    }

    try {
      let options = { gasLimit: this.#gasLimit };
      options = this.#addGasPriceToOptions(options, gas);
      return await this.#contractDeployed['safeTransferFrom(address,address,uint256)'](
        from,
        to,
        tokenId,
        options,
      );
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_transfer,
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
   * @notice Warning: This method will consume gas (35000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async setContractURI({ contractURI, gas = null }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_setContractURI,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!contractURI) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_setContractURI,
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
      const options = this.#addGasPriceToOptions({}, gas);
      return await this.#contractDeployed.setContractURI(contractURI, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_setContractURI,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Add Admin function: Add the 'admin' role to an address. Only callable by
   * addresses with the admin role.
   * @param {string} publicAddress the address that will loose the 'minter' role
   * @notice Warning: This method will consume gas (30000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async addAdmin({ publicAddress, gas = null }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_addAdmin,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_addAdmin,
          message: ERROR_LOG.message.invalid_public_address,
        }),
      );
    }

    try {
      const options = this.#addGasPriceToOptions({}, gas);
      return await this.#contractDeployed.grantRole(this.ADMIN_ROLE, publicAddress, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_addAdmin,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Remove Admin function: Remove the 'admin' role to an address. Only callable by
   * addresses with the admin role.
   * @param {string} publicAddress the address that will loose the 'minter' role
   * @notice Warning: This method will consume gas (40000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async removeAdmin({ publicAddress, gas = null }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_removeAdmin,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_removeAdmin,
          message: ERROR_LOG.message.invalid_public_address,
        }),
      );
    }

    try {
      const options = this.#addGasPriceToOptions({}, gas);
      return await this.#contractDeployed.revokeRole(this.ADMIN_ROLE, publicAddress, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_removeAdmin,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Renounce Admin function: Remove the 'admin' role to an address. Only callable by
   * address invoking the request.
   * @param {string} publicAddress the address that will loose the 'minter' role
   * @notice Warning: This method will consume gas (30000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async renounceAdmin({ publicAddress, gas = null }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_renounceAdmin,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_renounceAdmin,
          message: ERROR_LOG.message.invalid_public_address,
        }),
      );
    }

    try {
      const options = this.#addGasPriceToOptions({}, gas);
      return await this.#contractDeployed.renounceRole(this.ADMIN_ROLE, publicAddress, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_renounceAdmin,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Is Admin function: Check whether an address has the 'admin' role
   * @param {string} publicAddress the address to check
   * @returns {Promise<boolean>} Promise that will return a boolean
   */
  async isAdmin({ publicAddress }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_isAdmin,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_isAdmin,
          message: ERROR_LOG.message.invalid_public_address,
        }),
      );
    }

    try {
      return await this.#contractDeployed.hasRole(this.ADMIN_ROLE, publicAddress);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_isAdmin,
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
   * @notice Warning: This method will consume gas (46000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async setApprovalForAll({ to, approvalStatus, gas = null }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_setApprovalForAll,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!to || !ethers.utils.isAddress(to)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_setApprovalForAll,
          message: ERROR_LOG.message.no_to_address,
        }),
      );
    }

    if (!isBoolean(approvalStatus)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_setApprovalForAll,
          message: ERROR_LOG.message.approvalStatus_must_be_boolean,
        }),
      );
    }

    try {
      const options = this.#addGasPriceToOptions({}, gas);
      return await this.#contractDeployed.setApprovalForAll(to, approvalStatus, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_setApprovalForAll,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Gives permission to to to transfer tokenId token to another address.
   * @param {string} to the address that will be approved to do the transfer.
   * @param {number} tokenId tokenId the nft id to transfer.
   * @notice Warning: This method will consume gas (50000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async approveTransfer({ to, tokenId, gas = null }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_approveTransfer,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!to || !ethers.utils.isAddress(to)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_approveTransfer,
          message: ERROR_LOG.message.invalid_to_address,
        }),
      );
    }

    if (!Number.isInteger(tokenId)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_approveTransfer,
          message: ERROR_LOG.message.tokenId_must_be_integer,
        }),
      );
    }

    try {
      const options = this.#addGasPriceToOptions({}, gas);
      return await this.#contractDeployed.approve(to, tokenId, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_approveTransfer,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Renouncing ownership of the smart contract (will leave the contract without an owner).
   * @notice Warning: This method will consume gas (25000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async renounceOwnership(gas = null) {
    if (!this.contractAddress && !this.#contractDeployed) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_renounceOwnership,
          message: ERROR_LOG.message.contract_not_deployed,
        }),
      );
    }

    try {
      const options = this.#addGasPriceToOptions({}, gas);
      return await this.#contractDeployed.renounceOwnership(options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_renounceOwnership,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }
}
