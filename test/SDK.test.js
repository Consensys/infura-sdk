import { config as loadEnv } from 'dotenv';
import SDK from '../lib/NFT/SDK';
import Auth from '../lib/Auth';
import { HttpService } from '../services/httpService';
import {
  accountNFTsMock,
  collectionNFTsMock,
  contractMetadataMock,
  erc20BalanceMock,
  ethBalanceMock,
  tokenMetadataMock,
} from './__mocks__/api';
import { ACCOUNT_ADDRESS, CONTRACT_ADDRESS } from './__mocks__/utils';

loadEnv();

describe('SDK', () => {
  jest.setTimeout(120 * 1000);

  let sdk;
  beforeAll(() => {
    const account = new Auth({
      privateKey: 'privateKey',
      projectId: process.env.PROJECT_ID,
      secretId: process.env.SECRET_ID,
      rpcUrl: process.env.RPC_URL,
      chainId: 4,
    });
    sdk = new SDK(account);
  });

  it('should throw when args are missing auth instance', () => {
    expect(() => new SDK(1)).toThrow(
      '[SDK.constructor] You need to pass a valid instance of Auth class!',
    );
  });

  describe('getContractMetadata', () => {
    it('should throw when args are missing (contractAddress)', async () => {
      await expect(() => sdk.getContractMetadata()).rejects.toThrow(
        '[SDK.getContractMetadata] You need to pass the contract address as parameter',
      );
    });

    it('should return contract metadata', async () => {
      jest.spyOn(HttpService.prototype, 'get').mockResolvedValueOnce(contractMetadataMock);
      const contractMetadata = await sdk.getContractMetadata(
        '0xE26a682fa90322eC48eB9F3FA66E8961D799177C',
      );
      expect(contractMetadata).toStrictEqual({
        name: 'testName',
        symbol: 'SYMB',
        tokenType: 'ERC-721',
      });
    });
  });

  describe('getNFTs', () => {
    it('should throw when args are missing (address)', async () => {
      await expect(() => sdk.getNFTs()).rejects.toThrow(
        '[SDK.getNFTs] You need to pass the account address as parameter',
      );
    });

    it('should return the list of NFTs without metadata', async () => {
      jest.spyOn(HttpService.prototype, 'get').mockResolvedValueOnce(accountNFTsMock);
      const accountNFTs = await sdk.getNFTs(CONTRACT_ADDRESS);
      expect(accountNFTs).toStrictEqual({
        pageNumber: 1,
        network: 'ETHEREUM',
        total: 1,
        account: ACCOUNT_ADDRESS,
        type: 'NFT',
        assets: [
          {
            contract: `ETHEREUM:${CONTRACT_ADDRESS}`,
            tokenId: '3545',
            supply: '1',
            type: 'ERC721',
          },
        ],
      });
    });

    it('should return the list of NFTs with metadata', async () => {
      jest.spyOn(HttpService.prototype, 'get').mockResolvedValueOnce(accountNFTsMock);
      const accountNFTs = await sdk.getNFTs(CONTRACT_ADDRESS, true);
      expect(accountNFTs).toStrictEqual({
        pageNumber: 1,
        network: 'ETHEREUM',
        total: 1,
        account: ACCOUNT_ADDRESS,
        type: 'NFT',
        assets: [
          {
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
          },
        ],
      });
    });
  });

  describe('getNFTsForCollection', () => {
    it('should throw when args are missing (contractAddress)', async () => {
      await expect(() => sdk.getNFTsForCollection()).rejects.toThrow(
        '[SDK.getNFTsForCollection] You need to pass the contract address as parameter',
      );
    });

    it('should return return collection NFTs list', async () => {
      jest.spyOn(HttpService.prototype, 'get').mockResolvedValueOnce(collectionNFTsMock);
      const collectionNFTs = await sdk.getNFTsForCollection(CONTRACT_ADDRESS);
      expect(collectionNFTs).toStrictEqual({
        pageNumber: 1,
        network: 'ETHEREUM',
        total: 1,
        account: ACCOUNT_ADDRESS,
        type: 'NFT',
        assets: [
          {
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
          },
        ],
      });
    });
  });

  describe('getTokenMetadata', () => {
    it('should throw when args are missing (contractAddress)', async () => {
      await expect(() => sdk.getTokenMetadata()).rejects.toThrow(
        '[SDK.getTokenMetadata] You need to pass the contract address as first parameter',
      );
    });

    it('should throw when args are missing (tokenId)', async () => {
      await expect(() =>
        sdk.getTokenMetadata('0x97ed63533c9f4f50521d78e58caeb94b175f5d35'),
      ).rejects.toThrow('[SDK.getTokenMetadata] You need to pass the tokenId as second parameter');
    });

    it('should return token metadata', async () => {
      jest.spyOn(HttpService.prototype, 'get').mockResolvedValueOnce(tokenMetadataMock);
      const tokenMetadata = await sdk.getTokenMetadata(CONTRACT_ADDRESS, 1);
      expect(tokenMetadata).toStrictEqual({
        contract: CONTRACT_ADDRESS,
        tokenId: 1,
        name: 'Washington #7421',
        description: 'WeMint Cash First Edition: Washington #7421',
        image: 'https://ipfs.io/ipfs/Qmdibwx2MmendzExWgsGsyiGodMJ8hvAkLHcAVbMbpK2rG/7421.png',
      });
    });
  });

  describe('getEthBalance', () => {
    it('should throw when args are missing (address)', async () => {
      await expect(() => sdk.getEthBalance()).rejects.toThrow(
        '[SDK.getEthBalance] You need to pass the account address as parameter',
      );
    });

    it('should return token metadata', async () => {
      jest.spyOn(HttpService.prototype, 'get').mockResolvedValueOnce(ethBalanceMock);
      const accountBalance = await sdk.getEthBalance(ACCOUNT_ADDRESS, 1);
      expect(accountBalance).toStrictEqual(10);
    });
  });

  describe('getERC20Balance', () => {
    it('should throw when args are missing (address)', async () => {
      await expect(() => sdk.getERC20Balance()).rejects.toThrow(
        '[SDK.getERC20Balance] You need to pass the account address as parameter',
      );
    });

    it('should return token metadata', async () => {
      jest.spyOn(HttpService.prototype, 'get').mockResolvedValueOnce(erc20BalanceMock);
      const erc20Balance = await sdk.getERC20Balance(ACCOUNT_ADDRESS, 1);
      expect(erc20Balance).toStrictEqual({
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
      });
    });
  });
});
