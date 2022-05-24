import { config as loadEnv } from 'dotenv';
import { ExternallyOwnedAccount } from '../lib/NFT/externallyOwnedAccount';
import { HttpService } from '../services/httpService';
import Auth from '../lib/Auth';
import NFT_API_URL from '../lib/NFT/constants';

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

//Use Auth
describe('E2E Test: Basic NFT (read) Using Auth', () => {
  jest.setTimeout(120 * 1000);
  let account;
  let httpClient;

  beforeAll(async () => {
    account = new Auth({
      privateKey: 'PRIV_KEY',
      projectId: process.env.PROJECT_ID,
      secretId: process.env.SECRET_ID,
      chainId: 4,
      rpcUrl: 'http://0.0.0.0:8545',
    });

    httpClient = new HttpService(NFT_API_URL, account.getApiAuth());
  });

  describe('Given a valid Auth, I should be able to get the list of NFTs by address', () => {
    it('should return list of NFTs by address', async () => {
      const apiUrl = `${NFT_API_URL}/api/v1/networks/${account.getChainId()}/nfts/collection/0xF69c1883b098d621FC58a42E673C4bF6a6483fFf`;

      try {
        const { data } = await httpClient.get(apiUrl);
        expect(data.assets.length).not.toBe(null);
      } catch (error) {
        throw new Error(error).stack;
      }
    });
  });
});
