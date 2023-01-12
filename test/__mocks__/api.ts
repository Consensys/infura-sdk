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
    cursor: 'cursorTest',
  },
};

export const accountNFTsMockWithoutCursor = {
  data: {
    pageNumber: 2,
    network: 'ETHEREUM',
    total: 1,
    account: ACCOUNT_ADDRESS,
    type: 'NFT',
    assets: [assetMock],
    cursor: null,
  },
};

export const collectionNFTsMock = {
  data: {
    pageNumber: 1,
    network: 'ETHEREUM',
    total: 1,
    account: ACCOUNT_ADDRESS,
    type: 'NFT',
    cursor: 'test',
    assets: [assetMock],
  },
};

export const collectionNFTsMockWithoutCursor = {
  data: {
    pageNumber: 1,
    network: 'ETHEREUM',
    total: 1,
    account: ACCOUNT_ADDRESS,
    type: 'NFT',
    cursor: null,
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

export const transferByBlockNumberMock = {
  data: {
    total: 29,
    pageNumber: 0,
    pageSize: 100,
    network: 'ETHEREUM',
    cursor: null,
    transfers: [
      {
        tokenAddress: '0x7afeda4c714e1c0a2a1248332c100924506ac8e6',
        tokenId: '348',
        fromAddress: '0xb2b0f003fa9d0f95c9ae5e4689206d349cb15347',
        toAddress: '0x135236008b5a5b0099e0c2a46882785b619e5dec',
        contractType: 'ERC721',
        price: '0',
        quantity: '1',
        blockNumber: '15846572',
        blockTimestamp: '2022-10-28T12:30:59.000Z',
        blockHash: '0x759d8cb3930463fc0a0b6d6e30b284a1466cb7c590c21767f08a37e34fd583b1',
        transactionHash: '0x07ad919a19c1d24533639c91ae5b5e99979b7f40858d94bcd91605b218874f06',
        transactionType: 'Single',
      },
    ],
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
