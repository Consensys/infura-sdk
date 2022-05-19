import { ExternallyOwnedAccount } from '../lib/NFT/externallyOwnedAccount';
import { config as loadEnv } from 'dotenv';
import ganache from 'ganache';
loadEnv();

describe('Onchain interaction', () => {
  jest.setTimeout(120 * 1000);
  let externallyOwnedAccount;
  let contractAbstraction;
  let contract;
  let publicAddress;
  let server;
  const NFTImage = 'https://infura.io/images/404.png';

  beforeAll(async () => {
    const options = {
      wallet: {
        accountKeysPath: 'e2e/keys.json',
      },
    };
    try {
      server = ganache.server(options);
      await server.listen(8545);
      console.log('ganache listening ...');
      // grab the first account
      const keys = require('./keys.json');
      const acc = Object.keys(keys.addresses)[0];
      const PRIV_KEY = keys.private_keys[acc];
      console.log(PRIV_KEY);
      console.log(acc);

      // grab the second account for publicAddress
      publicAddress = Object.keys(keys.addresses)[1];

      // create the apiKey
      const apiKey = Buffer.from(`${process.env.PROJECT_ID}:${process.env.SECRET_ID}`).toString(
        'base64',
      );

      // call the constructor with Ganache blockchain
      externallyOwnedAccount = new ExternallyOwnedAccount({
        privateKey: PRIV_KEY,
        apiKey,
        rpcUrl: 'http://0.0.0.0:8545',
        chainId: 4,
      });
      contractAbstraction = await externallyOwnedAccount.createSmartContract('name', 'symbol');
    } catch (error) {
      throw error;
    }
  });

  afterAll(async () => {
    await server.close();
  });

  it('should return the contract abstraction', () => {
    expect(contractAbstraction.deploy).not.toBe(null);
  });

  it('should deploy the contract', async () => {
    contract = await contractAbstraction.deploy();
    expect(contract.address).not.toBeUndefined();
    expect(contract.address).toContain('0x');
  });

  it('should have a name and a symbol', async () => {
    const name = await contract.name();
    const symbol = await contract.symbol();
    expect(name).toBe('name');
    expect(symbol).toBe('symbol');
  });

  it('should mint', async () => {
    const mint = await contractAbstraction.mint(publicAddress, NFTImage);
    expect(mint.hash).not.toBeUndefined();
  });

  it('should return list of NFTs by address', async () => {
    const nfts = await externallyOwnedAccount.getNFTs(publicAddress);
    expect(nfts.assets.length).not.toBe(null);
  });

  it('should get contract', async () => {
    const currentContract = await externallyOwnedAccount.getContract(contract.address);
    expect(contract.mintWithTokenURI).not.toBe(null);
  });
});
