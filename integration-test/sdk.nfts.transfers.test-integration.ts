import { config as loadEnv } from 'dotenv';
import { SDK } from './../src/lib/SDK/sdk';
import Auth from './../src/lib/Auth/Auth';
import {
  GetNftTransfersByContractAndToken,
  GetNftTransfersFromBlockToBlock,
  GetTransfersByBlockHashOptions,
  GetTransfersByBlockNumberOptions,
} from '../src/lib/Api/api';
import version from '../src/_version';
import { CONTRACT_ADDRESS } from '../test/__mocks__/utils';

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
        `missing argument: Invalid block number. (location="[SDK.getTransfersByBlockNumber]", code=MISSING_ARGUMENT, version=1.0.2)`,
      );
    });
  });

  describe('As an account I should get list of transfers by block', () => {
    it('should get list of transfers', async () => {
      const testBlockNumber = '15846571';
      const result = await sdk.api.getTransfersByBlockNumber({ blockNumber: testBlockNumber });

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
          blockNumber: testBlockNumber,
          cursor: cursor,
        });
        expect(resultSecondPage).toMatchObject({
          total: result.total,
          pageNumber: result.pageNumber + 1,
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

  describe('As an account I should get error with invalid blockhash', () => {
    it('should throw if block hash not valid', async () => {
      expect(() =>
        sdk.api.getTransfersByBlockHash({} as GetTransfersByBlockHashOptions),
      ).rejects.toThrow(
        `missing argument: Invalid block hash. (location="[SDK.getTransfersByBlockHash]", code=MISSING_ARGUMENT, version=1.0.2)`,
      );
    });
  });

  describe('As an account I should get list of transfers by block hash', () => {
    jest.setTimeout(10000);
    it('should get list of transfers by block hash', async () => {
      const testBlockHash = '0x759d8cb3930463fc0a0b6d6e30b284a1466cb7c590c21767f08a37e34fd583b1';
      const result = await sdk.api.getTransfersByBlockHash({
        blockHash: testBlockHash,
      });

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
        const resultSecondPage = await sdk.api.getTransfersByBlockHash({
          blockHash: testBlockHash,
          cursor: cursor,
        });
        expect(resultSecondPage).toMatchObject({
          total: result.total,
          pageNumber: result.pageNumber + 1,
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

  describe('As an account I should get list of transfers by wallet address', () => {
    const walletAddress = '0xC4505dB8CC490767fA6f4b6f0F2bDd668B357A5D';
    it('should get list of transfers', async () => {
      const result = await sdk.api.getNftsTransfersByWallet({
        walletAddress,
      });

      expect(result).toMatchObject({
        total: expect.any(Number),
        pageNumber: 0,
        pageSize: expect.any(Number),
        network: expect.any(String),
        cursor: expect.any(String),
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
        const resultSecondPage = await sdk.api.getNftsTransfersByWallet({
          walletAddress,
          cursor: cursor,
        });
        expect(resultSecondPage).toMatchObject({
          total: result.total,
          pageNumber: result.pageNumber + 1,
          pageSize: expect.any(Number),
          network: expect.any(String),
          cursor: expect.any(String),
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

  describe('As an account I should get list of transfers from block to block', () => {
    const fromBlock = 16026179;
    const toBlock = 16026190;
    it('should get list of transfers', async () => {
      const result = await sdk.api.getTransferFromBlockToBlock({
        fromBlock,
        toBlock,
      });

      expect(result).toMatchObject({
        total: expect.any(Number),
        pageNumber: 0,
        pageSize: expect.any(Number),
        network: expect.any(String),
        cursor: expect.any(String),
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
        const resultSecondPage = await sdk.api.getTransferFromBlockToBlock({
          fromBlock,
          toBlock,
          cursor,
        });
        expect(resultSecondPage).toMatchObject({
          total: expect.any(Number),
          pageNumber: 1,
          pageSize: expect.any(Number),
          network: expect.any(String),
          cursor: expect.any(String),
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

  describe('As an account I should get error with invalid blockNumber', () => {
    it('should throw if block number not valid', async () => {
      expect(() =>
        sdk.api.getTransferFromBlockToBlock({} as GetNftTransfersFromBlockToBlock),
      ).rejects.toThrow(
        `missing argument: Invalid block number (location=\"[SDK.getTransferFromBlockToBlock]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });
  });

  describe('As an account I should get list of transfers by a contract address and tokenId', () => {
    const contractAddress = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D';
    it('should get list of transfers', async () => {
      const result = await sdk.api.getTransfersByTokenId({
        contractAddress,
        tokenId: '1',
      });

      expect(result).toMatchObject({
        total: expect.any(Number),
        pageNumber: 0,
        pageSize: expect.any(Number),
        network: expect.any(String),
        cursor: null,
        account: contractAddress,
        transfers: expect.arrayContaining([
          expect.objectContaining({
            tokenAddress: expect.any(String),
            tokenId: '1',
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
    });
  });

  describe('As an account I should get error with invalid contract address', () => {
    it('should throw if a contract address not valid', async () => {
      expect(() =>
        sdk.api.getTransfersByTokenId({} as GetNftTransfersByContractAndToken),
      ).rejects.toThrow(
        `missing argument: Invalid contract address. (location=\"[SDK.getTransfersByTokenId]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should throw if a token id is not valid', async () => {
      expect(() =>
        sdk.api.getTransfersByTokenId({
          contractAddress: CONTRACT_ADDRESS,
          tokenId: '',
        } as GetNftTransfersByContractAndToken),
      ).rejects.toThrow(
        `missing argument: No tokenId supplied or tokenID is invalid. (location=\"[SDK.getTransfersByTokenId]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });
  });
});
