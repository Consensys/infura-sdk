import { config as loadEnv } from 'dotenv';

loadEnv();

export const NFT_API_URL = process.env.NFT_API_URL
  ? process.env.NFT_API_URL
  : 'https://nft.api.infura.io';
export const TEMPLATES = {
  ERC721Mintable: 'ERC721Mintable',
  ERC721UserMintable: 'ERC721UserMintable',
  ERC1155Mintable: 'ERC1155Mintable',
};
export const GAS_LIMIT = 6000000;
export const DEFAULT_ADMIN_ROLE =
  '0x0000000000000000000000000000000000000000000000000000000000000000';
export const DEFAULT_MINTER_ROLE =
  '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6';
