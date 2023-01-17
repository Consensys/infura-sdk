import { config as loadEnv } from 'dotenv';
import { AxiosResponse } from 'axios';
import { ethers } from 'ethers';
import { faker } from '@faker-js/faker';

import Auth from '../src/lib/Auth/Auth';
import HttpService from '../src/services/httpService';
import version from '../src/_version';

import { generateTestPrivateKeyOrHash } from './__mocks__/utils';
import { TEMPLATES } from '../src/lib/constants';
import { SDK } from '../src/lib/SDK/sdk';
import ERC721Mintable from '../src/lib/ContractTemplates/ERC721Mintable';
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
  describe('Check that unsopported chains throw the right error', () => {
    it('Should show an error when bsc chain is provided when calling write functions', async () => {
      const account = new Auth({
        privateKey: generateTestPrivateKeyOrHash(),
        projectId: process.env.INFURA_PROJECT_ID,
        secretId: process.env.INFURA_PROJECT_SECRET,
        rpcUrl: process.env.EVM_RPC_URL,
        chainId: 56,
      });
      sdk = new SDK(account);
      await expect(() =>
        sdk.loadContract({
          template: TEMPLATES.ERC721Mintable,
          contractAddress: '',
        }),
      ).rejects.toThrow(
        `Error: Chain not supported for WRITE operations yet. (location=\"[SDK.loadContract]\", argument="chainId", value=56, code=INVALID_ARGUMENT, version=${version})`,
      );
    });
    it('Should show an error when bsc test chain is provided when calling write functions', async () => {
      const account = new Auth({
        privateKey: generateTestPrivateKeyOrHash(),
        projectId: process.env.INFURA_PROJECT_ID,
        secretId: process.env.INFURA_PROJECT_SECRET,
        rpcUrl: process.env.EVM_RPC_URL,
        chainId: 97,
      });
      sdk = new SDK(account);
      await expect(() =>
        sdk.loadContract({
          template: TEMPLATES.ERC721Mintable,
          contractAddress: '',
        }),
      ).rejects.toThrow(
        `Error: Chain not supported for WRITE operations yet. (location=\"[SDK.loadContract]\", argument="chainId", value=97, code=INVALID_ARGUMENT, version=${version})`,
      );
    });
    it('Should show an error when fantom chain is provided when calling write functions', async () => {
      const account = new Auth({
        privateKey: generateTestPrivateKeyOrHash(),
        projectId: process.env.INFURA_PROJECT_ID,
        secretId: process.env.INFURA_PROJECT_SECRET,
        rpcUrl: process.env.EVM_RPC_URL,
        chainId: 250,
      });
      sdk = new SDK(account);
      await expect(() =>
        sdk.loadContract({
          template: TEMPLATES.ERC721Mintable,
          contractAddress: '',
        }),
      ).rejects.toThrow(
        `Error: Chain not supported for WRITE operations yet. (location=\"[SDK.loadContract]\", argument="chainId", value=250, code=INVALID_ARGUMENT, version=${version})`,
      );
    });
    it('Should show an error when cronos chain is provided when calling write functions', async () => {
      const account = new Auth({
        privateKey: generateTestPrivateKeyOrHash(),
        projectId: process.env.INFURA_PROJECT_ID,
        secretId: process.env.INFURA_PROJECT_SECRET,
        rpcUrl: process.env.EVM_RPC_URL,
        chainId: 25,
      });
      sdk = new SDK(account);
      await expect(() =>
        sdk.loadContract({
          template: TEMPLATES.ERC721Mintable,
          contractAddress: '',
        }),
      ).rejects.toThrow(
        `Error: Chain not supported for WRITE operations yet. (location=\"[SDK.loadContract]\", argument="chainId", value=25, code=INVALID_ARGUMENT, version=${version})`,
      );
    });
    it('Should show an error when cronos testnet chain is provided when calling write functions', async () => {
      const account = new Auth({
        privateKey: generateTestPrivateKeyOrHash(),
        projectId: process.env.INFURA_PROJECT_ID,
        secretId: process.env.INFURA_PROJECT_SECRET,
        rpcUrl: process.env.EVM_RPC_URL,
        chainId: 338,
      });
      sdk = new SDK(account);
      await expect(() =>
        sdk.loadContract({
          template: TEMPLATES.ERC721Mintable,
          contractAddress: '',
        }),
      ).rejects.toThrow(
        `Error: Chain not supported for WRITE operations yet. (location=\"[SDK.loadContract]\", argument="chainId", value=338, code=INVALID_ARGUMENT, version=${version})`,
      );
    });
  });
});
