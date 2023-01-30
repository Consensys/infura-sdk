import { config as loadEnv } from 'dotenv';
import { SDK } from '../../src/lib/SDK/sdk';
import Auth from '../../src/lib/Auth/Auth';
import { NftDTO } from '../../src/lib/SDK/types';
import { GetCollectionsByWallet } from '../../src/lib/Api/api';
import version from '../../src/_version';

loadEnv();

describe('E2E Test: Sdk (read)', () => {
  jest.setTimeout(120 * 1000);
  let sdk: SDK;

  beforeAll(() => {
    const auth = new Auth({
      privateKey: process.env.WALLET_PRIVATE_KEY,
      projectId: process.env.INFURA_PROJECT_ID,
      secretId: process.env.INFURA_PROJECT_SECRET,
      rpcUrl: process.env.EVM_RPC_URL,
      chainId: 5,
    });

    sdk = new SDK(auth);
  });

  // fix to avoid axios open handle
  beforeEach(async () => {
    await process.nextTick(() => {});
  });

  describe('As an account I should be able to get the contract metadata', () => {
    it('should return the contract metadata', async () => {
      const contractMetadata = await sdk.api.getContractMetadata({
        contractAddress: '0x2a66707e4ffe929cf866bc048e54ce28f6b7275f',
      });
      const expectedContractMetadata = { name: 'testContract', symbol: 'TST', tokenType: 'ERC721' };
      expect(contractMetadata).toStrictEqual(expectedContractMetadata);
    });
  });

  describe('As an account I should be able to get the list of NFTs by address', () => {
    it('should return list of NFTs by address', async () => {
      const nfts: any = await sdk.api.getNFTs({
        publicAddress: <string>process.env.WALLET_PUBLIC_ADDRESS,
      });

      expect(nfts.account).toEqual(process.env.WALLET_PUBLIC_ADDRESS);
      expect(nfts.total).toBeGreaterThan(100);
      expect(nfts.pageNumber).toEqual(1);
      expect(nfts.cursor).not.toBeNull();
      // Checking that each element has the right data
      nfts.assets.forEach((asset: any) => {
        expect(asset).not.toHaveProperty('metadata');
        expect(asset).toHaveProperty('contract');
        expect(asset).toHaveProperty('tokenId');
        expect(asset).toHaveProperty('supply');
        expect(asset).toHaveProperty('type');
      });
      const nftPage2: NftDTO = await sdk.api.getNFTs({
        publicAddress: <string>process.env.WALLET_PUBLIC_ADDRESS,
        cursor: nfts.cursor,
      });
      expect(nftPage2.cursor).not.toBeNull();
      expect(nftPage2.pageNumber).toEqual(2);
    });
    it('should return an error when using wrong cursor', async () => {
      const nfts = async () =>
        await sdk.api.getNFTs({
          publicAddress: <string>process.env.WALLET_PUBLIC_ADDRESS,
          cursor: 'test',
        });

      expect(nfts).rejects.toThrow(
        `An Axios error occured : Bad cursor (location="[httpService.get]", error={"message":"Request failed with status code 400","name":"AxiosError"`,
      );
    });
  });

  describe('As an account I should be able to get the list of NFTs by collection', () => {
    it('should return list of NFTs by collection', async () => {
      const nfts: NftDTO = await sdk.api.getNFTsForCollection({
        contractAddress: '0x2a66707e4ffe929cf866bc048e54ce28f6b7275f',
      });
      expect(nfts.cursor).toBeNull();
      expect(nfts.assets.length).toBeGreaterThan(0);
    });
    it('should return list of NFTs by collection with pagination', async () => {
      const goerliCollectionAddress = '0x317a8fe0f1c7102e7674ab231441e485c64c178a';
      let nfts: NftDTO = await sdk.api.getNFTsForCollection({
        contractAddress: goerliCollectionAddress,
      });
      expect(nfts.cursor).not.toBeNull();
      expect(nfts.assets.length).toBeGreaterThan(0);
      expect(nfts.pageNumber).toBe(0);
      nfts = await sdk.api.getNFTsForCollection({
        contractAddress: goerliCollectionAddress,
        cursor: nfts.cursor,
      });
      expect(nfts.cursor).not.toBeNull();
      expect(nfts.assets.length).toBeGreaterThan(0);
      expect(nfts.pageNumber).toBe(1);
    });
    it('should return an error when using wrong cursor', async () => {
      const nftCollection = async () =>
        await sdk.api.getNFTsForCollection({
          contractAddress: '0x2a66707e4ffe929cf866bc048e54ce28f6b7275f',
          cursor: 'test',
        });

      expect(nftCollection).rejects.toThrow(
        `An Axios error occured : Bad cursor (location="[httpService.get]", error={"message":"Request failed with status code 400","name":"AxiosError"`,
      );
    });
  });

  describe('As an account I should be able to get the token metadata', () => {
    it('should return token metadata', async () => {
      const tokenMetadata = await sdk.api.getTokenMetadata({
        contractAddress: '0x2a66707e4ffe929cf866bc048e54ce28f6b7275f',
        tokenId: '0',
      });

      const expectedTokenMetadata = {
        contract: '0x2a66707e4ffe929cf866bc048e54ce28f6b7275f',
        tokenId: '0',
        metadata: null,
      };

      expect(tokenMetadata).toStrictEqual(expectedTokenMetadata);
    });
  });

  describe('As an account I should get list of collections that i have created', () => {
    const walletAddress = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
    it('should get list of collections', async () => {
      const result = await sdk.api.getCollectionsByWallet({
        walletAddress,
      });

      expect(result).toMatchObject({
        total: expect.any(Number),
        pageNumber: 1,
        pageSize: expect.any(Number),
        network: expect.any(String),
        cursor: null,
        account: walletAddress,
        collections: expect.arrayContaining([
          expect.objectContaining({
            contract: expect.any(String),
            tokenType: expect.any(String),
            name: expect.any(String),
            symbol: expect.any(String),
          }),
        ]),
      });
    });

    it('should throw when "walletAddress" is not a valid address', async () => {
      expect(
        async () =>
          await sdk.api.getCollectionsByWallet({
            walletAddress: 'notAValidAddress',
          }),
      ).rejects.toThrow(
        `missing argument: Invalid account address. (location=\"[SDK.getCollectionsByWallet]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should throw when wallet address is not provided', async () => {
      expect(
        async () => await sdk.api.getCollectionsByWallet({} as GetCollectionsByWallet),
      ).rejects.toThrow(
        `missing argument: Invalid account address. (location=\"[SDK.getCollectionsByWallet]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });
  });
});
