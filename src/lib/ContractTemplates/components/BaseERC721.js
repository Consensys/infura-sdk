import { ethers } from 'ethers';
import { isBoolean, addGasPriceToOptions, isURI } from '../../utils.js';
import { networkErrorHandler, errorLogger, ERROR_LOG } from '../../error/handler.js';
import { GAS_LIMIT } from '../../constants.js';

export default class BaseERC721 {
  contractAddress;

  /* eslint-disable no-underscore-dangle */
  _contractDeployed;

  /**
   * Transfer function: Transfer the token 'tokenId' between 'from' and 'to addresses.
   * @param {string} from Address who will transfer the token
   * @param {string} to Address that will receive the token
   * @param {number} tokenId ID of the token that will be transfered
   * @notice Warning: This method will consume gas (62000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async transfer({ from, to, tokenId, gas = null }) {
    if (!this._contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.BaseERC721_transfer,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!from || !ethers.utils.isAddress(from)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.BaseERC721_transfer,
          message: ERROR_LOG.message.invalid_from_address,
        }),
      );
    }

    if (!to || !ethers.utils.isAddress(to)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.BaseERC721_transfer,
          message: ERROR_LOG.message.invalid_to_address,
        }),
      );
    }

    if (!Number.isInteger(tokenId)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.BaseERC721_transfer,
          message: ERROR_LOG.message.tokenId_must_be_integer,
        }),
      );
    }

    try {
      let options = { gasLimit: GAS_LIMIT };
      options = addGasPriceToOptions(options, gas);
      return await this._contractDeployed['safeTransferFrom(address,address,uint256)'](
        from,
        to,
        tokenId,
        options,
      );
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.BaseERC721_transfer,
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
    if (!this._contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.BaseERC721_setApprovalForAll,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!to || !ethers.utils.isAddress(to)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.BaseERC721_setApprovalForAll,
          message: ERROR_LOG.message.no_to_address,
        }),
      );
    }

    if (!isBoolean(approvalStatus)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.BaseERC721_setApprovalForAll,
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
          location: ERROR_LOG.location.BaseERC721_setApprovalForAll,
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
    if (!this._contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.BaseERC721_approveTransfer,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!to || !ethers.utils.isAddress(to)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.BaseERC721_approveTransfer,
          message: ERROR_LOG.message.invalid_to_address,
        }),
      );
    }

    if (!Number.isInteger(tokenId)) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.BaseERC721_approveTransfer,
          message: ERROR_LOG.message.tokenId_must_be_integer,
        }),
      );
    }

    try {
      const options = addGasPriceToOptions({}, gas);
      return await this._contractDeployed.approve(to, tokenId, options);
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.BaseERC721_approveTransfer,
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
    if (!this._contractDeployed && !this.contractAddress) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.BaseERC721_setContractURI,
          message: ERROR_LOG.message.contract_not_deployed_or_loaded,
        }),
      );
    }

    if (!contractURI) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.BaseERC721_setContractURI,
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
          location: ERROR_LOG.location.BaseERC721_setContractURI,
          message: ERROR_LOG.message.an_error_occured,
          options: `${type} ${message}`,
        }),
      );
    }
  }
}
