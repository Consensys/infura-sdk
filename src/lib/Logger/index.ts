import version from '../../_version';

export enum ErrorCode {
  NETWORK = '[NETWORK.ERROR]',
  IPFS = '[IPFS.ERROR]',
  RUNTIME = '[RUNTIME.ERROR]',
  API = '[API.ERROR]',
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
  MISSING_ARGUMENT = 'MISSING_ARGUMENT',
  UNEXPECTED_ARGUMENT = 'UNEXPECTED_ARGUMENT',
}

export enum ErrorLocation {
  // AUTH
  AUTH_CONSTRUCTOR = '[Auth.constructor]',
  AUTH_SET_PROVIDER = '[Auth.setProvider]',

  // CONTRACT FACTORY
  CONTRACTFACTORY_FACTORY = '[ContractFactory.factory]',

  // PROVIDER
  PROVIDER_GETPROVIDER = '[Provider.getProvider]',
  PROVIDER_GETINJECTEDPROVIDER = '[Provider.getInjectedProvider]',

  // SIGNER
  SIGNER_GETWALLET = '[Signer.getWallet]',

  // HTTP SERVICE
  HTTPSERVICE_CONSTRUCTOR = '[httpService.constructor]',
  HTTPSERVICE_GET = '[httpService.get]',
  HTTPSERVICE_POST = '[httpService.post]',

  // IPFS SERVICE
  IPFSSERVICE_CONSTRUCTOR = '[IPFS.constructor]',
  IPFSSERVICE_UPLOADFILE = '[IPFS.uploadFile]',
  IPFSSERVICE_UPLOADOBJECT = '[IPFS.uploadObject]',
  IPFSSERVICE_UPLOADDIRECTORY = '[IPFS.uploadDirectory]',
  IPFSSERVICE_UNPINFILE = '[IPFS.unPinFile]',

  // IPFS SERVER CLIENT
  IPFS_SERVER_CONSTRUCTOR = '[IPFS.constructor]',
  IPFS_SERVER_UPLOADFILE = '[IPFS.uploadFile]',
  IPFS_SERVER_UPLOADDIRECTORY = '[IPFS.uploadDirectory]',
  IPFS_SERVER_UNPINFILE = '[IPFS.unPinFile]',

  // ERC721Mintable
  ERC721MINTABLE_DEPLOY = '[ERC721Mintable.deploy]',
  ERC721MINTABLE_ADDGASPRICETOOPTIONS = '[ERC721Mintable.addGasPriceToOptions]',
  ERC721MINTABLE_MINT = '[ERC721Mintable.mint]',
  ERC721MINTABLE_LOADCONTRACT = '[ERC721Mintable.loadContract]',
  ERC721MINTABLE_SET_CONTRACT_URI = '[ERC721Mintable.setContractURI]',

  // ERC721UserMintable
  ERC721USERMINTABLE_DEPLOY = '[ERC721UserMintable.deploy]',
  ERC721USERMINTABLE_ADDGASPRICETOOPTIONS = '[ERC721UserMintable.addGasPriceToOptions]',
  ERC721USERMINTABLE_MINT = '[ERC721UserMintable.mint]',
  ERC721USERMINTABLE_LOADCONTRACT = '[ERC721UserMintable.loadContract]',
  ERC721USERMINTABLE_SETCONTRACTURI = '[ERC721UserMintable.setContractURI]',
  ERC721USERMINTABLE_PRICE = '[ERC721UserMintable.price]',
  ERC721USERMINTABLE_SET_PRICE = '[ERC721UserMintable.setPrice]',
  ERC721USERMINTABLE_RESERVE = '[ERC721UserMintable.reserve]',
  ERC721USERMINTABLE_TOGGLE_SALE = '[ERC721UserMintable.toggleSale]',
  ERC721USERMINTABLE_WITHDRAW = '[ERC721UserMintable.withdraw]',
  ERC721USERMINTABLE_SET_BASE_URI = '[ERC721UserMintable.setBaseURI]',
  ERC721USERMINTABLE_REVEAL = '[ERC721UserMintable.reveal]',
  ERC721USERMINTABLE_TRANSFER = '[ERC721UserMintable.transfer]',

