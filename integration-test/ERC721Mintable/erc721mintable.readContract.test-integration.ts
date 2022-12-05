import { config as loadEnv } from 'dotenv';
import { SDK } from '../../src/lib/SDK/sdk';
import Auth from '../../src/lib/Auth/Auth';

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
      const contractMetadata = await sdk.getContractMetadata({
        contractAddress: '0x2a66707e4ffe929cf866bc048e54ce28f6b7275f',
      });
      const expectedContractMetadata = { name: 'testContract', symbol: 'TST', tokenType: 'ERC721' };
      expect(contractMetadata).toStrictEqual(expectedContractMetadata);
    });
  });

  describe('As an account I should be able to get the list of NFTs by address', () => {
    it('should return list of NFTs by address', async () => {
      const nfts: any = await sdk.getNFTs({
        publicAddress: <string>process.env.WALLET_PUBLIC_ADDRESS,
      });

      expect(nfts.account).toEqual(process.env.WALLET_PUBLIC_ADDRESS);
      // Checking that each element has the right data
      nfts.assets.forEach((asset: any) => {
        expect(asset).not.toHaveProperty('metadata');
        expect(asset).toHaveProperty('contract');
        expect(asset).toHaveProperty('tokenId');
        expect(asset).toHaveProperty('supply');
        expect(asset).toHaveProperty('type');
      });
    });
  });

  describe('As an account I should be able to get the list of NFTs by collection', () => {
    it('should return list of NFTs by collection', async () => {
      const nfts: any = await sdk.getNFTsForCollection({
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
        tokenId: 0,
        metadata: null,
      };

      expect(tokenMetadata).toStrictEqual(expectedTokenMetadata);
    });
  });
});
