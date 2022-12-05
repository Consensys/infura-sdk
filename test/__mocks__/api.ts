import { ACCOUNT_ADDRESS, CONTRACT_ADDRESS } from './utils';

export const contractMetadataMock = {
  data: {
    contract: ACCOUNT_ADDRESS,
    name: 'testName',
    symbol: 'SYMB',
    tokenType: 'ERC-721',
  },
};

const assetMock = {
  contract: `ETHEREUM:${CONTRACT_ADDRESS}`,
  tokenId: '3545',
  supply: '1',
  type: 'ERC721',
  metadata: {
    name: 'the ape fren #3545',
    description:
      'The ape frens is a community driven collection of 7777 NFTs crashed from a multiverse on the ethereum blockchain ',
    attributes: [],
    content: [
      {
        '@type': 'IMAGE',
        url: 'https://rarible.mypinata.cloud/ipfs/QmWBnV33pNZZKrrxk1mrokuCeE666vnr8umZe9vBEqWpJX/3545.png',
        representation: 'ORIGINAL',
        mimeType: 'image/png',
        width: 2048,
        height: 2048,
      },
    ],
    restrictions: [],
  },
};

export const accountNFTsMock = {
  data: {
    pageNumber: 1,
    network: 'ETHEREUM',
    total: 1,
    account: ACCOUNT_ADDRESS,
    type: 'NFT',
    assets: [assetMock],
  },
};

export const collectionNFTsMock = {
  data: {
    pageNumber: 1,
    network: 'ETHEREUM',
    total: 1,
    account: ACCOUNT_ADDRESS,
    type: 'NFT',
    assets: [assetMock],
  },
};

export const tokenMetadataMock = {
  data: {
    contract: CONTRACT_ADDRESS,
    tokenId: 1,
    name: 'Washington #7421',
    description: 'WeMint Cash First Edition: Washington #7421',
    image: 'https://ipfs.io/ipfs/Qmdibwx2MmendzExWgsGsyiGodMJ8hvAkLHcAVbMbpK2rG/7421.png',
  },
};

export const ethBalanceMock = {
  data: {
    account: ACCOUNT_ADDRESS,
    type: 'eth',
    name: 'Ethereum',
    balance: 10,
  },
};

export const erc20BalanceMock = {
  data: {
    network: 'Ethereum',
    account: ACCOUNT_ADDRESS,
    type: 'ERC20',
    assets: {
      assets: [
        {
          contract: '0x0000',
          symbol: 'ETH',
          name: 'Ethereum',
          balance: 100,
          rawBalance: '100',
          decimals: 18,
        },
      ],
    },
  },
};