  // ER1155Mintable
  ERC1155MINTABLE_DEPLOY = '[ERC1155Mintable.deploy]',
  ERC1155MINTABLE_ADDGASPRICETOOPTIONS = '[ERC1155Mintable.addGasPriceToOptions]',
  ERC1155MINTABLE_MINT = '[ERC1155Mintable.mint]',
  ERC1155MINTABLE_MINT_BATCH = '[ERC1155Mintable.mintBatch]',
  ERC1155_ADD_IDS = '[ERC1155Mintable.addIds]',
  ERC1155MINTABLE_LOADCONTRACT = '[ERC1155Mintable.loadContract]',
  ERC1155MINTABLE_SET_CONTRACT_URI = '[ERC1155Mintable.setContractURI]',
  ERC1155MINTABLE_SET_BASE_URI = '[ERC1155Mintable.setBaseURI]',
  ERC1155_TRANSFER = '[ERC1155Mintable.transfer]',
  ERC1155_TRANSFER_BATCH = '[ERC1155Mintable.transferBatch]',
  ERC1155_SETAPPROVALFORALL = '[ERC1155Mintable.setApprovalForAll]',

  // BaseERC721
  BASEERC721_TRANSFER = '[BaseERC721.transfer]',
  BASEERC721_SETAPPROVALFORALL = '[BaseERC721.setApprovalForAll]',
  BASEERC721_APPROVETRANSFER = '[BaseERC721.approveTransfer]',
  BASEERC721_RENOUNCEOWNERSHIP = '[BaseERC721.renounceOwnership]',
  BASEERC721_SETCONTRACTURI = '[BaseERC721.setContractURI]',

  // HasAccessControl
  HASACCESSCONTROL_ADDADMIN = '[HasAccessControl.addAdmin]',
  HASACCESSCONTROL_RENOUNCEADMIN = '[HasAccessControl.renounceAdmin]',
  HASACCESSCONTROL_REMOVEADMIN = '[HasAccessControl.removeAdmin]',
  HASACCESSCONTROL_ISADMIN = '[HasAccessControl.isAdmin]',
  HASACCESSCONTROL_ADDMINTER = '[HasAccessControl.addMinter]',
  HASACCESSCONTROL_RENOUNCEMINTER = '[HasAccessControl.renounceMinter]',
  HASACCESSCONTROL_REMOVEMINTER = '[HasAccessControl.removeMinter]',
  HASACCESSCONTROL_ISMINTER = '[HasAccessControl.isMinter]',
  HASACCESSCONTROL_RENOUNCEOWNERSHIP = '[HasAccessControl.renounceOwnership]',
  // HasRoyalty
  HASROYALTY_SETROYALTIES = '[HasRoyalty.setRoyalties]',
  HASROYALTY_ROYALTYINFO = '[HasRoyalty.royaltyInfo]',

  // SDK
  SDK_CONSTRUCTOR = '[SDK.constructor]',
  SDK_DEPLOY = '[SDK.deploy]',
  SDK_LOADCONTRACT = '[SDK.loadContract]',
  SDK_GETCONTRACTMETADATA = '[SDK.getContractMetadata]',
  SDK_GETNFTS = '[SDK.getNFTs]',
  SDK_GETNFTSFORCOLLECTION = '[SDK.getNFTsForCollection]',
  SDK_GETTOKENMETADATA = '[SDK.getTokenMetadata]',
  SDK_GETSTATUS = '[SDK.GetStatus]',
  SDK_STOREFILE = '[SDK.storeFile]',
  SDK_STOREMETADATA = '[SDK.storeMetadata]',
  SDK_CREATEFOLDER = '[SDK.createFolder]',
  SDK_GETTRANSFERSBYBLOCKNUMBER = '[SDK.getTransfersByBlockNumber]',
  SDK_GET_TRANSFERS_BY_WALLET = '[SDK.getNftTransfersByWallet]',
  SDK_GETTRANSFERSBYBLOCKHASH = '[SDK.getTransfersByBlockHash]',
  SDK_GET_TRANSFERS_FROM_BLOCK_TO_BLOCK = '[SDK.getTransferFromBlockToBlock]',
  SDK_GET_TRANSFERS_BY_TOKEN_ID = '[SDK.getTransfersByTokenId]',
  SDK_GET_TRANSFERS_BY_CONTRACT = '[SDK.getTransfersByContractAddress]',
  SDK_GET_OWNERS_BY_TOKEN_ADDRESS = '[SDK.getOwnersByTokenAddress]',
  SDK_GET_OWNERS_BY_TOKEN_ADDRESS_AND_TOKEN_ID = '[SDK.getOwnersbyTokenAddressAndTokenId]',
  SDK_GET_COLLECTION_BY_WALLET = '[SDK.getCollectionsByWallet]',
  SDK_GET_SEARCH_NFT = '[SDK.searchNfts]',

