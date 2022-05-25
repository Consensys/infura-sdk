import { config as loadEnv } from 'dotenv';
import { ExternallyOwnedAccount } from '../lib/NFT/externallyOwnedAccount';
import { HttpService } from '../services/httpService';
import Auth from '../lib/Auth';
import NFT_API_URL from '../lib/NFT/constants';

loadEnv();

/**
 * Every feature-test file resembles a Test Suite, and would be wrapped inside ONE Describe function
 */
describe('E2E Test: Basic NFT (read)', () => {
  jest.setTimeout(120 * 1000);
  let externallyOwnedAccount;

  // Arrange
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

  it('Given a valid account, I should be able to get the list of NFTs by address', async () => {
    // Act
    const nfts = await externallyOwnedAccount.getNFTs('0xF69c1883b098d621FC58a42E673C4bF6a6483fFf');

    // Assert
    expect(nfts.assets.length).not.toBe(null);
  });

  it('Given a valid account, I should be able to get the contract abstraction by address', async () => {
    // Act
    const contract = await externallyOwnedAccount.getContractAbstraction(
      '0xE26a682fa90322eC48eB9F3FA66E8961D799177C',
    );

    // Assert
    expect(Object.keys(contract)).toEqual(['deploy', 'mint', 'getSymbol', 'getNFTs']);
  });

  it('Given a valid account, I should be able to get the collection symbol using the contract abstraction', async () => {
    // Act
    const contract = await externallyOwnedAccount.getContractAbstraction(
      '0xE26a682fa90322eC48eB9F3FA66E8961D799177C',
    );

    // Assert
    expect(await contract.getSymbol()).toEqual('TST');
  });

  it('Given a valid account, I should be able to get the list of nfts that i created', async () => {
    // Act
    const contract = await externallyOwnedAccount.getContractAbstraction(
      '0xE26a682fa90322eC48eB9F3FA66E8961D799177C',
    );

    // Assert
    const nfts = await contract.getNFTs();
    expect(nfts.assets.length).not.toBe(null);
  });

  it('Given a valid Auth instance, I should be able to get the list of NFTs by address', async () => {
    // Arrange
    const account = new Auth({
      privateKey: 'PRIV_KEY',
      projectId: process.env.PROJECT_ID,
      secretId: process.env.SECRET_ID,
      chainId: 4,
      rpcUrl: 'http://0.0.0.0:8545',
    });

    /**
     * Act
     * Since we donot have a SDK function at the moment to Get NFTs,
     * we would use HttpService to do the job for us,
     * this snippet would be replaced with the actual SDK function.
     */

    const httpClient = new HttpService(NFT_API_URL, account.getApiAuth());
    const apiUrl = `${NFT_API_URL}/api/v1/networks/${account.getChainId()}/nfts/collection/0xF69c1883b098d621FC58a42E673C4bF6a6483fFf`;
    try {
      const { data } = await httpClient.get(apiUrl);

      // Assert
      expect(data.assets.length).not.toBe(null);
    } catch (error) {
      throw new Error(error).stack;
    }
  });
});
