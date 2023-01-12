import { config as loadEnv } from 'dotenv';
import { SDK } from './../src/lib/SDK/sdk';
import Auth from './../src/lib/Auth/Auth';
import { GetTransfersByBlockNumberOptions } from '../src/lib/Api/api';

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

  describe('As an account I should get error with invalid blockNumber', () => {
    it('should throw if block number not valid', async () => {
      expect(() =>
        sdk.api.getTransfersByBlockNumber({} as GetTransfersByBlockNumberOptions),
      ).rejects.toThrow(
        `Error: missing argument: Invalid block number. (location="[SDK.getTransfersByBlockNumber]", code=MISSING_ARGUMENT, version=1.0.2)`,
      );
    });
  });

  describe('As an account I should get list of transfers by block', () => {
    it('should get list of transfers', async () => {
      const result = await sdk.api.getTransfersByBlockNumber({ blockHashNumber: '15846571' });

      expect(result).toMatchObject({
        total: expect.any(Number),
        pageNumber: expect.any(Number),
        pageSize: expect.any(Number),
        network: expect.any(String),
        transfers: expect.arrayContaining([
          expect.objectContaining({
            tokenAddress: expect.any(String),
            tokenId: expect.any(String),
            fromAddress: expect.any(String),
            toAddress: expect.any(String),
            contractType: expect.any(String),
            price: expect.any(String),
            quantity: expect.any(String),
            blockNumber: expect.any(String),
            blockTimestamp: expect.any(String),
            blockHash: expect.any(String),
            transactionHash: expect.any(String),
            transactionType: expect.any(String),
          }),
        ]),
      });
      const cursor = result.cursor;
      if (result.cursor) {
        const resultSecondPage = await sdk.api.getTransfersByBlockNumber({
          blockHashNumber: '15846571',
          cursor: cursor,
        });
        expect(resultSecondPage).toMatchObject({
          total: expect.any(Number),
          pageNumber: expect.any(Number),
          pageSize: expect.any(Number),
          network: expect.any(String),
          transfers: expect.arrayContaining([
            expect.objectContaining({
              tokenAddress: expect.any(String),
              tokenId: expect.any(String),
              fromAddress: expect.any(String),
              toAddress: expect.any(String),
              contractType: expect.any(String),
              price: expect.any(String),
              quantity: expect.any(String),
              blockNumber: expect.any(String),
              blockTimestamp: expect.any(String),
              blockHash: expect.any(String),
              transactionHash: expect.any(String),
              transactionType: expect.any(String),
            }),
          ]),
        });
      }
    });
  });
});