  SDK_GET_LOWEST_TRADE_PRICE = '[SDK.getLowestTradePrice]',

  // Metadata
  METADATA_TOKEN_CREATION = '[Metadata.tokenLevelMetadata]',
  METADATA_CONTRACT_CREATION = '[Metadata.contractLevelMetadata]',
  METADATA_FREE_CREATION = '[Metadata.freeLevelMetadata]',

  // Utils
  UTILS_PREPARE_POLYGON_TX = '[Utils.preparePolygonTransaction]',
}

export enum ErrorMessage {
  invalid_auth_instance = 'Invalid Auth instance.',
  invalid_api_version = 'Invalid Api version.',
  no_pk_or_provider = 'PrivateKey or provider missing!',
  no_parameters_supplied = 'No parameters supplied.',
  no_template_type_supplied = 'No template type supplied.',
  no_tokenId_supplied = 'No tokenId supplied or tokenID is invalid.',
  no_tokenURI_supplied = 'No tokenURI supplied.',
  no_projectId_supplied = 'No project id supplied.',
  no_secretId_supplied = 'No secret id supplied.',
  no_chainId_supplied = 'No chain id supplied.',
  no_signer_instance_supplied = 'No signer instance supplied.',
  no_name_supplied = 'No name supplied.',
  no_symbol_supplied = 'No symbol supplied.',
  no_contractURI_supplied = 'No contractURI supplied.',
  no_baseURI_supplied = 'No baseURI supplied.',
  no_address_supplied = 'No address supplied.',
  no_sell_price_supplied_or_not_valid = 'No sell price supplied or not valid.',
  no_to_address = 'No "to" address supplied',
  no_rpcURL = 'No rpcURL supplied',
  no_privateKey = 'No privateKey supplied',
  no_provider = 'No provider supplied',
  no_base_url = 'No baseURL supplied',
  no_api_key = 'No API Key supplied',

  invalid_contract_address = 'Invalid contract address.',
  invalid_account_address = 'Invalid account address.',
  invalid_public_address = 'Invalid public address.',
  invalid_from_address = 'Invalid "from" address.',
  invalid_to_address = 'Invalid "to" address.',
  invalid_contractURI = 'Invalid contractURI.',
  invalid_baseURI = 'Invalid baseURI.',
  invalid_template = 'Invalid template.',
  invalid_transaction_hash = 'Invalid transaction hash.',
  invalid_provider = 'Invalid provider.',
  invalid_gas_price_supplied = 'Invalid value for gas provided',
  invalid_max_supply = 'Invalid maximum supply.',
  invalid_max_token_request = 'Invalid maximum token request.',
  invalid_price = 'Invalid price',
  invalid_mint_quantity = 'Quantity as integer value greater than 0 required.',
  different_array_lengths = 'IDs and quantities arrays must be of same length',
  invalid_quantity = 'Quantity as integer value greater than 0 required.',
  invalid_block = 'Invalid block number',
  invalid_token_address = 'Invalid token address',
  invalid_search_string = 'Invalid search query.',

