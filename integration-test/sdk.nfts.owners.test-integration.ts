import { config as loadEnv } from 'dotenv';
import { SDK } from './../src/lib/SDK/sdk';
import Auth from './../src/lib/Auth/Auth';
import version from '../src/_version';
import { GetNftOwnersByContractAddress } from '../src/lib/Api/api';

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

  describe('As an account I should owners for a contract address', () => {
    it('should throw if contract address missing', async () => {
      expect(() =>
        sdk.api.getOwnersbyContractAddress({} as GetNftOwnersByContractAddress),
      ).rejects.toThrow(
        `missing argument: Invalid contract address. (location=\"[SDK.getOwnersByTokenAddress]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should throw if contract address not valid', async () => {
      expect(() =>
        sdk.api.getOwnersbyContractAddress({ contractAddress: '0x258' }),
      ).rejects.toThrow(
        `missing argument: Invalid contract address. (location=\"[SDK.getOwnersByTokenAddress]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should throw if cursor is bad', async () => {
      await expect(
        sdk.api.getOwnersbyContractAddress({
          contractAddress: '0x1A92f7381B9F03921564a437210bB9396471050C',
          cursor: 'dd',
        }),
      ).rejects.toThrow('An Axios error occured : Bad cursor');
    });

    it('should return list of owners by contract address', async () => {
      const result = await sdk.api.getOwnersbyContractAddress({
        contractAddress: '0x1A92f7381B9F03921564a437210bB9396471050C',
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
        owners: expect.arrayContaining([
          expect.objectContaining({
            tokenAddress: expect.any(String),
            tokenId: expect.any(String),
            amount: expect.any(String),
            ownerOf: expect.any(String),
            tokenHash: expect.any(String),
            blockNumberMinted: expect.any(String),
            blockNumber: expect.any(String),
            contractType: expect.any(String),
            name: expect.any(String),
            symbol: expect.any(String),
            metadata: expect.any(String),
            minterAddress: expect.any(String),
          }),
        ]),
      });

      const resultPage2 = await await sdk.api.getOwnersbyContractAddress({
        contractAddress: '0x1A92f7381B9F03921564a437210bB9396471050C',
        cursor: cursor,
      });
      expect(resultPage2).toMatchObject({
        total: total,
        pageNumber: firstPage + 1,
        pageSize: result.pageSize,
        network: expect.any(String),
        cursor: expect.any(String),
        owners: expect.arrayContaining([
          expect.objectContaining({
            tokenAddress: expect.any(String),
            tokenId: expect.any(String),
            amount: expect.any(String),
            ownerOf: expect.any(String),
            tokenHash: expect.any(String),
            blockNumberMinted: expect.any(String),
            blockNumber: expect.any(String),
            contractType: expect.any(String),
            name: expect.any(String),
            symbol: expect.any(String),
            metadata: expect.any(String),
            minterAddress: expect.any(String),
          }),
        ]),
      });
    });
  });
});
