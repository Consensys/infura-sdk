import { ExternallyOwnedAccount } from '../lib/NFT/externallyOwnedAccount';
import { config as loadEnv } from 'dotenv';
loadEnv();

let externallyOwnedAccount;
describe('ExternallyOwnedAccount', () => {
  beforeAll(() => {
    externallyOwnedAccount = new ExternallyOwnedAccount({
      privateKey: process.env.PRIVATE_KEY,
      apiKey: process.env.API_KEY,
      rpcUrl: 'https://rinkeby.infura.io/v3/86d4a35c8d7b4509983f9f6d0623656f',
    });
  });

  it('should create smart contract', async () => {
    const contract = await externallyOwnedAccount.createSmartContract('name', 'symbol');
    expect(contract).not.toBe(null);
  });
});
