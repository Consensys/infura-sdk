import { config as loadEnv } from 'dotenv';
import { AxiosResponse } from 'axios';
import { ethers } from 'ethers';
import { faker } from '@faker-js/faker';

import Auth from '../src/lib/Auth/Auth';
import HttpService from '../src/services/httpService';
import version from '../src/_version';

import {
  accountNFTsMock,
  accountNFTsMockWithoutCursor,
  collectionNFTsMock,
  collectionNFTsMockWithoutCursor,
  collectionsByWalletMock,
  contractMetadataMock,
  lowestTradePriceMock,
  ownersByContractAddress,
  searchNfts,
  tokenMetadataMock,
  transferByBlockHashNumberMock,
} from './__mocks__/api';
import { CONTRACT_ADDRESS, ACCOUNT_ADDRESS, generateTestPrivateKeyOrHash } from './__mocks__/utils';
import { NFT_API_URL } from '../src/lib/constants';
import Api, {
  GetNftTransfersByWallet,
  GetTransfersByBlockHashOptions,
  GetNftTransfersFromBlockToBlock,
  GetTransfersByBlockNumberOptions,
  GetNftTransfersByContractAndToken,
  GetLowestTradePrice,
  GetNftOwnersByContractAddress,
  GetNftOwnersByTokenAddressAndTokenId,
  GetCollectionsByWallet,
  SearchNftsByString,
} from '../src/lib/Api/api';
import { ApiVersion } from '../src/lib/SDK/sdk';

loadEnv();

