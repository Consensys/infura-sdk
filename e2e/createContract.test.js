/* eslint-disable prefer-destructuring */
import { config as loadEnv } from 'dotenv';
import ganache from 'ganache';
import { ExternallyOwnedAccount } from '../lib/NFT/externallyOwnedAccount';

loadEnv();

describe('E2E Test: Basic NFT', () => {
  jest.setTimeout(120 * 1000);
  let externallyOwnedAccount;
  let contractAbstraction;
  let contract;
  let owner;
  let publicAddress;
  let server;
  const NFTImage = 'https://infura.io/images/404.png';

  beforeAll(async () => {
    const options = {
      wallet: {
        accountKeysPath: 'e2e/keys.json',
      },
    };

    server = ganache.server(options);
    await server.listen(8545);

    // grab the first account
    // eslint-disable-next-line global-require
    const { addresses: addr, private_keys: pk } = require('./keys.json');
    owner = Object.keys(addr)[0];
    const PRIV_KEY = pk[owner];

    // grab the second account as publicAddress
    publicAddress = Object.keys(addr)[1];

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
    contractAbstraction = externallyOwnedAccount.createSmartContract('name', 'symbol');
  });

  afterAll(async () => {
    await server.close();
  });

  it('(Implementation) should return the contract abstraction', () => {
    expect(contractAbstraction.deploy).not.toBe(null);
  });

  it('As a Contract Owner I should be able to deploy the contract', async () => {
    contract = await contractAbstraction.deploy();

    expect(contract.address).not.toBeUndefined();
    expect(contract.address).toContain('0x');
    expect(contract.deployTransaction.from.toLowerCase()).toBe(owner);
  });

  it('(Implementation) should get contract', async () => {
    const currentContract = await externallyOwnedAccount.getContract(contract.address);
    expect(currentContract.mintWithTokenURI).not.toBe(null);
  });

  it('As a Contract Owner I should provide the name and symbol of the collection', async () => {
    const name = await contract.name();
    const symbol = await contract.symbol();
    expect(name).toBe('name');
    expect(symbol).toBe('symbol');
  });

  // As a Contract Owner I shoud set the NFT’s metadata at mint time
  it('As a Contract Owner I should be able to mint a NFT', async () => {
    const mint = await contractAbstraction.mint(publicAddress, NFTImage);
    expect(mint.hash).not.toBeUndefined();
  });
});
