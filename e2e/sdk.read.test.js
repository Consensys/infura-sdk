import { config as loadEnv } from 'dotenv';
import SDK from '../lib/NFT/SDK';
import Auth from '../lib/Auth';

loadEnv();

describe('E2E Test: Basic NFT (read)', () => {
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
      expect(
        await sdk.getContractMetadata('0xE26a682fa90322eC48eB9F3FA66E8961D799177C'),
      ).toStrictEqual({ name: 'testContract', symbol: 'TST', tokenType: 'ERC721' });
    });
  });

  describe('As an account I should be able to get the list of NFTs by address', () => {
    it('should return list of NFTs by address', async () => {
      const nfts = await sdk.getNFTs('0xF69c1883b098d621FC58a42E673C4bF6a6483fFf');
      expect(nfts.assets.length).not.toBe(null);
      expect(nfts.assets[0]).not.toHaveProperty('metadata');
    });
  });

  describe('As an account I should be able to get the list of NFTs by collection', () => {
    it('should return list of NFTs by collection', async () => {
      const nfts = await sdk.getNFTsForCollection('0xE26a682fa90322eC48eB9F3FA66E8961D799177C');
      expect(nfts.assets.length).not.toBe(null);
    });
  });

  describe('As an account I should be able to get the token metadata', () => {
    it('should return token metadata', async () => {
      const tokenMetadata = await sdk.getTokenMetadata(
        '0x97Dd107f165bA366C0898d40a16445f9c9faED08',
        1,
      );

      expect(tokenMetadata).toStrictEqual({
        contract: '0x97dd107f165ba366c0898d40a16445f9c9faed08',
        tokenId: '1',
        name: '',
        description: '',
        image: '',
      });
    });
  });

  describe('As an account I should be able to get the account ETH balance', () => {
    it('should return account ETH balance', async () => {
      const ethBalance = await sdk.getEthBalance('0xF69c1883b098d621FC58a42E673C4bF6a6483fFf');
      expect(ethBalance).toEqual(expect.any(Number));
    });
  });

  describe('As an account I should be able to get the account ERC20 balance', () => {
    it('should return account ERC20 balance', async () => {
      const erc20Balance = await sdk.getERC20Balance('0xF69c1883b098d621FC58a42E673C4bF6a6483fFf');
      console.log(erc20Balance);
      expect(erc20Balance).toStrictEqual({
        account: '0xF69c1883b098d621FC58a42E673C4bF6a6483fFf',
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
      });
    });
  });
});
