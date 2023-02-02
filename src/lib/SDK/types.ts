import { Components } from '../../services/nft-api';
import { DeployParams as MintableDeploy } from '../ContractTemplates/ERC721Mintable';
import { DeployParams as UserMintableDeploy } from '../ContractTemplates/ERC721UserMintable';
import { DeployERC1155Params } from '../ContractTemplates/ERC1155Mintable';

export type NftDTO = Components['schemas']['NftModel'];
export type MetadataDTO = Components['schemas']['MetadataModel'];
export type TransfersDTO = Components['schemas']['TransfersModel'];
export type OwnersDTO = Components['schemas']['OwnersModel'];
export type TradeDTO = Components['schemas']['TradePriceModel'];
export type CollectionsDTO = Components['schemas']['CollectionByWalletModel'];
export type SearchNftDTO = Components['schemas']['SearchNftModel'];

export type MetadataInfo = {
  symbol: string;
  name: string;
  tokenType: string;
};

// TODO: fix type & function overloading in "deploy"
export type DeployOptionsMintable = {
  template: string;
  params: MintableDeploy;
};
export type DeployOptionsUserMintable = {
  template: string;
  params: UserMintableDeploy;
};

export type DeployOptionsERC1155UserMintable = {
  template: string;
  params: DeployERC1155Params;
};

export type LoadContractOptions = {
  template: string;
  contractAddress: string;
};

export type GetStatusOptions = {
  txHash: string;
};
