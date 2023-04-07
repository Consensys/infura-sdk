import { ethers } from 'ethers';
import { Logger, log } from '../Logger';
import { GAS_LIMIT } from '../constants';
import { addGasPriceToOptions, isBoolean, isURI } from '../utils';
import preparePolygonTransaction from '../ContractTemplates/utils';
import { Chains } from '../Auth/availableChains';

type TransferOptions = {
  from: string;
  to: string;
  tokenId: number;
  gas?: string;
};

type SetApprovalForAllOptions = {
  to: string;
  approvalStatus: boolean;
  gas?: string;
};

type ApproveTransferOptions = {
  to: string;
  tokenId: number;
  gas?: string;
};

type RenounceOptions = {
  gas?: string;
};

export default class BaseERC721 {
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
   * Transfer function: Transfer the token 'tokenId' between 'from' and 'to addresses.
   * @param {object} params object containing all parameters
   * @param {string} params.from Address who will transfer the token
   * @param {string} params.to Address that will receive the token
   * @param {number} params.tokenId ID of the token that will be transfered
   * @notice Warning: This method will consume gas (62000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async transfer(params: TransferOptions): Promise<ethers.providers.TransactionResponse> {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.BASEERC721_TRANSFER,
        },
      );
    }

    if (!params.from || !ethers.utils.isAddress(params.from)) {
      log.throwMissingArgumentError(Logger.message.invalid_from_address, {
        location: Logger.location.BASEERC721_TRANSFER,
      });
    }

    if (!params.to || !ethers.utils.isAddress(params.to)) {
      log.throwMissingArgumentError(Logger.message.invalid_to_address, {
        location: Logger.location.BASEERC721_TRANSFER,
      });
    }

    if (!Number.isInteger(params.tokenId) || params.tokenId < 0) {
      log.throwArgumentError(Logger.message.tokenId_must_be_integer, 'tokenId', params.tokenId, {
        location: Logger.location.BASEERC721_TRANSFER,
      });
    }

    try {
      const chainId = await this.contractDeployed.signer.getChainId();
      let options;
      // If Polygon mainnet, set up options propperly to avoid underpriced transaction error
      if (chainId === Chains.polygon)
        options = await preparePolygonTransaction(
          await this.contractDeployed.signer.getTransactionCount(),
        );
      else options = addGasPriceToOptions({ gasLimit: GAS_LIMIT }, params.gas);

      return this.contractDeployed['safeTransferFrom(address,address,uint256)'](
        params.from,
        params.to,
        params.tokenId,
        options,
      );
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.BASEERC721_TRANSFER,
        error,
      });
    }
  }

  /**
   * setApprovalForAll will give the full approval rights for a given address
   * @param {object} params object containing all parameters
   * @param {string} params.to Address which will receive the approval rights
   * @param {boolean} params.approvalStatus Boolean representing the approval to be given (true)
   *  or revoked (false)
   * @notice Warning: This method will consume gas (46000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async setApprovalForAll(
    params: SetApprovalForAllOptions,
  ): Promise<ethers.providers.TransactionResponse> {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.BASEERC721_SETAPPROVALFORALL,
        },
      );
    }

    if (!params.to || !ethers.utils.isAddress(params.to)) {
      log.throwMissingArgumentError(Logger.message.invalid_to_address, {
        location: Logger.location.BASEERC721_SETAPPROVALFORALL,
      });
    }

    if (!isBoolean(params.approvalStatus)) {
      log.throwArgumentError(
        Logger.message.approvalStatus_must_be_boolean,
        'approvalStatus',
        params.approvalStatus,
        {
          location: Logger.location.BASEERC721_SETAPPROVALFORALL,
        },
      );
    }

    try {
      const options = addGasPriceToOptions({}, params.gas);
      return this.contractDeployed.setApprovalForAll(params.to, params.approvalStatus, options);
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.BASEERC721_SETAPPROVALFORALL,
        error,
      });
    }
  }

  /**
   * Gives permission to to to transfer tokenId token to another address.
   * @param {object} params object containing all parameters
   * @param {string} params.to the address that will be approved to do the transfer.
   * @param {number} params.tokenId tokenId the nft id to transfer.
   * @notice Warning: This method will consume gas (50000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async approveTransfer(
    params: ApproveTransferOptions,
  ): Promise<ethers.providers.TransactionResponse> {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.BASEERC721_APPROVETRANSFER,
        },
      );
    }

    if (!params.to || !ethers.utils.isAddress(params.to)) {
      log.throwMissingArgumentError(Logger.message.invalid_to_address, {
        location: Logger.location.BASEERC721_APPROVETRANSFER,
      });
    }

    if (!Number.isInteger(params.tokenId) || params.tokenId < 0) {
      log.throwArgumentError(Logger.message.tokenId_must_be_integer, 'tokenId', params.tokenId, {
        location: Logger.location.BASEERC721_APPROVETRANSFER,
      });
    }

    try {
      const options = addGasPriceToOptions({}, params.gas);
      return this.contractDeployed.approve(params.to, params.tokenId, options);
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.BASEERC721_APPROVETRANSFER,
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
          location: Logger.location.BASEERC721_RENOUNCEOWNERSHIP,
        },
      );
    }

    try {
      const options = addGasPriceToOptions({}, params.gas);
      return this.contractDeployed.renounceOwnership(options);
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.BASEERC721_RENOUNCEOWNERSHIP,
        error,
      });
    }
  }

  /**
   * setContractURI function: Set the "contractURI" metadata for the specified contract
   * @param {string} contractURI ContractURI for the contract
   * (URI to a JSON file describing the contract's metadata)
   * @notice Warning: This method will consume gas (35000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async setContractURI({ contractURI, gas }: { contractURI: string; gas?: string }) {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.BASEERC721_SETCONTRACTURI,
        },
      );
    }

    if (!contractURI) {
      log.throwArgumentError(Logger.message.contract_uri_not_defined, 'contractURI', contractURI, {
        location: Logger.location.BASEERC721_SETCONTRACTURI,
      });
    }

    /* eslint-disable no-console */
    if (!isURI(contractURI)) {
      console.warn(`WARNING: The ContractURI "${contractURI}" is not a link.`);
      console.warn('WARNING: ContractURI should be a public link to a valid JSON metadata file');
    }

    try {
      const options = addGasPriceToOptions({}, gas);
      return this.contractDeployed.setContractURI(contractURI, options);
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.BASEERC721_SETCONTRACTURI,
        error,
      });
    }
  }
}
