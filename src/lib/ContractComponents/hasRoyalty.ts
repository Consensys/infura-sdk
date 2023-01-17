import { ethers, utils } from 'ethers';
import { Logger, log } from '../Logger';
import { addGasPriceToOptions, isDefined, isValidPositiveNumber } from '../utils';
import { GAS_LIMIT } from '../constants';

type RoyaltyInfoOptions = {
  tokenId: number;
  sellPrice: number;
};

type SetRoyaltiesOptions = {
  publicAddress: string;
  fee: number;
  gas?: string;
};

export default class HasRoyalty {
  contractAddress: string;

  private contractDeployed: ethers.Contract;

  /**
   * Set contract information from the calling class (ERC721, ERC721User, ...)
   * @param {ethers.Contract} contract instance of the deployed contract
   * @returns void
   */
  setContract(contract: ethers.Contract) {
    this.contractDeployed = contract;
    this.contractAddress = contract.address;
  }

  /**
   * Set royalties information for the receiver address with the provided fee
   * @param {object} params object containing all parameters
   * @param {string} params.publicAddress - address
   * @param {number} params.fee - fee
   * @notice Warning: This method will consume gas (49000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} - Transaction
   */
  async setRoyalties(params: SetRoyaltiesOptions): Promise<ethers.providers.TransactionResponse> {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.HASROYALTY_SETROYALTIES,
        },
      );
    }

    if (!params.publicAddress || !utils.isAddress(params.publicAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_public_address, {
        location: Logger.location.HASROYALTY_SETROYALTIES,
      });
    }

    if (!params.fee || !Number.isInteger(params.fee) || !(params.fee > 0 && params.fee < 10000)) {
      log.throwArgumentError(Logger.message.fee_must_be_between_0_and_10000, 'fee', params.fee, {
        location: Logger.location.HASROYALTY_SETROYALTIES,
      });
    }

    try {
      let options = { gasLimit: GAS_LIMIT };
      options = addGasPriceToOptions(options, params.gas);
      return this.contractDeployed.setRoyalties(params.publicAddress, params.fee, options);
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.HASROYALTY_SETROYALTIES,
        error,
      });
    }
  }

  /**
   * Returns receiver address and royalty amount based on sell price
   * @param {object} params object containing all parameters
   * @param {number} params.tokenId - Token ID
   * @param {number} params.sellPrice - Sell price
   * @returns {Promise<object>} - Returns receiver address and bigNumber
   * representing royalty amount based on sell price
   */
  async royaltyInfo(params: RoyaltyInfoOptions): Promise<object> {
    if (!this.contractDeployed) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.HASROYALTY_ROYALTYINFO,
        },
      );
    }

    if (!isDefined(params.tokenId) || !Number.isInteger(params.tokenId) || params.tokenId < 0) {
      log.throwMissingArgumentError(Logger.message.no_tokenId_supplied, {
        location: Logger.location.HASROYALTY_ROYALTYINFO,
      });
    }

    if (!params.sellPrice || !isValidPositiveNumber(params.sellPrice)) {
      log.throwMissingArgumentError(Logger.message.no_sell_price_supplied_or_not_valid, {
        location: Logger.location.HASROYALTY_ROYALTYINFO,
      });
    }

    try {
      return this.contractDeployed.royaltyInfo(params.tokenId, params.sellPrice);
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.HASROYALTY_ROYALTYINFO,
        error,
      });
    }
  }
}