describe('Api', () => {
  jest.setTimeout(120 * 1000);
  let signerMock: jest.SpyInstance<ethers.Wallet | ethers.providers.JsonRpcSigner, []>;
  jest.mock('ethers');
  const HttpServiceMock = jest
    .spyOn(HttpService.prototype, 'get')
    .mockImplementation(() => jest.fn() as unknown as Promise<AxiosResponse<any, any>>);

  let api: Api;
  beforeAll(() => {
    const account = new Auth({
      privateKey: generateTestPrivateKeyOrHash(),
      projectId: process.env.INFURA_PROJECT_ID,
      secretId: process.env.INFURA_PROJECT_SECRET,
      rpcUrl: process.env.EVM_RPC_URL,
      chainId: 5,
      ipfs: {
        projectId: faker.datatype.uuid(),
        apiKeySecret: faker.datatype.uuid(),
      },
    });

    const apiPath = '/networks/5';
    const httpClient = new HttpService(NFT_API_URL, account.getApiAuth(), ApiVersion.V1);
    api = new Api(apiPath, httpClient, ApiVersion.V1);

    signerMock = jest.spyOn(account, 'getSigner').mockImplementation(
      () =>
        ({
          provider: {
            getTransactionReceipt: () => ({
              status: 1,
            }),
          },
        } as unknown as ethers.providers.JsonRpcSigner),
    );
  });

  afterEach(() => {
    HttpServiceMock.mockClear();
    HttpServiceMock.mockClear();
    signerMock.mockClear();
  });

  describe('getContractMetadata', () => {
    it('should take version 1 when "apiVersion" is not defined', async () => {
      expect(api.getApiVersion()).toEqual('1');
    });
    it('should throw when "contractAddress" is not a valid address', async () => {
      await expect(() =>
        api.getContractMetadata({ contractAddress: 'notAValidAddress' }),
      ).rejects.toThrow(
        `missing argument: Invalid contract address. (location="[SDK.getContractMetadata]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return contract metadata', async () => {
      HttpServiceMock.mockResolvedValueOnce(contractMetadataMock as AxiosResponse<any, any>);
      const contractMetadata = await api.getContractMetadata({
        contractAddress: '0xE26a682fa90322eC48eB9F3FA66E8961D799177C',
      });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
      expect(contractMetadata).not.toHaveProperty('contract');
    });
  });

  describe('getNFTs', () => {
    it('should throw when "address" is not a valid address', async () => {
      await expect(() => api.getNFTs({ publicAddress: 'notAValidAddress' })).rejects.toThrow(
        `missing argument: Invalid public address. (location="[SDK.getNFTs]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return the list of NFTs without metadata', async () => {
      HttpServiceMock.mockResolvedValueOnce(accountNFTsMock as AxiosResponse<any, any>);
      const accountNFTs = await api.getNFTs({ publicAddress: CONTRACT_ADDRESS });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
      expect((accountNFTs as any).assets[0]).not.toHaveProperty('metadata');
    });

    it('should return the list of NFTs with metadata', async () => {
      HttpServiceMock.mockResolvedValueOnce(accountNFTsMock as AxiosResponse<any, any>);
      const accountNFTs = await api.getNFTs({
        publicAddress: CONTRACT_ADDRESS,
        includeMetadata: true,
      });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
      expect((accountNFTs as any).assets[0]).toHaveProperty('metadata');
    });

    it('should return the list of NFTs with metadata and with cursor', async () => {
      HttpServiceMock.mockResolvedValueOnce(
        accountNFTsMockWithoutCursor as AxiosResponse<any, any>,
      );
      const accountNFTs = await api.getNFTs({
        publicAddress: CONTRACT_ADDRESS,
        includeMetadata: true,
        cursor: 'test',
      });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
      expect((accountNFTs as any).assets[0]).toHaveProperty('metadata');
      expect((accountNFTs as any).cursor).toBe(null);
    });
  });

  describe('getNFTsForCollection', () => {
    it('should throw when "contractAddress" is not a valid address', async () => {
      await expect(() =>
        api.getNFTsForCollection({ contractAddress: 'notAValidAddress' }),
      ).rejects.toThrow(
        `missing argument: Invalid contract address. (location="[SDK.getNFTsForCollection]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return return collection NFTs list', async () => {
      HttpServiceMock.mockResolvedValueOnce(collectionNFTsMock as AxiosResponse<any, any>);
      await api.getNFTsForCollection({ contractAddress: CONTRACT_ADDRESS });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });

    it('should return the collection NFT list without cursor', async () => {
      HttpServiceMock.mockResolvedValueOnce(
        collectionNFTsMockWithoutCursor as AxiosResponse<any, any>,
      );
      const nftCollection = await api.getNFTsForCollection({
        contractAddress: CONTRACT_ADDRESS,
        cursor: 'test',
      });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
      expect((nftCollection as any).cursor).toBe(null);
    });
  });

  describe('getTokenMetadata', () => {
    it('should throw when "contractAddress" is not a valid address', async () => {
      await expect(() =>
        api.getTokenMetadata({ contractAddress: 'notAValidAddress', tokenId: '1' }),
      ).rejects.toThrow(
        `missing argument: Invalid contract address. (location="[SDK.getTokenMetadata]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return token metadata', async () => {
      HttpServiceMock.mockResolvedValueOnce(tokenMetadataMock as AxiosResponse<any, any>);
      await api.getTokenMetadata({ contractAddress: CONTRACT_ADDRESS, tokenId: '1' });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTransfersByBlockNumber', () => {
    it('should throw when block number not provided', async () => {
      await expect(() =>
        api.getTransfersByBlockNumber({} as GetTransfersByBlockNumberOptions),
      ).rejects.toThrow(
        `missing argument: Invalid block number. (location="[SDK.getTransfersByBlockNumber]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return transfers', async () => {
      HttpServiceMock.mockResolvedValueOnce(
        transferByBlockHashNumberMock as AxiosResponse<any, any>,
      );
      await api.getTransfersByBlockNumber({ blockNumber: '125' });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTransfersByBlockHash', () => {
    it('hould throw when block hash not provided', async () => {
      await expect(() =>
        api.getTransfersByBlockHash({} as GetTransfersByBlockHashOptions),
      ).rejects.toThrow(
        `missing argument: Invalid block hash. (location="[SDK.getTransfersByBlockHash]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return transfers', async () => {
      HttpServiceMock.mockResolvedValueOnce(
        transferByBlockHashNumberMock as AxiosResponse<any, any>,
      );
      await api.getTransfersByBlockHash({
        blockHash: '0x759d8cb3930463fc0a0b6d6e30b284a1466cb7c590c21767f08a37e34fd583b1',
      });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTransfersFromBLockToBLock', () => {
    it('should throw when block number not provided', async () => {
      await expect(() =>
        api.getTransferFromBlockToBlock({} as GetNftTransfersFromBlockToBlock),
      ).rejects.toThrow(
        `missing argument: Invalid block number (location=\"[SDK.getTransferFromBlockToBlock]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return transfers', async () => {
      HttpServiceMock.mockResolvedValueOnce(
        transferByBlockHashNumberMock as AxiosResponse<any, any>,
      );
      await api.getTransferFromBlockToBlock({ fromBlock: 16026179, toBlock: 16026190 });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTransfersByWallet', () => {
    it('should throw when wallet address is not provided', async () => {
      await expect(() =>
        api.getNftsTransfersByWallet({} as GetNftTransfersByWallet),
      ).rejects.toThrow(
        `missing argument: Invalid account address. (location="[SDK.getNftTransfersByWallet]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });
    it('should throw when "walletAddress" is not a valid address', async () => {
      await expect(() =>
        api.getNftsTransfersByWallet({ walletAddress: 'notAValidAddress' }),
      ).rejects.toThrow(
        `missing argument: Invalid account address. (location="[SDK.getNftTransfersByWallet]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return transfers', async () => {
      HttpServiceMock.mockResolvedValueOnce(
        transferByBlockHashNumberMock as AxiosResponse<any, any>,
      );
      await api.getNftsTransfersByWallet({ walletAddress: CONTRACT_ADDRESS });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });
  });
  describe('getTransfersByTokenId', () => {
    it('should throw when contract address is not provided', async () => {
      await expect(() =>
        api.getTransfersByTokenId({} as GetNftTransfersByContractAndToken),
      ).rejects.toThrow(
        `missing argument: Invalid contract address. (location="[SDK.getTransfersByTokenId]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });
    it('should throw when "contractAddress" is not a valid address', async () => {
      await expect(() =>
        api.getTransfersByTokenId({ contractAddress: 'notAValidAddress', tokenId: '0' }),
      ).rejects.toThrow(
        `missing argument: Invalid contract address. (location="[SDK.getTransfersByTokenId]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });
    it('should throw when "tokenId" is not defined', async () => {
      await expect(() =>
        api.getTransfersByTokenId({ contractAddress: CONTRACT_ADDRESS, tokenId: '' }),
      ).rejects.toThrow(
        `missing argument: No tokenId supplied or tokenID is invalid. (location="[SDK.getTransfersByTokenId]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return transfers', async () => {
      HttpServiceMock.mockResolvedValueOnce(
        transferByBlockHashNumberMock as AxiosResponse<any, any>,
      );
      await api.getTransfersByTokenId({ contractAddress: CONTRACT_ADDRESS, tokenId: '1' });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTransfersByContractAddress', () => {
    it('should throw when contract address is not provided', async () => {
      await expect(() =>
        api.getTransfersByContractAddress({} as GetNftTransfersByContractAndToken),
      ).rejects.toThrow(
        `missing argument: Invalid contract address. (location="[SDK.getTransfersByContractAddress]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });
    it('should throw when "contractAddress" is not a valid address', async () => {
      await expect(() =>
        api.getTransfersByContractAddress({ contractAddress: 'notAValidAddress' }),
      ).rejects.toThrow(
        `missing argument: Invalid contract address. (location="[SDK.getTransfersByContractAddress]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return transfers', async () => {
      HttpServiceMock.mockResolvedValueOnce(
        transferByBlockHashNumberMock as AxiosResponse<any, any>,
      );
      await api.getTransfersByContractAddress({ contractAddress: CONTRACT_ADDRESS });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });
  });
  describe('getLowestTrade', () => {
    it('should throw an error when contract address is not provided', async () => {
      await expect(() => api.getLowestTradePrice({} as GetLowestTradePrice)).rejects.toThrow(
        `missing argument: Invalid token address (location="[SDK.getLowestTradePrice]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });
    it('should throw when "tokenAddress" is not a valid address', async () => {
      await expect(() =>
        api.getLowestTradePrice({ tokenAddress: 'notAValidAddress' }),
      ).rejects.toThrow(
        `missing argument: Invalid token address (location="[SDK.getLowestTradePrice]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return lowest trade', async () => {
      HttpServiceMock.mockResolvedValueOnce(lowestTradePriceMock as AxiosResponse<any, any>);
      await api.getLowestTradePrice({ tokenAddress: CONTRACT_ADDRESS });
    });
  });

  describe('getCollectionsByWallet', () => {
    it('should throw when wallet address is not provided', async () => {
      await expect(() => api.getCollectionsByWallet({} as GetCollectionsByWallet)).rejects.toThrow(
        `missing argument: Invalid account address. (location=\"[SDK.getCollectionsByWallet]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });
    it('should throw when "walletAddress" is not a valid address', async () => {
      await expect(() =>
        api.getCollectionsByWallet({ walletAddress: 'notAValidAddress' }),
      ).rejects.toThrow(
        `missing argument: Invalid account address. (location=\"[SDK.getCollectionsByWallet]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return collections', async () => {
      HttpServiceMock.mockResolvedValueOnce(collectionsByWalletMock as AxiosResponse<any, any>);
      await api.getCollectionsByWallet({ walletAddress: ACCOUNT_ADDRESS });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });
  });
  describe('getOwnersByContractAddress', () => {
    it('should throw when contract address is not provided', async () => {
      await expect(() =>
        api.getOwnersbyContractAddress({} as GetNftOwnersByContractAddress),
      ).rejects.toThrow(
        `missing argument: Invalid contract address. (location="[SDK.getOwnersByTokenAddress]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });
    it('should throw when "contractAddress" is not a valid address', async () => {
      await expect(() =>
        api.getOwnersbyContractAddress({ contractAddress: 'notAValidAddress' }),
      ).rejects.toThrow(
        `missing argument: Invalid contract address. (location="[SDK.getOwnersByTokenAddress]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return owners', async () => {
      HttpServiceMock.mockResolvedValueOnce(ownersByContractAddress as AxiosResponse<any, any>);
      await api.getOwnersbyContractAddress({ contractAddress: CONTRACT_ADDRESS });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getOwnersByTokenAddressAndTokenId', () => {
    it('should throw when token address is not provided', async () => {
      await expect(() =>
        api.getOwnersbyTokenAddressAndTokenId({} as GetNftOwnersByTokenAddressAndTokenId),
      ).rejects.toThrow(
        `missing argument: Invalid token address (location="[SDK.getOwnersbyTokenAddressAndTokenId]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });
    it('should throw when "tokenAddress" is not a valid address', async () => {
      await expect(() =>
        api.getOwnersbyTokenAddressAndTokenId({ tokenAddress: 'notAValidAddress', tokenId: '1' }),
      ).rejects.toThrow(
        `missing argument: Invalid token address (location="[SDK.getOwnersbyTokenAddressAndTokenId]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should throw when "tokenId" is not valid', async () => {
      await expect(() =>
        api.getOwnersbyTokenAddressAndTokenId({ tokenAddress: CONTRACT_ADDRESS, tokenId: '' }),
      ).rejects.toThrow(
        `missing argument: No tokenId supplied or tokenID is invalid. (location="[SDK.getOwnersbyTokenAddressAndTokenId]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return owners', async () => {
      HttpServiceMock.mockResolvedValueOnce(ownersByContractAddress as AxiosResponse<any, any>);
      await api.getOwnersbyTokenAddressAndTokenId({
        tokenAddress: CONTRACT_ADDRESS,
        tokenId: '348',
      });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });
  });
  describe('searchNfts', () => {
    it('should throw when query is not provided', async () => {
      await expect(() => api.searchNfts({} as SearchNftsByString)).rejects.toThrow(
        `missing argument: Invalid search query. (location=\"[SDK.searchNfts]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });
    it('should throw when "query" is less than 3 characters', async () => {
      await expect(() => api.searchNfts({ query: 'a' })).rejects.toThrow(
        `missing argument: Invalid search query. (location=\"[SDK.searchNfts]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return nfts', async () => {
      HttpServiceMock.mockResolvedValueOnce(searchNfts as AxiosResponse<any, any>);
      await api.searchNfts({ query: 'Cool Cats' });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });
  });
});
