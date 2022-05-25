import { config as loadEnv } from 'dotenv';
import SDK from '../lib/SDK/SDK';
import Auth from '../lib/Auth/Auth';
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
  const HttpServiceMock = jest
    .spyOn(HttpService.prototype, 'get')
    .mockImplementation(() => jest.fn());
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

  afterEach(() => {
    HttpServiceMock.mockClear();
  });

  it('should throw when args are missing auth instance', () => {
    expect(() => new SDK(1)).toThrow(
      '[SDK.constructor] You need to pass a valid instance of Auth class!',
    );
  });

  describe('getContractMetadata', () => {
    it('should throw when args are missing (contractAddress)', async () => {
      await expect(() => sdk.getContractMetadata()).rejects.toThrow(
        '[SDK.getContractMetadata] You need to pass a valid contract address as parameter',
      );
    });

    it('should throw when "contractAddress" is not a valid address', async () => {
      await expect(() => sdk.getContractMetadata('notAValidAddress')).rejects.toThrow(
        '[SDK.getContractMetadata] You need to pass a valid contract address as parameter',
      );
    });

    it('should return contract metadata', async () => {
      HttpServiceMock.mockResolvedValueOnce(contractMetadataMock);
      const contractMetadata = await sdk.getContractMetadata(
        '0xE26a682fa90322eC48eB9F3FA66E8961D799177C',
      );
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
      expect(contractMetadata).not.toHaveProperty('contract');
    });
  });

  describe('getNFTs', () => {
    it('should throw when args are missing (address)', async () => {
      await expect(() => sdk.getNFTs()).rejects.toThrow(
        '[SDK.getNFTs] You need to pass a valid account address as parameter',
      );
    });

    it('should throw when "address" is not a valid address', async () => {
      await expect(() => sdk.getNFTs('notAValidAddress')).rejects.toThrow(
        '[SDK.getNFTs] You need to pass a valid account address as parameter',
      );
    });

    it('should return the list of NFTs without metadata', async () => {
      HttpServiceMock.mockResolvedValueOnce(accountNFTsMock);
      const accountNFTs = await sdk.getNFTs(CONTRACT_ADDRESS);
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
      expect(accountNFTs.assets[0]).not.toHaveProperty('metadata');
    });

    it('should return the list of NFTs with metadata', async () => {
      HttpServiceMock.mockResolvedValueOnce(accountNFTsMock);
      const accountNFTs = await sdk.getNFTs(CONTRACT_ADDRESS, true);
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
      expect(accountNFTs.assets[0]).toHaveProperty('metadata');
    });
  });

  describe('getNFTsForCollection', () => {
    it('should throw when args are missing (contractAddress)', async () => {
      await expect(() => sdk.getNFTsForCollection()).rejects.toThrow(
        '[SDK.getNFTsForCollection] You need to pass a valid contract address as parameter',
      );
    });

    it('should throw when "contractAddress" is not a valid address', async () => {
      await expect(() => sdk.getNFTsForCollection('notAValidAddress')).rejects.toThrow(
        '[SDK.getNFTsForCollection] You need to pass a valid contract address as parameter',
      );
    });

    it('should return return collection NFTs list', async () => {
      HttpServiceMock.mockResolvedValueOnce(collectionNFTsMock);
      await sdk.getNFTsForCollection(CONTRACT_ADDRESS);
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTokenMetadata', () => {
    it('should throw when args are missing (contractAddress)', async () => {
      await expect(() => sdk.getTokenMetadata()).rejects.toThrow(
        '[SDK.getTokenMetadata] You need to pass a valid contract address as first parameter',
      );
    });

    it('should throw when "contractAddress" is not a valid address', async () => {
      await expect(() => sdk.getTokenMetadata('notAValidAddress')).rejects.toThrow(
        '[SDK.getTokenMetadata] You need to pass a valid contract address as first parameter',
      );
    });

    it('should throw when args are missing (tokenId)', async () => {
      await expect(() =>
        sdk.getTokenMetadata('0x97ed63533c9f4f50521d78e58caeb94b175f5d35'),
      ).rejects.toThrow('[SDK.getTokenMetadata] You need to pass the tokenId as second parameter');
    });

    it('should return token metadata', async () => {
      HttpServiceMock.mockResolvedValueOnce(tokenMetadataMock);
      await sdk.getTokenMetadata(CONTRACT_ADDRESS, 1);
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getEthBalance', () => {
    it('should throw when args are missing (address)', async () => {
      await expect(() => sdk.getEthBalance()).rejects.toThrow(
        '[SDK.getEthBalance] You need to pass a valid account address as parameter',
      );
    });

    it('should throw when "address" is not a valid address', async () => {
      await expect(() => sdk.getEthBalance('notAValidAddress')).rejects.toThrow(
        '[SDK.getEthBalance] You need to pass a valid account address as parameter',
      );
    });

    it('should return ETH balance', async () => {
      HttpServiceMock.mockResolvedValueOnce(ethBalanceMock);
      const accountBalance = await sdk.getEthBalance(ACCOUNT_ADDRESS, 1);
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
      expect(accountBalance).toStrictEqual(10);
    });
  });

  describe('getERC20Balances', () => {
    it('should throw when args are missing (address)', async () => {
      await expect(() => sdk.getERC20Balances()).rejects.toThrow(
        '[SDK.getERC20Balances] You need to pass a valid account address as parameter',
      );
    });

    it('should throw when "address" is not a valid address', async () => {
      await expect(() => sdk.getERC20Balances('notAValidAddress')).rejects.toThrow(
        '[SDK.getERC20Balances] You need to pass a valid account address as parameter',
      );
    });

    it('should return ERC20 balances', async () => {
      HttpServiceMock.mockResolvedValueOnce(erc20BalanceMock);
      await sdk.getERC20Balances(ACCOUNT_ADDRESS, 1);
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });
  });
});
