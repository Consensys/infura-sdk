import { ExternallyOwnedAccount } from '../lib/NFT/externallyOwnedAccount';
import { addresses, private_keys } from './keys.json';
import { config as loadEnv } from 'dotenv';
loadEnv();

describe('Onchain interaction', () => {
  let externallyOwnedAccount;
  let contract;
  let publicAddress;

  beforeAll(async () => {
    // grab the first account
    const acc = Object.keys(addresses)[0];
    const PRIV_KEY = private_keys[acc];

    // grab the second account for publicAddress
    publicAddress = Object.keys(addresses)[1];

    // create the apiKey
    const apiKey = Buffer.from(`${process.env.PROJECT_ID}:${process.env.SECRET_ID}`).toString(
      'base64',
    );
    // call the constructor with Ganache blockchain
    externallyOwnedAccount = new ExternallyOwnedAccount({
      privateKey: PRIV_KEY,
      apiKey,
      rpcUrl: 'http://localhost:8545',
      chainId: 4,
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

  it('should return list of NFTs by address', async () => {
    const nfts = await externallyOwnedAccount.getNFTs('0xF69c1883b098d621FC58a42E673C4bF6a6483fFf');
    expect(nfts.assets.length).not.toBe(null);
  });

  it('should mint Nfts inside an existing contract', async () => {
    const nfts = await externallyOwnedAccount.mintNft({
      contractAddress: contract.address,
      publicAddress,
      NFTUrl: 'https://infura.io/images/404.png',
    });
    expect(nfts.hash).not.toBe(null);
  });
});
