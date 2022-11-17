import { ethers } from 'ethers';
import { DEFAULT_MINTER_ROLE, DEFAULT_ADMIN_ROLE } from '../../constants.js';
import { addGasPriceToOptions } from '../../utils.js';
import { networkErrorHandler, errorLogger, ERROR_LOG } from '../../error/handler.js';

export default class AccessControl {
  contractAddress;

  #contractDeployed;

  /**
   * Set contract information from the calling class (ERC721, ERC721User, ...)
   * @param {ethers.Contract} contract instance of the deployed contract
   * @returns void
   */
  setContract(contract) {
    this.#contractDeployed = contract;
    this.contractAddress = contract.address;
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
          location: ERROR_LOG.location.AccessControl_addMinter,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.AccessControl_addMinter,
          message: ERROR_LOG.message.invalid_public_address,
        }),
      );
    }

    try {
      const options = addGasPriceToOptions({}, gas);

      return await this.#contractDeployed.grantRole(DEFAULT_MINTER_ROLE, publicAddress, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.AccessControl_addMinter,
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
          location: ERROR_LOG.location.AccessControl_renounceMinter,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.AccessControl_renounceMinter,
          message: ERROR_LOG.message.invalid_public_address,
        }),
      );
    }

    try {
      const options = addGasPriceToOptions({}, gas);
      return await this.#contractDeployed.renounceRole(DEFAULT_MINTER_ROLE, publicAddress, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.AccessControl_renounceMinter,
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
          location: ERROR_LOG.location.AccessControl_removeMinter,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.AccessControl_removeMinter,
          message: ERROR_LOG.message.invalid_public_address,
        }),
      );
    }

    try {
      const options = addGasPriceToOptions({}, gas);
      return await this.#contractDeployed.revokeRole(DEFAULT_MINTER_ROLE, publicAddress, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.AccessControl_removeMinter,
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
          location: ERROR_LOG.location.AccessControl_isMinter,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.AccessControl_isMinter,
          message: ERROR_LOG.message.invalid_public_address,
        }),
      );
    }

    try {
      return await this.#contractDeployed.hasRole(DEFAULT_MINTER_ROLE, publicAddress);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.AccessControl_isMinter,
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
          location: ERROR_LOG.location.AccessControl_addAdmin,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.AccessControl_addAdmin,
          message: ERROR_LOG.message.invalid_public_address,
        }),
      );
    }

    try {
      const options = addGasPriceToOptions({}, gas);
      return await this.#contractDeployed.grantRole(DEFAULT_ADMIN_ROLE, publicAddress, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.AccessControl_addAdmin,
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
          location: ERROR_LOG.location.AccessControl_removeAdmin,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.AccessControl_removeAdmin,
          message: ERROR_LOG.message.invalid_public_address,
        }),
      );
    }

    try {
      const options = addGasPriceToOptions({}, gas);
      return await this.#contractDeployed.revokeRole(DEFAULT_ADMIN_ROLE, publicAddress, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.AccessControl_removeAdmin,
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
          location: ERROR_LOG.location.AccessControl_renounceAdmin,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.AccessControl_renounceAdmin,
          message: ERROR_LOG.message.invalid_public_address,
        }),
      );
    }

    try {
      const options = addGasPriceToOptions({}, gas);
      return await this.#contractDeployed.renounceRole(DEFAULT_ADMIN_ROLE, publicAddress, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.AccessControl_renounceAdmin,
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
          location: ERROR_LOG.location.AccessControl_isAdmin,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.AccessControl_isAdmin,
          message: ERROR_LOG.message.invalid_public_address,
        }),
      );
    }

    try {
      return await this.#contractDeployed.hasRole(DEFAULT_ADMIN_ROLE, publicAddress);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.AccessControl_isAdmin,
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
          location: ERROR_LOG.location.AccessControl_renounceOwnership,
          message: ERROR_LOG.message.contract_not_deployed,
        }),
      );
    }

    try {
      const options = addGasPriceToOptions({}, gas);
      return await this.#contractDeployed.renounceOwnership(options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.AccessControl_renounceOwnership,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }
}
