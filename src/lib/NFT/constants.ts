const NFT_API_URL = process.env.NFT_API_URL ? process.env.NFT_API_URL : 'https://nft.api.infura.io';
export { NFT_API_URL };

export enum TEMPLATES {
  ERC721Mintable = 'ERC721Mintable',
  ERC721UserMintable = 'ERC721UserMintable',
  ERC1155Mintable = 'ERC1155Mintable',
}
