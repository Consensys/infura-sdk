import { config as loadEnv } from 'dotenv';
import { ExternallyOwnedAccount } from '../lib/NFT/externallyOwnedAccount';

loadEnv();

describe('E2E Test: Basic NFT (read)', () => {
  jest.setTimeout(120 * 1000);
  let externallyOwnedAccount;

  beforeAll(async () => {
    // create the apiKey
    const apiKey = Buffer.from(`${process.env.PROJECT_ID}:${process.env.SECRET_ID}`).toString(
      'base64',
    );

    externallyOwnedAccount = new ExternallyOwnedAccount({
      privateKey: process.env.PRIVATE_KEY,
      apiKey,
      rpcUrl: process.env.RPC_URL,
      chainId: 4,
    });
  });

  describe('As an account I should be able to get the list of NFTs by address', () => {
    it('should return list of NFTs by address', async () => {
      const nfts = await externallyOwnedAccount.getNFTs(
        '0xF69c1883b098d621FC58a42E673C4bF6a6483fFf',
      );
      expect(nfts.assets.length).not.toBe(null);
    });
  });

  describe('As an account I should be able to get the contract by address', () => {
    it('should return a contract abstraction by address', async () => {
      const contract = await externallyOwnedAccount.getContractAbstraction(
        '0xE26a682fa90322eC48eB9F3FA66E8961D799177C',
      );
      expect(Object.keys(contract)).toEqual(['deploy', 'mint', 'getSymbol', 'getNFTs']);
    });
  });

  describe('As an account I should be able to get the collection symbol using the contract abstraction', () => {
    it('should return the collection symbol', async () => {
      const contract = await externallyOwnedAccount.getContractAbstraction(
        '0xE26a682fa90322eC48eB9F3FA66E8961D799177C',
      );
      expect(await contract.getSymbol()).toEqual('TST');
    });
  });

  describe('As contract account I should be able to get the list of nfts that i created', () => {
    it('should return list of nfts for given contract', async () => {
      const contract = await externallyOwnedAccount.getContractAbstraction(
        '0xE26a682fa90322eC48eB9F3FA66E8961D799177C',
      );
      const nfts = await contract.getNFTs();
      expect(nfts.assets.length).not.toBe(null);
    });
  });
});
