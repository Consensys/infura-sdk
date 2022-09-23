import { ethers } from 'ethers';
import { addGasPriceToOptions, isDefined } from '../../utils.js';
import { networkErrorHandler, errorLogger, ERROR_LOG } from '../../error/handler.js';
import { GAS_LIMIT } from '../../constants.js';

export default class Royalties {
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
          location: ERROR_LOG.location.Royalties_setRoyalties,
          message: ERROR_LOG.message.contract_not_deployed,
        }),
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Royalties_setRoyalties,
          message: ERROR_LOG.message.no_address_supplied,
        }),
      );
    }

    if (!fee || !Number.isInteger(fee) || !(fee > 0 && fee < 10000)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Royalties_setRoyalties,
          message: ERROR_LOG.message.fee_must_be_between_0_and_10000,
        }),
      );
    }

    try {
      const options = addGasPriceToOptions({ gasLimit: GAS_LIMIT }, gas);
      return await this.#contractDeployed.setRoyalties(publicAddress, fee, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Royalties_setRoyalties,
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
          location: ERROR_LOG.location.Royalties_royaltyInfo,
          message: ERROR_LOG.message.contract_not_deployed,
        }),
      );
    }

    if (!isDefined(tokenId)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Royalties_royaltyInfo,
          message: ERROR_LOG.message.no_tokenId_supplied,
        }),
      );
    }

    if (!sellPrice) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Royalties_royaltyInfo,
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
          location: ERROR_LOG.location.Royalties_royaltyInfo,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }
}
