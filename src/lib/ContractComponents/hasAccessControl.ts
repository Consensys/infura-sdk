import { ethers } from 'ethers';
import { Logger, log } from '../Logger';
import { addGasPriceToOptions } from '../utils';
import { DEFAULT_ADMIN_ROLE, DEFAULT_MINTER_ROLE } from '../constants';

type SingleAddressOptions = {
  publicAddress: string;
  gas?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
};

type RenounceOptions = {
  gas?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
};

export default class HasAccessControl {
  contractAddress: string;

  private contractDeployed: ethers.Contract;

  setContract(contract: ethers.Contract) {
    this.contractDeployed = contract;
    this.contractAddress = contract.address;
  }

  /**
   * Add minter function: Grant the 'minter' role to an address
   * @param {object} params object containing all parameters
   * @param {string} params.publicAddress the address to be elevated at 'minter' role
   * @notice Warning: This method will consume gas (30000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async addMinter(params: SingleAddressOptions): Promise<ethers.providers.TransactionResponse> {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.HASACCESSCONTROL_ADDMINTER,
        },
      );
    }

    if (!params.publicAddress || !ethers.utils.isAddress(params.publicAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_public_address, {
        location: Logger.location.HASACCESSCONTROL_ADDMINTER,
      });
    }

    try {
      const options = addGasPriceToOptions(
        {},
        params.gas,
        params.maxFeePerGas,
        params.maxPriorityFeePerGas,
      );
      return this.contractDeployed.grantRole(DEFAULT_MINTER_ROLE, params.publicAddress, options);
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.HASACCESSCONTROL_ADDMINTER,
        error,
      });
    }
  }

  /**
   * Renounce minter function: Renounce the 'minter' role
   * @param {object} params object containing all parameters
   * @param {string} params.publicAddress the address that will renounce its 'minter' role
   * @notice Warning: This method will consume gas (40000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async renounceMinter(
    params: SingleAddressOptions,
  ): Promise<ethers.providers.TransactionResponse> {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.HASACCESSCONTROL_RENOUNCEMINTER,
        },
      );
    }

    if (!params.publicAddress || !ethers.utils.isAddress(params.publicAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_public_address, {
        location: Logger.location.HASACCESSCONTROL_RENOUNCEMINTER,
      });
    }

    try {
      const options = addGasPriceToOptions(
        {},
        params.gas,
        params.maxFeePerGas,
        params.maxPriorityFeePerGas,
      );
      return this.contractDeployed.renounceRole(DEFAULT_MINTER_ROLE, params.publicAddress, options);
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.HASACCESSCONTROL_RENOUNCEMINTER,
        error,
      });
    }
  }

  /**
   * Remove minter function: Remove the 'minter' role to an address
   * @param {object} params object containing all parameters
   * @param {string} params.publicAddress the address that will loose the 'minter' role
   * @notice Warning: This method will consume gas (30000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async removeMinter(params: SingleAddressOptions): Promise<ethers.providers.TransactionResponse> {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.HASACCESSCONTROL_REMOVEMINTER,
        },
      );
    }

    if (!params.publicAddress || !ethers.utils.isAddress(params.publicAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_public_address, {
        location: Logger.location.HASACCESSCONTROL_REMOVEMINTER,
      });
    }

    try {
      const options = addGasPriceToOptions(
        {},
        params.gas,
        params.maxFeePerGas,
        params.maxPriorityFeePerGas,
      );
      return this.contractDeployed.revokeRole(DEFAULT_MINTER_ROLE, params.publicAddress, options);
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.HASACCESSCONTROL_REMOVEMINTER,
        error,
      });
    }
  }

  /**
   * Is minter function: Check if an address has the 'minter' role or not
   * @param {object} params object containing all parameters
   * @param {string} params.publicAddress the address to check
   * @returns {Promise<boolean>} Promise that will return a boolean
   */
  async isMinter(params: SingleAddressOptions): Promise<boolean> {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.HASACCESSCONTROL_ISMINTER,
        },
      );
    }

    if (!params.publicAddress || !ethers.utils.isAddress(params.publicAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_public_address, {
        location: Logger.location.HASACCESSCONTROL_ISMINTER,
      });
    }

    try {
      return this.contractDeployed.hasRole(DEFAULT_MINTER_ROLE, params.publicAddress);
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.HASACCESSCONTROL_ISMINTER,
        error,
      });
    }
  }

  /**
   * Add Admin function: Add the 'admin' role to an address. Only callable by
   * addresses with the admin role.
   * @param {object} params object containing all parameters
   * @param {string} params.publicAddress the address that will loose the 'minter' role
   * @notice Warning: This method will consume gas (30000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async addAdmin(params: SingleAddressOptions): Promise<ethers.providers.TransactionResponse> {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.HASACCESSCONTROL_ADDADMIN,
        },
      );
    }

    if (!params.publicAddress || !ethers.utils.isAddress(params.publicAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_public_address, {
        location: Logger.location.HASACCESSCONTROL_ADDADMIN,
      });
    }

    try {
      const options = addGasPriceToOptions(
        {},
        params.gas,
        params.maxFeePerGas,
        params.maxPriorityFeePerGas,
      );
      return this.contractDeployed.grantRole(DEFAULT_ADMIN_ROLE, params.publicAddress, options);
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.HASACCESSCONTROL_ADDADMIN,
        error,
      });
    }
  }

  /**
   * Remove Admin function: Remove the 'admin' role to an address. Only callable by
   * addresses with the admin role.
   * @param {object} params object containing all parameters
   * @param {string} params.publicAddress the address that will loose the 'minter' role
   * @notice Warning: This method will consume gas (40000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async removeAdmin(params: SingleAddressOptions): Promise<ethers.providers.TransactionResponse> {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.HASACCESSCONTROL_REMOVEADMIN,
        },
      );
    }

    if (!params.publicAddress || !ethers.utils.isAddress(params.publicAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_public_address, {
        location: Logger.location.HASACCESSCONTROL_REMOVEADMIN,
      });
    }

    try {
      const options = addGasPriceToOptions(
        {},
        params.gas,
        params.maxFeePerGas,
        params.maxPriorityFeePerGas,
      );
      return this.contractDeployed.revokeRole(DEFAULT_ADMIN_ROLE, params.publicAddress, options);
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.HASACCESSCONTROL_REMOVEADMIN,
        error,
      });
    }
  }

  /**
   * Renounce Admin function: Remove the 'admin' role to an address. Only callable by
   * address invoking the request.
   * @param {object} params object containing all parameters
   * @param {string} params.publicAddress the address that will loose the 'minter' role
   * @notice Warning: This method will consume gas (30000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async renounceAdmin(params: SingleAddressOptions): Promise<ethers.providers.TransactionResponse> {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.HASACCESSCONTROL_RENOUNCEADMIN,
        },
      );
    }

    if (!params.publicAddress || !ethers.utils.isAddress(params.publicAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_public_address, {
        location: Logger.location.HASACCESSCONTROL_RENOUNCEADMIN,
      });
    }

    try {
      const options = addGasPriceToOptions(
        {},
        params.gas,
        params.maxFeePerGas,
        params.maxPriorityFeePerGas,
      );
      return this.contractDeployed.renounceRole(DEFAULT_ADMIN_ROLE, params.publicAddress, options);
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.HASACCESSCONTROL_RENOUNCEADMIN,
        error,
      });
    }
  }

  /**
   * Is Admin function: Check whether an address has the 'admin' role
   * @param {object} params object containing all parameters
   * @param {string} params.publicAddress the address to check
   * @returns {Promise<boolean>} Promise that will return a boolean
   */
  async isAdmin(params: SingleAddressOptions): Promise<boolean> {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.HASACCESSCONTROL_ISADMIN,
        },
      );
    }

    if (!params.publicAddress || !ethers.utils.isAddress(params.publicAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_public_address, {
        location: Logger.location.HASACCESSCONTROL_ISADMIN,
      });
    }

    try {
      return this.contractDeployed.hasRole(DEFAULT_ADMIN_ROLE, params.publicAddress);
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.HASACCESSCONTROL_ISADMIN,
        error,
      });
    }
  }

  /**
   * Renouncing ownership of the smart contract (will leave the contract without an owner).
   * @notice Warning: This method will consume gas (25000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async renounceOwnership(params: RenounceOptions): Promise<ethers.providers.TransactionResponse> {
    if (!this.contractAddress && !this.contractDeployed) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.HASACCESSCONTROL_RENOUNCEOWNERSHIP,
        },
      );
    }

    try {
      const options = addGasPriceToOptions(
        {},
        params.gas,
        params.maxFeePerGas,
        params.maxPriorityFeePerGas,
      );
      return this.contractDeployed.renounceOwnership(options);
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.HASACCESSCONTROL_RENOUNCEOWNERSHIP,
        error,
      });
    }
  }
}
