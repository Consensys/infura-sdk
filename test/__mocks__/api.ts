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

export const lowestTradePriceMock = {
  data: {
    transactionHash: '0x4cd5a150a0332cdd3525b9bdc387af000866957fead36a8dc242b9d2f683d04a',
    blockTimestamp: '2023-01-21T01:15:11.000Z',
    blockHash: '0x9542de2282024ed349c21ff23839921a26b04a6efdf98e2ba870c4fd9871cce0',
    blockNumber: '16451830',
    tokenIds: ['655'],
    sellerAddress: '0xb3dbf4147183492a7bc544e8abed20ad6831fecb',
    buyerAddress: '0xcd9ab8f11df0a72b65c7adcfbc61b79aab9fe4c6',
    tokenAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    marketplaceAddress: '0x00000000006c3852cbef3e08e8df289169ede581',
    price: '66290000000000000000',
  },
};

export const transferByBlockHashNumberMock = {
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

export const ownersByContractAddress = {
  data: {
    total: 29,
    pageNumber: 0,
    pageSize: 100,
    network: 'ETHEREUM',
    cursor: null,
    owners: [
      {
        tokenAddress: '0x1a92f7381b9f03921564a437210bb9396471050c',
        tokenId: '590',
        amount: '1',
        ownerOf: '0x42436ffd4fecf3cbc1c306b40a1813897729ce07',
        tokenHash: '4c41e33826b190dae1f81b9bf183056a',
        blockNumberMinted: '12743348',
        blockNumber: '16450813',
        contractType: 'ERC721',
        name: 'Cool Cats',
        symbol: 'COOL',
        metadata:
          '{"description":"Cool Cats is a collection of 9,999 randomly generated and stylistically curated NFTs that exist on the Ethereum Blockchain. Cool Cat holders can participate in exclusive events such as NFT claims, raffles, community giveaways, and more. Remember, all cats are cool, but some are cooler than others. Visit [www.coolcatsnft.com](https://www.coolcatsnft.com/) to learn more.","image":"https://ipfs.io/ipfs/Qmdr9BVAQHKrUWwXsuDKscheDJKNt3rvRcQiQnvTzfwbZr","name":"Cool Cat #590","attributes":[{"trait_type":"body","value":"blue cat skin"},{"trait_type":"hats","value":"visor green"},{"trait_type":"shirt","value":"tanktop white"},{"trait_type":"face","value":"glossy"},{"trait_type":"tier","value":"wild_1"}],"points":{"Body":0,"Shirt":1,"Hats":3,"Face":1},"ipfs_image":"https://ipfs.io/ipfs/Qmdr9BVAQHKrUWwXsuDKscheDJKNt3rvRcQiQnvTzfwbZr","google_image":"https://drive.google.com/uc?id=1JvY5SXPxhXo8jYqmA9mA29t-bZSQegrp"}',
        minterAddress: '0x3fa9db8d720679e8e5213f6c5d88fab766058e20',
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
