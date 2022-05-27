import { config as loadEnv } from 'dotenv';
import SDK from '../lib/SDK/sdk';
import Auth from '../lib/Auth/Auth';

loadEnv();

describe('E2E Test: Sdk (read)', () => {
  jest.setTimeout(120 * 1000);
  let sdk;

  beforeAll(() => {
    const auth = new Auth({
      privateKey: process.env.PRIVATE_KEY,
      projectId: process.env.PROJECT_ID,
      secretId: process.env.SECRET_ID,
      rpcUrl: process.env.RPC_URL,
      chainId: 4,
    });

    sdk = new SDK(auth);
  });

  describe('As an account I should be able to get the contract metadata', () => {
    it('should return the contract metadata', async () => {
      await process.nextTick(() => {});
      const contractMetadata = await sdk.getContractMetadata(
        '0xE26a682fa90322eC48eB9F3FA66E8961D799177C',
      );
      const expectedContractMetadata = { name: 'testContract', symbol: 'TST', tokenType: 'ERC721' };
      expect(contractMetadata).toStrictEqual(expectedContractMetadata);
    });
  });

  describe('As an account I should be able to get the list of NFTs by address', () => {
    it('should return list of NFTs by address', async () => {
      await process.nextTick(() => {});
      const nfts = await sdk.getNFTs(process.env.PUBLIC_ADDRESS);
      expect(nfts.assets.length).toBeGreaterThan(0);
      expect(nfts.assets[0]).not.toHaveProperty('metadata');
    });
  });

  describe('As an account I should be able to get the list of NFTs by collection', () => {
    it('should return list of NFTs by collection', async () => {
      await process.nextTick(() => {});
      const nfts = await sdk.getNFTsForCollection('0xE26a682fa90322eC48eB9F3FA66E8961D799177C');
      expect(nfts.assets.length).toBeGreaterThan(0);
    });
  });

  describe('As an account I should be able to get the token metadata', () => {
    it('should return token metadata', async () => {
      await process.nextTick(() => {});
      const tokenMetadata = await sdk.getTokenMetadata(
        '0xE26a682fa90322eC48eB9F3FA66E8961D799177C',
        1,
      );
      const expectedTokenMetadata = {
        contract: '0xe26a682fa90322ec48eb9f3fa66e8961d799177c',
        tokenId: '1',
        name: '',
        description: '',
        image: '',
      };

      expect(tokenMetadata).toStrictEqual(expectedTokenMetadata);
    });
  });

  describe('As an account I should be able to get the account ETH balance', () => {
    it('should return account ETH balance', async () => {
      await process.nextTick(() => {});
      const ethBalance = await sdk.getEthBalance(process.env.PUBLIC_ADDRESS);
      expect(ethBalance).toEqual(expect.any(Number));
    });
  });

  describe('As an account I should be able to get the account ERC20 balances', () => {
    it('should return account ERC20 balances', async () => {
      await process.nextTick(() => {});
      const erc20Balance = await sdk.getERC20Balances(process.env.PUBLIC_ADDRESS);

      const expectedERC20Balance = {
        account: process.env.PUBLIC_ADDRESS,
        assets: expect.arrayContaining([
          {
            balance: expect.any(Number),
            contract: '0x0000000000000000000000000000000000000000',
            decimals: 18,
            name: 'Ethereum',
            rawBalance: expect.any(String),
            symbol: 'ETH',
          },
        ]),
        network: 'Ethereum',
        type: 'ERC20',
      };

      expect(erc20Balance).toStrictEqual(expectedERC20Balance);
    });
  });
});