  warning_contractURI = 'WARNING: The supplied ContractURI is not a link.',
  warning_contractURI_tips = 'WARNING: ContractURI should be a public link to a valid JSON metadata file',
  warning_tokenURI = 'WARNING: The supplied TokenURI is not a link.',
  warning_tokenURI_tips = 'WARNING: TokenURI should be a public link to a valid JSON metadata file',

  warning_baseURI = 'WARNING: The supplied BaseURI is not a link.',
  warning_baseURI_tips = 'WARNING: BaseURI should be a public link to a valid JSON metadata file',

  contract_already_deployed = 'Contract already deployed.',
  contract_already_loaded = 'Contract already loaded.',
  contract_not_deployed = 'Contract not deployed.',
  contract_not_deployed_or_loaded = 'Contract not deployed or loaded.',
  contract_uri_not_defined = 'ContractURI is not defined.',

  fee_must_be_between_0_and_10000 = 'Fee must be between 0 and 10000.',

  tokenId_must_be_integer = 'TokenId must be integer.',
  approvalStatus_must_be_boolean = 'approvalStatus must be boolean.',
  only_privateKey_or_provider_required = 'Only privateKey or provider required',
  chain_not_supported = 'Chain not supported.',
  chain_not_supported_write_operations = 'Chain not supported for WRITE operations yet.',
  axios_error = 'An Axios error occured',
  ethers_error = 'An Ethers error occured',

  no_infura_projectID_supplied = 'No projectId supplied.',
  no_infura_projectSecret_supplied = 'No projectSecret supplied.',

  unexisting_file = 'The file does not exists',
  an_error_occured_with_ipfs_api = 'An error occured with infura ipfs api',
  array_should_not_be_empty = 'The Array can not be empty',
  invalid_ipfs_setup = 'invalid ipfs setup',
  data_must_be_string = 'data must be a string',
  data_must_be_valid_json = 'data must be a valid json',
  invalid_ids = 'List of IDs provided cannot be empty',
  unsupported_provider = 'unsupported provider',
  invalid_block_number = 'Invalid block number.',
  invalid_block_hash = 'Invalid block hash.',
  invalid_block_range = 'fromBlock must be less than or equal to toBlock',
  block_range_too_large = 'Block range must be less than or equal to 1,000,000 blocks',
}

export class Logger {
  version: string;

  static code = ErrorCode;

  static location = ErrorLocation;

  static message = ErrorMessage;

  constructor(_version: string) {
    Object.defineProperties(this, {
      version: {
        enumerable: true,
        value: _version,
        writable: false,
      },
    });
  }

  makeError(message: string, code?: ErrorCode, params?: any): string {
    const optCode = !code ? Logger.code.RUNTIME : code;
    const optParams = !params ? {} : params;
    const messageDetails: Array<string> = [];

    Object.keys(optParams).forEach(key => {
      const value = optParams[key];
      try {
        messageDetails.push(`${key}=${JSON.stringify(value)}`);
      } catch (error) {
        messageDetails.push(`${key}=${JSON.stringify(optParams[key].toString())}`);
      }
    });
    messageDetails.push(`code=${optCode}`);
    messageDetails.push(`version=${this.version}`);

    let errorMsg = message;

    if (messageDetails.length) {
      errorMsg += ` (${messageDetails.join(', ')})`;
    }
    return errorMsg;
  }

  throwError(message: string, code?: ErrorCode, params?: any): never {
    throw Error(this.makeError(message, code, params));
  }

  throwArgumentError(message: string, name: string, value: any, ...params: any): never {
    const addedParams = params;
    addedParams[0].argument = name;
    addedParams[0].value = value;
    return this.throwError(message, Logger.code.INVALID_ARGUMENT, ...addedParams);
  }

  throwMissingArgumentError(message?: string, ...params: any): void {
    return this.throwError(`missing argument: ${message}`, Logger.code.MISSING_ARGUMENT, ...params);
  }

  throwTooManyArgumentError(message?: string, ...params: any): void {
    return this.throwError(
      `too many arguments: ${message}`,
      Logger.code.UNEXPECTED_ARGUMENT,
      ...params,
    );
  }
}

export const log = new Logger(version);
