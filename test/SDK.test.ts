import { config as loadEnv } from 'dotenv';
import { AxiosResponse } from 'axios';
import { ethers } from 'ethers';
import { faker } from '@faker-js/faker';

import Auth from '../src/lib/Auth/Auth';
import HttpService from '../src/services/httpService';
import version from '../src/_version';

import {
  accountNFTsMock,
  collectionNFTsMock,
  contractMetadataMock,
  tokenMetadataMock,
} from './__mocks__/api';
import { CONTRACT_ADDRESS, generateTestPrivateKeyOrHash } from './__mocks__/utils';
import { TEMPLATES } from '../src/lib/constants';
import { SDK } from '../src/lib/SDK/sdk';
import ERC721Mintable, { DeployParams } from '../src/lib/ContractTemplates/ERC721Mintable';
import IPFS from '../src/services/ipfsService';

loadEnv();

describe('Sdk', () => {
  jest.setTimeout(120 * 1000);
  let signerMock: jest.SpyInstance<ethers.Wallet | ethers.providers.JsonRpcSigner, []>;
  const erc721Mocked = jest
    .spyOn(ERC721Mintable.prototype, 'deploy')
    .mockImplementation(() => jest.fn() as unknown as Promise<ERC721Mintable>);
  jest.mock('ethers');
  const HttpServiceMock = jest
    .spyOn(HttpService.prototype, 'get')
    .mockImplementation(() => jest.fn() as unknown as Promise<AxiosResponse<any, any>>);

  const IpfsUploadFileMock = jest
    .spyOn(IPFS.prototype, 'uploadFile')
    .mockImplementation(() => jest.fn() as unknown as Promise<string>);

  const IpfsUploadArrayMock = jest
    .spyOn(IPFS.prototype, 'uploadArray')
    .mockImplementation(() => jest.fn() as unknown as Promise<string>);

  const IpfsUploadContentMock = jest
    .spyOn(IPFS.prototype, 'uploadContent')
    .mockImplementation(() => jest.fn() as unknown as Promise<string>);

  let sdk: SDK;
  let sdkWithoutIpfs: SDK;
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

    const account2 = new Auth({
      privateKey: generateTestPrivateKeyOrHash(),
      projectId: process.env.INFURA_PROJECT_ID,
      secretId: process.env.INFURA_PROJECT_SECRET,
      rpcUrl: process.env.EVM_RPC_URL,
      chainId: 5,
    });
    sdk = new SDK(account);

    sdkWithoutIpfs = new SDK(account2);

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
    IpfsUploadFileMock.mockClear();
    IpfsUploadArrayMock.mockClear();
    IpfsUploadContentMock.mockClear();
    erc721Mocked.mockClear();
    signerMock.mockClear();
  });

  describe('getContractMetadata', () => {
    it('should throw when "contractAddress" is not a valid address', async () => {
      await expect(() =>
        sdk.getContractMetadata({ contractAddress: 'notAValidAddress' }),
      ).rejects.toThrow(
        `missing argument: Invalid contract address. (location="[SDK.getContractMetadata]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return contract metadata', async () => {
      HttpServiceMock.mockResolvedValueOnce(contractMetadataMock as AxiosResponse<any, any>);
      const contractMetadata = await sdk.getContractMetadata({
        contractAddress: '0xE26a682fa90322eC48eB9F3FA66E8961D799177C',
      });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
      expect(contractMetadata).not.toHaveProperty('contract');
    });
  });

  describe('getNFTs', () => {
    it('should throw when "address" is not a valid address', async () => {
      await expect(() => sdk.getNFTs({ publicAddress: 'notAValidAddress' })).rejects.toThrow(
        `missing argument: Invalid public address. (location="[SDK.getNFTs]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return the list of NFTs without metadata', async () => {
      HttpServiceMock.mockResolvedValueOnce(accountNFTsMock as AxiosResponse<any, any>);
      const accountNFTs = await sdk.getNFTs({ publicAddress: CONTRACT_ADDRESS });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
      expect((accountNFTs as any).assets[0]).not.toHaveProperty('metadata');
    });

    it('should return the list of NFTs with metadata', async () => {
      HttpServiceMock.mockResolvedValueOnce(accountNFTsMock as AxiosResponse<any, any>);
      const accountNFTs = await sdk.getNFTs({
        publicAddress: CONTRACT_ADDRESS,
        includeMetadata: true,
      });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
      expect((accountNFTs as any).assets[0]).toHaveProperty('metadata');
    });
  });

  describe('getNFTsForCollection', () => {
    it('should throw when "contractAddress" is not a valid address', async () => {
      await expect(() =>
        sdk.getNFTsForCollection({ contractAddress: 'notAValidAddress' }),
      ).rejects.toThrow(
        `missing argument: Invalid contract address. (location="[SDK.getNFTsForCollection]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return return collection NFTs list', async () => {
      HttpServiceMock.mockResolvedValueOnce(collectionNFTsMock as AxiosResponse<any, any>);
      await sdk.getNFTsForCollection({ contractAddress: CONTRACT_ADDRESS });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTokenMetadata', () => {
    it('should throw when "contractAddress" is not a valid address', async () => {
      await expect(() =>
        sdk.getTokenMetadata({ contractAddress: 'notAValidAddress', tokenId: 1 }),
      ).rejects.toThrow(
        `missing argument: Invalid contract address. (location="[SDK.getTokenMetadata]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return token metadata', async () => {
      HttpServiceMock.mockResolvedValueOnce(tokenMetadataMock as AxiosResponse<any, any>);
      await sdk.getTokenMetadata({ contractAddress: CONTRACT_ADDRESS, tokenId: 1 });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getStatus', () => {
    it('should throw when transaction hash argument is not valid', async () => {
      await expect(() => sdk.getStatus({ txHash: 'test' })).rejects.toThrow(
        `Invalid transaction hash. (location="[SDK.GetStatus]", argument="txHash", value="test", code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('should return transaction status and details', async () => {
      await sdk.getStatus({ txHash: generateTestPrivateKeyOrHash() });
      expect(signerMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('deploy', () => {
    it('should throw error when template is not provided', async () => {
      await expect(() =>
        sdk.deploy({
          template: '',
          params: {
            name: 'TestContractFinal',
            symbol: 'TOC',
            contractURI: 'https://ipfs.io/ipfs/QmbPgLdcKK3Tmc7EcfDnTuWTKTacsyHBHyKRxeGiEDR7mp',
          },
        }),
      ).rejects.toThrow(
        `missing argument: No template type supplied. (location=\"[SDK.deploy]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should throw error when template is provided', async () => {
      await expect(() =>
        sdk.loadContract({
          template: '',
          contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
        }),
      ).rejects.toThrow(
        `missing argument: No template type supplied. (location=\"[SDK.loadContract]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should throw contract address is empty', async () => {
      await expect(() =>
        sdk.loadContract({
          template: TEMPLATES.ERC721Mintable,
          contractAddress: '',
        }),
      ).rejects.toThrow(
        `missing argument: No address supplied. (location=\"[SDK.loadContract]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    // TODO: fix test
    it('should deploy contract', async () => {
      await sdk.deploy({
        template: TEMPLATES.ERC721Mintable,
        params: {
          name: 'TestContractFinal',
          symbol: 'TOC',
          contractURI: 'https://ipfs.io/ipfs/QmbPgLdcKK3Tmc7EcfDnTuWTKTacsyHBHyKRxeGiEDR7mp',
        },
      });
      expect(erc721Mocked).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProvider', () => {
    it('should return the provider', async () => {
      await sdk.getProvider();

      expect(signerMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('storeIpfs', () => {
    it('should store file', async () => {
      IpfsUploadFileMock.mockResolvedValueOnce('test');
      await sdk.storeFile({
        metadata: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
      });
      expect(IpfsUploadFileMock).toHaveBeenCalledTimes(1);
    });

    it('should store an array', async () => {
      IpfsUploadArrayMock.mockResolvedValueOnce('test');
      await sdk.createFolder({
        metadata: [
          JSON.stringify({
            test: 'test',
          }),
        ],
        isErc1155: true,
      });
      expect(IpfsUploadArrayMock).toHaveBeenCalledTimes(1);
    });

    it('should store content', async () => {
      IpfsUploadContentMock.mockResolvedValueOnce('test');
      await sdk.storeMetadata({ metadata: 'test' });
      expect(IpfsUploadContentMock).toHaveBeenCalledTimes(1);
    });

    it('should throw error if ipfs is not setted', async () => {
      const store = async () => await sdkWithoutIpfs.storeMetadata({ metadata: 'test' });
      expect(store).rejects.toThrow(
        `invalid ipfs setup (location=\"[SDK.storeMetadata]\", argument=\"ipfs\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('should throw error if its not a valid json', async () => {
      const store = async () => await sdk.createFolder({ metadata: ['test'], isErc1155: true });
      expect(store).rejects.toThrow(
        `data must be a valid json (location=\"[SDK.createFolder]\", argument=\"data\", value=\"test\", code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('should throw error if ipfs is not setted for create folder', async () => {
      const store = async () =>
        await sdkWithoutIpfs.createFolder({
          metadata: [
            JSON.stringify({
              test: 'test',
            }),
          ],
          isErc1155: true,
        });
      expect(store).rejects.toThrow(
        `invalid ipfs setup (location=\"[SDK.createFolder]\", argument=\"ipfs\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
      );
    });
  });
});
