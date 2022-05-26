import { config as loadEnv } from 'dotenv';
import Sdk from '../lib/SDK/sdk';
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

describe('Sdk', () => {
  jest.setTimeout(120 * 1000);
  const HttpServiceMock = jest
    .spyOn(HttpService.prototype, 'get')
    .mockImplementation(() => jest.fn());
  let sdk;
  beforeAll(() => {
    const account = new Auth({
      privateKey: 'privateKey',
      projectId: process.env.INFURA_PROJECT_ID,
      secretId: process.env.INFURA_PROJECT_SECRET,
      rpcUrl: process.env.EVM_RPC_URL,
      chainId: 5,
    });
    sdk = new Sdk(account);
  });

  afterEach(() => {
    HttpServiceMock.mockClear();
  });

  it('should throw when args are missing auth instance', () => {
    expect(() => new Sdk(1)).toThrow(
      '[SDK.constructor] You need to pass a valid instance of Auth class!',
    );
  });

  describe('getContractMetadata', () => {
    it('should throw when args are missing (contractAddress)', async () => {
      await expect(() => sdk.getContractMetadata({})).rejects.toThrow(
        '[SDK.getContractMetadata] You need to pass a valid contract address as parameter',
      );
    });

    it('should throw when "contractAddress" is not a valid address', async () => {
      await expect(() =>
        sdk.getContractMetadata({ contractAddress: 'notAValidAddress' }),
      ).rejects.toThrow(
        '[SDK.getContractMetadata] You need to pass a valid contract address as parameter',
      );
    });

    it('should return contract metadata', async () => {
      HttpServiceMock.mockResolvedValueOnce(contractMetadataMock);
      const contractMetadata = await sdk.getContractMetadata({
        contractAddress: '0xE26a682fa90322eC48eB9F3FA66E8961D799177C',
      });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
      expect(contractMetadata).not.toHaveProperty('contract');
    });
  });

  describe('getNFTs', () => {
    it('should throw when args are missing (address)', async () => {
      await expect(() => sdk.getNFTs({})).rejects.toThrow(
        '[SDK.getNFTs] You need to pass a valid account address as parameter',
      );
    });

    it('should throw when "address" is not a valid address', async () => {
      await expect(() => sdk.getNFTs({ publicAddress: 'notAValidAddress' })).rejects.toThrow(
        '[SDK.getNFTs] You need to pass a valid account address as parameter',
      );
    });

    it('should return the list of NFTs without metadata', async () => {
      HttpServiceMock.mockResolvedValueOnce(accountNFTsMock);
      const accountNFTs = await sdk.getNFTs({ publicAddress: CONTRACT_ADDRESS });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
      expect(accountNFTs.assets[0]).not.toHaveProperty('metadata');
    });

    it('should return the list of NFTs with metadata', async () => {
      HttpServiceMock.mockResolvedValueOnce(accountNFTsMock);
      const accountNFTs = await sdk.getNFTs({
        publicAddress: CONTRACT_ADDRESS,
        includeMetadata: true,
      });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
      expect(accountNFTs.assets[0]).toHaveProperty('metadata');
    });
  });

  describe('getNFTsForCollection', () => {
    it('should throw when args are missing (contractAddress)', async () => {
      await expect(() => sdk.getNFTsForCollection({})).rejects.toThrow(
        '[SDK.getNFTsForCollection] You need to pass a valid contract address as parameter',
      );
    });

    it('should throw when "contractAddress" is not a valid address', async () => {
      await expect(() =>
        sdk.getNFTsForCollection({ contractAddress: 'notAValidAddress' }),
      ).rejects.toThrow(
        '[SDK.getNFTsForCollection] You need to pass a valid contract address as parameter',
      );
    });

    it('should return return collection NFTs list', async () => {
      HttpServiceMock.mockResolvedValueOnce(collectionNFTsMock);
      await sdk.getNFTsForCollection({ contractAddress: CONTRACT_ADDRESS });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTokenMetadata', () => {
    it('should throw when args are missing (contractAddress)', async () => {
      await expect(() => sdk.getTokenMetadata({})).rejects.toThrow(
        '[SDK.getTokenMetadata] You need to pass a valid contract address as first parameter',
      );
    });

    it('should throw when "contractAddress" is not a valid address', async () => {
      await expect(() =>
        sdk.getTokenMetadata({ contractAddress: 'notAValidAddress', tokenId: '' }),
      ).rejects.toThrow(
        '[SDK.getTokenMetadata] You need to pass a valid contract address as first parameter',
      );
    });

    it('should throw when args are missing (tokenId)', async () => {
      await expect(() =>
        sdk.getTokenMetadata({
          contractAddress: '0x97ed63533c9f4f50521d78e58caeb94b175f5d35',
          tokenId: '',
        }),
      ).rejects.toThrow('[SDK.getTokenMetadata] You need to pass the tokenId as second parameter');
    });

    it('should return token metadata', async () => {
      HttpServiceMock.mockResolvedValueOnce(tokenMetadataMock);
      await sdk.getTokenMetadata({ contractAddress: CONTRACT_ADDRESS, tokenId: 1 });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getEthBalance', () => {
    it('should throw when args are missing (address)', async () => {
      await expect(() => sdk.getEthBalance({})).rejects.toThrow(
        '[SDK.getEthBalance] You need to pass a valid account address as parameter',
      );
    });

    it('should throw when "address" is not a valid address', async () => {
      await expect(() => sdk.getEthBalance({ publicAddress: 'notAValidAddress' })).rejects.toThrow(
        '[SDK.getEthBalance] You need to pass a valid account address as parameter',
      );
    });

    it('should return ETH balance', async () => {
      HttpServiceMock.mockResolvedValueOnce(ethBalanceMock);
      const accountBalance = await sdk.getEthBalance({ publicAddress: ACCOUNT_ADDRESS });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
      expect(accountBalance).toStrictEqual(10);
    });
  });

  describe('getERC20Balances', () => {
    it('should throw when args are missing (address)', async () => {
      await expect(() => sdk.getERC20Balances({})).rejects.toThrow(
        '[SDK.getERC20Balances] You need to pass a valid account address as parameter',
      );
    });

    it('should throw when "address" is not a valid address', async () => {
      await expect(() =>
        sdk.getERC20Balances({ publicAddress: 'notAValidAddress' }),
      ).rejects.toThrow(
        '[SDK.getERC20Balances] You need to pass a valid account address as parameter',
      );
    });

    it('should return ERC20 balances', async () => {
      HttpServiceMock.mockResolvedValueOnce(erc20BalanceMock);
      await sdk.getERC20Balances({ publicAddress: ACCOUNT_ADDRESS });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRoyalties', () => {
    it('should throw when args are missing (template)', async () => {
      const params = {
        contractAddress: '0xF69c1883b098d621FC58a42E673C4bF6a6483fFf',
        tokenId: '1',
        sellPrice: '123',
      };
      await expect(() => sdk.getRoyalties(params)).rejects.toThrow(
        '[SDK.getRoyalties] Please choose the template',
      );
    });
    it('should throw when args are missing (contract address)', async () => {
      const params = { template: 'ERC721Mintable', tokenId: '1', sellPrice: '123' };
      await expect(() => sdk.getRoyalties(params)).rejects.toThrow(
        '[SDK.getRoyalties] Please use valid Contract address',
      );
    });
    it('should throw when args are missing (tokenId)', async () => {
      const params = {
        template: 'ERC721Mintable',
        contractAddress: '0xF69c1883b098d621FC58a42E673C4bF6a6483fFf',
        sellPrice: '123',
      };
      await expect(() => sdk.getRoyalties(params)).rejects.toThrow(
        '[SDK.getRoyalties] Please add tokenId',
      );
    });
    it('should throw when args are missing (sellPrice)', async () => {
      const params = {
        template: 'ERC721Mintable',
        contractAddress: '0xF69c1883b098d621FC58a42E673C4bF6a6483fFf',
        tokenId: '1',
      };
      await expect(() => sdk.getRoyalties(params)).rejects.toThrow(
        '[SDK.getRoyalties] Please add sellPrice',
      );
    });
  });

  describe('setRoyalties', () => {
    it('should throw when args are missing (address)', async () => {
      await expect(() => sdk.setRoyalties()).rejects.toThrow(
        '[SDK.setRoyalties] Address is required',
      );
    });
    it('should throw when args are missing (fee)', async () => {
      await expect(() => sdk.setRoyalties(ACCOUNT_ADDRESS)).rejects.toThrow(
        '[SDK.setRoyalties] Fee as numeric value between 0 and 10000 is required',
      );
    });
    it('should throw when "address" is not a valid address', async () => {
      await expect(() => sdk.setRoyalties('address', 1)).rejects.toThrow(
        '[SDK.setRoyalties] Address is required',
      );
    });
    it('should throw when "fee" is not a number', async () => {
      await expect(() => sdk.setRoyalties(ACCOUNT_ADDRESS, 'number')).rejects.toThrow(
        '[SDK.setRoyalties] Fee as numeric value between 0 and 10000 is required',
      );
    });
    it('should throw when "fee" is not a number larger than 0 and less than 10000', async () => {
      await expect(() => sdk.setRoyalties(ACCOUNT_ADDRESS, 0)).rejects.toThrow(
        '[SDK.setRoyalties] Fee as numeric value between 0 and 10000 is required',
      );
    });
    it('should throw if contract not deployed', async () => {
      await expect(() => sdk.setRoyalties(ACCOUNT_ADDRESS, 0)).rejects.toThrow(
        '[SDK.setRoyalties] Fee as numeric value between 0 and 10000 is required',
      );
    });
    it('should return bool result', async () => {
      const result = await sdk.setRoyalties(ACCOUNT_ADDRESS, 100);
      expect(typeof result === 'boolean').toBeTruthy();
    });
  });
});
