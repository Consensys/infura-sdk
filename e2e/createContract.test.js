import { ExternallyOwnedAccount } from '../lib/NFT/externallyOwnedAccount';
import { addresses, private_keys } from './keys.json';

describe('Onchain interaction', () => {
  let externallyOwnedAccount;
  let contract;

  beforeAll(async () => {
    // grab the first account
    const acc = Object.keys(addresses)[0];
    const PRIV_KEY = private_keys[acc];

    // call the constructor with Ganache blockchain
    externallyOwnedAccount = new ExternallyOwnedAccount({
      privateKey: PRIV_KEY,
      apiKey: btoa(`${process.env.PROJECT_ID}:${process.env.SECRET_ID}`),
      rpcUrl: 'http://localhost:8545',
    });
    contract = await externallyOwnedAccount.createSmartContract('name', 'symbol');
  });

  it('should return the contract', () => {
    expect(contract.address).not.toBeUndefined();
    expect(contract.address).toContain('0x');
  });

  it('should have a name and a symbol', async () => {
    const name = await contract.name();
    const symbol = await contract.symbol();
    expect(name).toBe('name');
    expect(symbol).toBe('symbol');
  });
});
