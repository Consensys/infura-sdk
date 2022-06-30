import { config as loadEnv } from 'dotenv';
import Sdk from '../src/lib/SDK/sdk';
import Auth from '../src/lib/Auth/Auth';
import { HttpService } from '../src/services/httpService';
import {
  accountNFTsMock,
  collectionNFTsMock,
  contractMetadataMock,
  tokenMetadataMock,
} from './__mocks__/api';
import { CONTRACT_ADDRESS, generateTestPrivateKeyOrHash } from './__mocks__/utils';
import { TEMPLATES } from '../src/lib/NFT/constants';
import ContractFactory from '../src/lib/NFT/contractFactory';

loadEnv();

describe('Sdk', () => {
  let signerMock;
  let contractFactoryMock;
  jest.setTimeout(120 * 1000);
  const HttpServiceMock = jest
    .spyOn(HttpService.prototype, 'get')
    .mockImplementation(() => jest.fn());
  let sdk;
  beforeAll(() => {
    const account = new Auth({
      privateKey: generateTestPrivateKeyOrHash(),
      projectId: process.env.INFURA_PROJECT_ID,
      secretId: process.env.INFURA_PROJECT_SECRET,
      rpcUrl: process.env.EVM_RPC_URL,
      chainId: 5,
    });
    sdk = new Sdk(account);

    signerMock = jest.spyOn(account, 'getSigner').mockImplementation(() => ({
      provider: {
        getTransactionReceipt: () => ({
          status: 1,
        }),
      },
    }));

    contractFactoryMock = jest.spyOn(ContractFactory, 'factory').mockImplementation(() => ({
      deploy: () => ({}),
    }));
  });

  afterEach(() => {
    HttpServiceMock.mockClear();
    contractFactoryMock.mockClear();
    signerMock.mockClear();
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

  describe('getStatus', () => {
    it('should throw when transaction hash argument is not valid', async () => {
      await expect(() => sdk.getStatus({ txHash: 'test' })).rejects.toThrow(
        '[SDK.GetStatus] You need to pass a valid tx hash as parameter',
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
          template: null,
          params: {
            name: 'TestContractFinal',
            symbol: 'TOC',
            contractURI: {
              attributes: [{ trait_type: 'Background', value: 'Black' }],
              description: 'Sample NFT used for demo at the NFT.NYC Event',
              image: 'https://ipfs.io/ipfs/QmbPgLdcKK3Tmc7EcfDnTuWTKTacsyHBHyKRxeGiEDR7mp',
              name: 'Hello NFT.NYC',
            },
          },
        }),
      ).rejects.toThrow('[SDK.deploy] Template type is required to deploy a new contract.');
    });

    it('should throw error params is empty', async () => {
      await expect(() =>
        sdk.deploy({
          template: TEMPLATES.ERC721Mintable,
          params: {},
        }),
      ).rejects.toThrow('[SDK.deploy] A set of parameters are required to deploy a new contract.');
    });

    it('should deploy contract', async () => {
      await sdk.deploy({
        template: TEMPLATES.ERC721Mintable,
        params: {
          name: 'TestContractFinal',
          symbol: 'TOC',
          contractURI: {
            attributes: [{ trait_type: 'Background', value: 'Black' }],
            description: 'Sample NFT used for demo at the NFT.NYC Event',
            image: 'https://ipfs.io/ipfs/QmbPgLdcKK3Tmc7EcfDnTuWTKTacsyHBHyKRxeGiEDR7mp',
            name: 'Hello NFT.NYC',
          },
        },
      });
      expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProvider', () => {
    it('should return the provider', async () => {
      await sdk.getProvider();

      expect(signerMock).toHaveBeenCalledTimes(1);
    });
  });
});
