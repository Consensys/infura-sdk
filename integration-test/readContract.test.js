import { config as loadEnv } from 'dotenv';
import SDK from '../src/lib/SDK/sdk.js';
import Auth from '../src/lib/Auth/Auth.js';

loadEnv();

describe('E2E Test: Sdk (read)', () => {
  jest.setTimeout(120 * 1000);
  let sdk;

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
      const contractMetadata = await sdk.getContractMetadata({
        contractAddress: '0x2a66707e4ffe929cf866bc048e54ce28f6b7275f',
      });
      const expectedContractMetadata = { name: 'testContract', symbol: 'TST', tokenType: 'ERC721' };
      expect(contractMetadata).toStrictEqual(expectedContractMetadata);
    });
  });

  describe('As an account I should be able to get the list of NFTs by address', () => {
    it('should return list of NFTs by address', async () => {
      const nfts = await sdk.getNFTs({ publicAddress: process.env.WALLET_PUBLIC_ADDRESS });
      expect(nfts.assets.length).toBeGreaterThan(0);
      expect(nfts.assets[0]).not.toHaveProperty('metadata');
    });
  });

  describe('As an account I should be able to get the list of NFTs by collection', () => {
    it('should return list of NFTs by collection', async () => {
      const nfts = await sdk.getNFTsForCollection({
        contractAddress: '0x2a66707e4ffe929cf866bc048e54ce28f6b7275f',
      });
      expect(nfts.assets.length).toBeGreaterThan(0);
    });
  });

  describe('As an account I should be able to get the token metadata', () => {
    it('should return token metadata', async () => {
      const tokenMetadata = await sdk.getTokenMetadata({
        contractAddress: '0x2a66707e4ffe929cf866bc048e54ce28f6b7275f',
        tokenId: 0,
      });
      const expectedTokenMetadata = {
        contract: '0x2a66707e4ffe929cf866bc048e54ce28f6b7275f',
        tokenId: '0',
        name: '',
        description: '',
        image: '',
      };

      expect(tokenMetadata).toStrictEqual(expectedTokenMetadata);
    });
  });

  describe('As an account I should be able to get the account ETH balance', () => {
    it('should return account ETH balance', async () => {
      const ethBalance = await sdk.getEthBalance({
        publicAddress: process.env.WALLET_PUBLIC_ADDRESS,
      });
      expect(ethBalance).toEqual(expect.any(Number));
    });
  });

  describe('As an account I should be able to get the account ERC20 balances', () => {
    it('should return account ERC20 balances', async () => {
      const erc20Balance = await sdk.getERC20Balances({
        publicAddress: process.env.WALLET_PUBLIC_ADDRESS,
      });

      const expectedERC20Balance = {
        account: process.env.WALLET_PUBLIC_ADDRESS,
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
