import { ethers, utils } from 'ethers';
import smartContractArtifact from './artifacts/ERC1155Mintable';
import HasRoyalty from '../ContractComponents/hasRoyalty';
import HasAccessControl from '../ContractComponents/hasAccessControl';
import { addGasPriceToOptions, isBoolean, isURI } from '../utils';
import { GAS_LIMIT } from '../constants';
import { log, Logger } from '../Logger';
import preparePolygonTransaction from './utils';
import { Chains } from '../Auth/availableChains';

export type DeployERC1155Params = {
  baseURI: string;
  contractURI: string;
  ids: number[];
  gas?: string;
};

type ContractAddressOptions = {
  contractAddress: string;
};

type MintOptions = {
  to: string;
  id: number;
  quantity: number;
  gas?: string;
};

type MintBatchOptions = {
  to: string;
  ids: number[];
  quantities: number[];
  gas?: string;
};

type AddIdsOptions = {
  ids: number[];
  gas?: string;
};

type SetBaseURIOptions = {
  baseURI: string;
  gas?: string;
};

type SetContractURIOptions = {
  contractURI: string;
  gas?: string;
};

type TransferOptions = {
  from: string;
  to: string;
  tokenId: number;
  quantity: number;
  gas?: string;
};

type SetApprovalForAllOptions = {
  to: string;
  approvalStatus: boolean;
  gas?: string;
};

type TransferBatchOptions = {
  from: string;
  to: string;
  tokenIds: number[];
  quantities: number[];
  gas?: string;
};

export default class ERC1155Mintable {
  private readonly gasLimit = GAS_LIMIT;

  contractAddress: string;

  accessControl: HasAccessControl;

  royalty: HasRoyalty;

  private contractDeployed: ethers.Contract;

  private readonly signer: ethers.Wallet | ethers.providers.JsonRpcSigner;

  constructor(signer: ethers.Wallet | ethers.providers.JsonRpcSigner) {
    this.signer = signer;
    this.accessControl = new HasAccessControl();
    this.royalty = new HasRoyalty();
  }

  /**
   * Deploy ERC1155Mintable Contract. Used by the SDK class
   * @param {object} params object containing all parameters
   * @param {string} params.baseURI BaseURI of the contract
   * @param {string} params.ContractURI contractURI of the contract
   * @param {array} params.ids IDs of valid tokens for the contract
   * @param {number} params.gas (Optional) gas parameter to pass to transaction
   * @notice Warning: This method will consume gas (varies depending on array size)
   * @returns {Promise<ERC1155Mintable>} Contract
   */
  async deploy(params: DeployERC1155Params): Promise<ERC1155Mintable> {
    if (this.contractAddress || this.contractDeployed) {
      log.throwArgumentError(
        Logger.message.contract_already_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.ERC1155MINTABLE_DEPLOY,
        },
      );
    }

    if (!this.signer) {
      log.throwArgumentError(Logger.message.no_signer_instance_supplied, 'signer', this.signer, {
        location: Logger.location.ERC1155MINTABLE_DEPLOY,
      });
    }

    if (!params.baseURI) {
      log.throwArgumentError(Logger.message.no_baseURI_supplied, 'baseURI', params.baseURI, {
        location: Logger.location.ERC1155MINTABLE_DEPLOY,
      });
    }

    /* eslint-disable no-console */
    if (!isURI(params.baseURI)) {
      console.warn(Logger.message.warning_baseURI);
      console.warn(Logger.message.warning_baseURI_tips);
    }

    if (!params.contractURI) {
      log.throwArgumentError(
        Logger.message.no_contractURI_supplied,
        'contractURI',
        params.contractURI,
        {
          location: Logger.location.ERC1155MINTABLE_DEPLOY,
        },
      );
    }

    /* eslint-disable no-console */
    if (!isURI(params.contractURI)) {
      console.warn(Logger.message.warning_contractURI);
      console.warn(Logger.message.warning_contractURI_tips);
    }

