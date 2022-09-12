import { ethers, utils } from 'ethers';

import { TEMPLATES } from '../NFT/constants.js';
import smartContractArtifact from './artifacts/ERC721UserMintable.js';
import { isBoolean, isDefined } from '../utils.js';
import { networkErrorHandler, errorLogger, ERROR_LOG } from '../error/handler.js';

export default class ERC721UserMintable {
  #gasLimit = 6000000;

  contractAddress;

  #contractDeployed;

  #signer;

  #template = TEMPLATES.ERC721UserMintable;

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
            location: ERROR_LOG.location.ERC721UserMintable_addGasPriceToOptions,
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
          errorLogger({
            location: ERROR_LOG.location.ERC721UserMintable_addGasPriceToOptions,
            message: ERROR_LOG.message.an_error_occured,
            options: `${type} ${message}`,
          }),
        );
      }
    }
    return newOptions;
  }

  /**
   * Deploy ERC721UserMintable Contract. Used by the SDK class
   * @param {string} name Name of the contract
   * @param {string} symbol Symbol of the contract
   * @param {string} baseURI baseURI for the contract
   * (link to a JSON file describing the contract's metadata)
   * @param {string} maxSupply Maximum supply of tokens for the contract
   * @param {string} price Price to mint one token
   * @param {string} maxTokenRequest Maximum tokens that can be requested per tx
   * @returns void
   */
  async deploy({ name, symbol, baseURI, maxSupply, price, maxTokenRequest, gas = null }) {
    if (this.contractAddress || this.#contractDeployed) {
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

      const options = this.#addGasPriceToOptions({}, gas);
      const contract = await factory.deploy(
        name,
        symbol,
        baseURI,
        maxSupply,
        priceInWei,
        maxTokenRequest,
        options,
      );

      this.#contractDeployed = await contract.deployed();

      this.contractAddress = contract.address;
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
    if (this.contractAddress || this.#contractDeployed) {
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
          location: ERROR_LOG.location.ERC721UserMintable_loadContract,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  async mint({ quantity, cost }) {
    if (!this.#contractDeployed && !this.contractAddress) {
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
          message: ERROR_LOG.message.invalid_mint_quantity,
        }),
      );
    }

    const parsedCost = ethers.utils.parseEther(cost);

    try {
      return await this.#contractDeployed.mint(quantity, {
        value: parsedCost,
        gasLimit: this.#gasLimit,
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
      const price = await this.#contractDeployed.price();
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
    if (!this.#contractDeployed && !this.contractAddress) {
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
          message: ERROR_LOG.message.invalid_mint_quantity,
        }),
      );
    }

    try {
      const options = this.#addGasPriceToOptions({}, gas);
      return await this.#contractDeployed.reserve(quantity, options);
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
    if (!this.#contractDeployed && !this.contractAddress) {
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
      const options = this.#addGasPriceToOptions({}, gas);
      return await this.#contractDeployed.reveal(baseURI, options);
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
   * Returns receiver address and royalty amount based on sell price
   * @param {number} - Token ID
   * @param {number} - Sell price
   * @returns {Promise<object>} - Returns receiver address and bigNumber
   * representing royalty amount based on sell price
   */
  async royaltyInfo({ tokenId, sellPrice }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_royaltyInfo,
          message: ERROR_LOG.message.contract_not_deployed,
        }),
      );
    }

    if (!isDefined(tokenId)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_royaltyInfo,
          message: ERROR_LOG.message.no_tokenId_supplied,
        }),
      );
    }

    if (!sellPrice) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_royaltyInfo,
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
          location: ERROR_LOG.location.ERC721UserMintable_royaltyInfo,
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
    if (!this.#contractDeployed && !this.contractAddress) {
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

    try {
      const options = this.#addGasPriceToOptions({}, gas);
      return await this.#contractDeployed.setBaseURI(baseURI, options);
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
          location: ERROR_LOG.location.ERC721UserMintable_addAdmin,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_addAdmin,
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
          location: ERROR_LOG.location.ERC721UserMintable_addAdmin,
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
          location: ERROR_LOG.location.ERC721UserMintable_removeAdmin,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_removeAdmin,
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
          location: ERROR_LOG.location.ERC721UserMintable_removeAdmin,
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
          location: ERROR_LOG.location.ERC721UserMintable_renounceAdmin,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_renounceAdmin,
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
          location: ERROR_LOG.location.ERC721UserMintable_renounceAdmin,
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
          location: ERROR_LOG.location.ERC721UserMintable_isAdmin,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_isAdmin,
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
          location: ERROR_LOG.location.ERC721UserMintable_isAdmin,
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
    if (!this.#contractDeployed && !this.contractAddress) {
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
      const options = this.#addGasPriceToOptions({}, gas);
      return await this.#contractDeployed.setPrice(priceInWei, options);
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
   * Set royalties information for the receiver address with the provided fee
   * @param {string} - address
   * @param {number} - fee
   * @returns {Promise<ethers.providers.TransactionResponse>} - Transaction
   */
  async setRoyalties({ publicAddress, fee, gas = null }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_setRoyalties,
          message: ERROR_LOG.message.contract_not_deployed,
        }),
      );
    }

    if (!publicAddress || !utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_setRoyalties,
          message: ERROR_LOG.message.no_address_supplied,
        }),
      );
    }

    if (!fee || !Number.isInteger(fee) || !(fee > 0 && fee < 10000)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_setRoyalties,
          message: ERROR_LOG.message.fee_must_be_between_0_and_10000,
        }),
      );
    }

    try {
      let options = { gasLimit: this.#gasLimit };
      options = this.#addGasPriceToOptions(options, gas);
      return await this.#contractDeployed.setRoyalties(publicAddress, fee, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_setRoyalties,
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
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_toggleSale,
          message: ERROR_LOG.message.contract_not_deployed,
        }),
      );
    }

    try {
      const options = this.#addGasPriceToOptions({}, gas);
      return await this.#contractDeployed.toggleSale(options);
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
   * Transfer function: Transfer the token 'tokenId' between 'from' and 'to addresses.
   * @param {string} from Address who will transfer the token
   * @param {string} to Address that will receive the token
   * @param {number} tokenId ID of the token that will be transfered
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async transfer({ from, to, tokenId, gas = null }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_transfer,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!from || !ethers.utils.isAddress(from)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_transfer,
          message: ERROR_LOG.message.invalid_from_address,
        }),
      );
    }

    if (!to || !ethers.utils.isAddress(to)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_transfer,
          message: ERROR_LOG.message.invalid_to_address,
        }),
      );
    }

    if (!Number.isInteger(tokenId)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_transfer,
          message: ERROR_LOG.message.tokenId_must_be_integer,
        }),
      );
    }

    try {
      const options = this.#addGasPriceToOptions({ gasLimit: this.#gasLimit }, gas);
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
          location: ERROR_LOG.location.ERC721UserMintable_transfer,
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
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async setApprovalForAll({ to, approvalStatus, gas = null }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_setApprovalForAll,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!to || !ethers.utils.isAddress(to)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_setApprovalForAll,
          message: ERROR_LOG.message.no_to_address,
        }),
      );
    }

    if (!isBoolean(approvalStatus)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_setApprovalForAll,
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
          location: ERROR_LOG.location.ERC721UserMintable_setApprovalForAll,
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
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async approveTransfer({ to, tokenId, gas = null }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_approveTransfer,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!to || !ethers.utils.isAddress(to)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_approveTransfer,
          message: ERROR_LOG.message.invalid_to_address,
        }),
      );
    }

    if (!Number.isInteger(tokenId)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_approveTransfer,
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
          location: ERROR_LOG.location.ERC721UserMintable_approveTransfer,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }

  /**
   * Renouncing ownership of the smart contract (will leave the contract without an owner).
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async renounceOwnership(gas = null) {
    if (!this.contractAddress && !this.#contractDeployed) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_renounceOwnership,
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
          location: ERROR_LOG.location.ERC721UserMintable_renounceOwnership,
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
    if (!this.contractAddress && !this.#contractDeployed) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721UserMintable_withdraw,
          message: ERROR_LOG.message.contract_not_deployed,
        }),
      );
    }

    try {
      const options = this.#addGasPriceToOptions({}, gas);
      return await this.#contractDeployed.withdraw(options);
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
}
