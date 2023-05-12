import { config as loadEnv } from 'dotenv';
import { SDK } from './../src/lib/SDK/sdk';
import Auth from './../src/lib/Auth/Auth';
import { SearchNftsByString } from '../src/lib/Api/api';
import version from '../src/_version';

loadEnv();

describe('E2E Test: Sdk (read)', () => {
  let sdk: SDK;

  beforeAll(() => {
    const auth = new Auth({
      privateKey: process.env.WALLET_PRIVATE_KEY,
      projectId: process.env.INFURA_PROJECT_ID,
      secretId: process.env.INFURA_PROJECT_SECRET,
      rpcUrl: process.env.EVM_RPC_URL,
      chainId: 1,
    });

    sdk = new SDK(auth);
  });

  // fix to avoid axios open handle
  beforeEach(async () => {
    await process.nextTick(() => {});
  });

  describe('As an account I should get error with invalid search query', () => {
    it('should throw if search query not provided', async () => {
      expect(() => sdk.api.searchNfts({} as SearchNftsByString)).rejects.toThrow(
        `missing argument: Invalid search query. (location=\"[SDK.searchNfts]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should throw if search query is less than 3 characters', async () => {
      expect(() => sdk.api.searchNfts({ query: 'x' })).rejects.toThrow(
        `missing argument: Invalid search query. (location=\"[SDK.searchNfts]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should throw if cursor is bad', async () => {
      await expect(
        sdk.api.searchNfts({
          query: 'cool cats',
          cursor: 'dd',
        }),
      ).rejects.toThrow('An Axios error occured : Bad cursor');
    });
  });

  describe('As an account I should search nfts by a query string', () => {
    it('should return list nfts that match a query string', async () => {
      const testString = 'Cool Cats';
      const result = await sdk.api.searchNfts({
        query: testString,
      });

      const total = result.total;
      const firstPage = result.pageNumber;
      const cursor = result.cursor;
      expect(result).toMatchObject({
        total: expect.any(Number),
        pageNumber: expect.any(Number),
        pageSize: expect.any(Number),
        network: expect.any(String),
        cursor: expect.any(String),
        nfts: expect.arrayContaining([
          expect.objectContaining({
            tokenId: expect.any(String),
            tokenAddress: expect.any(String),
            metadata: expect.any(String),
            contractType: expect.any(String),
            tokenHash: expect.any(String),
            minterAddress: expect.any(String),
            blockNumberMinted: expect.any(String),
            createdAt: expect.any(String),
          }),
        ]),
      });

      const resultPage2 = await await sdk.api.searchNfts({
        query: testString,
        cursor: cursor,
      });
      expect(resultPage2).toMatchObject({
        total: total,
        pageNumber: firstPage + 1,
        pageSize: result.pageSize,
        network: expect.any(String),
        cursor: expect.any(String),
        nfts: expect.arrayContaining([
          expect.objectContaining({
            tokenId: expect.any(String),
            tokenAddress: expect.any(String),
            metadata: expect.any(String),
            contractType: expect.any(String),
            tokenHash: expect.any(String),
            minterAddress: expect.any(String),
            blockNumberMinted: expect.any(String),
            createdAt: expect.any(String),
          }),
        ]),
      });
    });
  });
});