    try {
      const factory = new ethers.ContractFactory(
        smartContractArtifact.abi,
        smartContractArtifact.bytecode,
        this.signer,
      );

      const chainId = await this.signer.getChainId();
      let options;
      // If Polygon mainnet, set up options propperly to avoid underpriced transaction error
      /* istanbul ignore next */
      if (chainId === Chains.polygon)
        options = await preparePolygonTransaction(await this.signer.getTransactionCount());
      else options = addGasPriceToOptions({}, params.gas);
      const contract = await factory.deploy(
        params.baseURI,
        params.contractURI,
        params.ids,
        options,
      );
      this.contractDeployed = await contract.deployed();
      this.contractAddress = contract.address;
      this.setContracts();
      return this;
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.ERC1155MINTABLE_DEPLOY,
        error,
      });
    }
  }

  /**
   * Load an ERC1155Mintable contract from an existing contract address. Used by the SDK class
   * @param {object} params object containing all parameters
   * @param {string} params.contractAddress Address of the ERC1155Mintable contract to load
   * @returns {ERC1155Mintable} Contract
   */
  loadContract(params: ContractAddressOptions): ERC1155Mintable {
    if (this.contractAddress || this.contractDeployed) {
      log.throwArgumentError(
        Logger.message.contract_already_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.ERC1155MINTABLE_LOADCONTRACT,
        },
      );
    }

    if (!params.contractAddress || !utils.isAddress(params.contractAddress)) {
      log.throwMissingArgumentError(Logger.message.invalid_contract_address, {
        location: Logger.location.ERC1155MINTABLE_LOADCONTRACT,
      });
    }

    try {
      this.contractDeployed = new ethers.Contract(
        params.contractAddress,
        smartContractArtifact.abi,
        this.signer,
      );
      this.setContracts();
      return this;
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.ERC1155MINTABLE_LOADCONTRACT,
        error,
      });
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
  async mint(params: MintOptions): Promise<ethers.providers.TransactionResponse> {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.ERC1155MINTABLE_MINT,
        },
      );
    }

    if (!params.to || !utils.isAddress(params.to)) {
      log.throwMissingArgumentError(Logger.message.invalid_contract_address, {
        location: Logger.location.ERC1155MINTABLE_MINT,
      });
    }

    if (!params.quantity || !Number.isInteger(params.quantity) || params.quantity < 1) {
      log.throwArgumentError(Logger.message.invalid_mint_quantity, 'quantity', params.quantity, {
        location: Logger.location.ERC1155MINTABLE_MINT,
      });
    }

    try {
      const chainId = await this.signer.getChainId();
      let options;
      // If Polygon mainnet, set up options propperly to avoid underpriced transaction error
      /* istanbul ignore next */
      if (chainId === Chains.polygon)
        options = await preparePolygonTransaction(await this.signer.getTransactionCount());
      else options = addGasPriceToOptions({}, params.gas);
      const result = await this.contractDeployed.mint(
        params.to,
        params.id,
        params.quantity,
        options,
      );
      return result;
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.ERC1155MINTABLE_MINT,
        error,
      });
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
  async mintBatch(params: MintBatchOptions): Promise<ethers.providers.TransactionResponse> {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.ERC1155MINTABLE_MINT_BATCH,
        },
      );
    }

    if (!params.to || !utils.isAddress(params.to)) {
      log.throwMissingArgumentError(Logger.message.invalid_contract_address, {
        location: Logger.location.ERC1155MINTABLE_MINT_BATCH,
      });
    }

    if (params.ids.length !== params.quantities.length) {
      log.throwArgumentError(Logger.message.different_array_lengths, 'ids', params.ids, {
        location: Logger.location.ERC1155MINTABLE_MINT_BATCH,
      });
    }

    params.quantities.forEach(quantity => {
      if (!quantity || !Number.isInteger(quantity) || quantity < 1) {
        log.throwArgumentError(Logger.message.invalid_quantity, 'quantity', quantity, {
          location: Logger.location.ERC1155MINTABLE_MINT_BATCH,
        });
      }
    });

    try {
      const options = addGasPriceToOptions({}, params.gas);
      const result = await this.contractDeployed.mintBatch(
        params.to,
        params.ids,
        params.quantities,
        options,
      );
      return result;
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.ERC1155MINTABLE_MINT_BATCH,
        error,
      });
    }
  }

  /**
   * Allow admin of contract to add new valid token IDs
   * @param {object} params object containing all parameters
   * @param {number[]} params.ids array of IDs to add
   * @param {number} params.gas (Optional) gas parameter to pass to transaction
   * @notice Warning: This method will consume gas (varies depending on size of array)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async addIds(params: AddIdsOptions): Promise<ethers.providers.TransactionResponse> {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.ERC1155_ADD_IDS,
        },
      );
    }

    if (!params.ids || params.ids.length < 1) {
      log.throwArgumentError(Logger.message.invalid_ids, 'ids', params.ids, {
        location: Logger.location.ERC1155_ADD_IDS,
      });
    }

    try {
      const options = addGasPriceToOptions({}, params.gas);
      const result = await this.contractDeployed.addIds(params.ids, options);
      return result;
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.ERC1155_ADD_IDS,
        error,
      });
    }
  }

  /**
   * setBaseURI function: Set the "baseURI" metadata for the specified contract
   * @param {object} params object containing all parameters
   * @param {string} params.baseURI baseURI for the contract
   * @param {number} params.gas (Optional) gas parameter to pass to transaction
   * (URI to a JSON file describing the contract's metadata)
   * @notice Warning: This method will consume gas (35000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async setBaseURI(params: SetBaseURIOptions) {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.ERC1155MINTABLE_SET_BASE_URI,
        },
      );
    }

    if (!params.baseURI) {
      log.throwMissingArgumentError(Logger.message.invalid_baseURI, {
        location: Logger.location.ERC1155MINTABLE_SET_BASE_URI,
      });
    }

    /* eslint-disable no-console */
    if (!isURI(params.baseURI)) {
      console.warn(Logger.message.warning_baseURI);
      console.warn(Logger.message.warning_baseURI_tips);
    }

    try {
      const options = addGasPriceToOptions({}, params.gas);
      const result = await this.contractDeployed.setURI(params.baseURI, options);
      return result;
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.ERC1155MINTABLE_SET_BASE_URI,
        error,
      });
    }
  }

  /**
   * setContractURI function: Set the "contractURI" metadata for the specified contract
   * @param {object} params object containing all parameters
   * @param {string} params.contractURI ContractURI for the contract
   * (URI to a JSON file describing the contract's metadata)
   * @notice Warning: This method will consume gas (35000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async setContractURI(
    params: SetContractURIOptions,
  ): Promise<ethers.providers.TransactionResponse> {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.ERC1155MINTABLE_SET_CONTRACT_URI,
        },
      );
    }

    if (!params.contractURI) {
      log.throwMissingArgumentError(Logger.message.no_contractURI_supplied, {
        location: Logger.location.ERC1155MINTABLE_SET_CONTRACT_URI,
      });
    }

    /* eslint-disable no-console */
    if (!isURI(params.contractURI)) {
      console.warn(Logger.message.warning_contractURI);
      console.warn(Logger.message.warning_contractURI_tips);
    }

    try {
      const options = addGasPriceToOptions({}, params.gas);
      const result = await this.contractDeployed.setContractURI(params.contractURI, options);
      return result;
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.ERC1155MINTABLE_SET_CONTRACT_URI,
        error,
      });
    }
  }

  /**
   * SafeTransfer function: safeTransfer the token 'tokenId' between 'from' and 'to addresses.
   * @param {object} params object containing all parameters
   * @param {string} params.from Address who will transfer the token
   * @param {string} params.to Address that will receive the token
   * @param {number} params.tokenId ID of the token that will be transfered
   * @param {number} params.quantity quantity of the given tokenId to be transferred
   * @param {number} params.gas (Optional) gas parameter to pass to transaction
   * @notice Warning: This method will consume gas (53000 gas estimated)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async transfer(params: TransferOptions): Promise<ethers.providers.TransactionResponse> {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.ERC1155_TRANSFER,
        },
      );
    }

    if (!params.from || !ethers.utils.isAddress(params.from)) {
      log.throwMissingArgumentError(Logger.message.invalid_from_address, {
        location: Logger.location.ERC1155_TRANSFER,
      });
    }

    if (!params.to || !utils.isAddress(params.to)) {
      log.throwMissingArgumentError(Logger.message.invalid_to_address, {
        location: Logger.location.ERC1155_TRANSFER,
      });
    }

    if (!Number.isInteger(params.tokenId) || params.tokenId < 0) {
      log.throwArgumentError(Logger.message.tokenId_must_be_integer, 'tokenId', params.tokenId, {
        location: Logger.location.ERC1155_TRANSFER,
      });
    }

    if (!params.quantity || !Number.isInteger(params.quantity) || params.quantity < 1) {
      log.throwArgumentError(Logger.message.invalid_mint_quantity, 'quantity', params.quantity, {
        location: Logger.location.ERC1155_TRANSFER,
      });
    }

    try {
      const chainId = await this.signer.getChainId();
      let options;
      /* istanbul ignore next */
      if (chainId === Chains.polygon)
        options = await preparePolygonTransaction(await this.signer.getTransactionCount());
      else options = addGasPriceToOptions({ gasLimit: this.gasLimit }, params.gas);
      const result = await this.contractDeployed.safeTransferFrom(
        params.from,
        params.to,
        params.tokenId,
        params.quantity,
        [],
        options,
      );
      return result;
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.ERC1155_TRANSFER,
        error,
      });
    }
  }

  /**
   * TransferBatch function: safeBatchTransfer the 'tokenIds' between 'from' and 'to addresses.
   * @param {object} params object containing all parameters
   * @param {string} params.from Address who will transfer the token
   * @param {string} params.to Address that will receive the token
   * @param {number} params.tokenIds IDs of the tokens that will be transferred
   * @param {number} params.quantities quantities of the given tokenId to be transferred
   * @param {number} params.gas (Optional) gas parameter to pass to transaction
   * @notice Warning: This method will consume gas (varies depending on array size)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async transferBatch(params: TransferBatchOptions): Promise<ethers.providers.TransactionResponse> {
    if (!this.contractDeployed && !this.contractAddress) {
      log.throwArgumentError(
        Logger.message.contract_not_deployed,
        'contractAddress',
        this.contractAddress,
        {
          location: Logger.location.ERC1155_TRANSFER_BATCH,
        },
      );
    }

    if (!params.from || !utils.isAddress(params.from)) {
      log.throwMissingArgumentError(Logger.message.invalid_from_address, {
        location: Logger.location.ERC1155_TRANSFER_BATCH,
      });
    }

    if (!params.to || !ethers.utils.isAddress(params.to)) {
      log.throwMissingArgumentError(Logger.message.invalid_to_address, {
        location: Logger.location.ERC1155_TRANSFER_BATCH,
      });
    }

    if (params.tokenIds.length !== params.quantities.length) {
      log.throwArgumentError(Logger.message.different_array_lengths, 'tokenIds', params.tokenIds, {
        location: Logger.location.ERC1155_TRANSFER_BATCH,
      });
    }

    params.tokenIds.forEach(tokenId => {
      if (!Number.isInteger(tokenId)) {
        log.throwArgumentError(Logger.message.invalid_quantity, 'tokenId', tokenId, {
          location: Logger.location.ERC1155_TRANSFER_BATCH,
        });
      }
    });

    params.quantities.forEach(quantity => {
      if (!quantity || !Number.isInteger(quantity) || quantity < 1) {
        log.throwArgumentError(Logger.message.invalid_quantity, 'quantity', quantity, {
          location: Logger.location.ERC1155_TRANSFER_BATCH,
        });
      }
    });

    try {
      let options = { gasLimit: this.gasLimit };
      options = addGasPriceToOptions(options, params.gas);
      const result = await this.contractDeployed.safeBatchTransferFrom(
        params.from,
        params.to,
        params.tokenIds,
        params.quantities,
        [],
        options,
      );
      return result;
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.ERC1155_TRANSFER_BATCH,
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
          location: Logger.location.ERC1155_SETAPPROVALFORALL,
        },
      );
    }

    if (!params.to || !ethers.utils.isAddress(params.to)) {
      log.throwMissingArgumentError(Logger.message.invalid_to_address, {
        location: Logger.location.ERC1155_SETAPPROVALFORALL,
      });
    }

    if (!isBoolean(params.approvalStatus)) {
      log.throwArgumentError(
        Logger.message.approvalStatus_must_be_boolean,
        'approvalStatus',
        params.approvalStatus,
        {
          location: Logger.location.ERC1155_SETAPPROVALFORALL,
        },
      );
    }

    try {
      const options = addGasPriceToOptions({}, params.gas);
      const result = await this.contractDeployed.setApprovalForAll(
        params.to,
        params.approvalStatus,
        options,
      );
      return result;
    } catch (error) {
      return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
        location: Logger.location.ERC1155_SETAPPROVALFORALL,
        error,
      });
    }
  }

  setContracts() {
    this.contractAddress = this.contractDeployed.address;
    this.accessControl.setContract(this.contractDeployed);
    this.royalty.setContract(this.contractDeployed);
  }
}
