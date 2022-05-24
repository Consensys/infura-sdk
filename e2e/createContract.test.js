/* eslint-disable prefer-destructuring */
import { config as loadEnv } from 'dotenv';
import ganache from 'ganache';
import { ExternallyOwnedAccount } from '../lib/NFT/externallyOwnedAccount';
import { ethers } from 'ethers';
import fs from 'fs';
import Auth from '../lib/Auth';

loadEnv();
const smartContractArtifact = JSON.parse(fs.readFileSync('ERC721.json'));

describe('E2E Test: Basic NFT', () => {
  jest.setTimeout(120 * 1000);
  let externallyOwnedAccount;
  let contractAbstraction;
  let contract;
  let owner;
  let publicAddress;
  let server;
  let deployTransaction;
  let PRIV_KEY;
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
    PRIV_KEY = pk[owner];
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
    deployTransaction = await contract.deployTransaction.wait();
    expect(contract.address).not.toBeUndefined();
    expect(contract.address).toContain('0x');
    expect(deployTransaction.confirmations).toBeGreaterThanOrEqual(1);
    expect(deployTransaction.from.toLowerCase()).toBe(owner);
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
    const mintdata = await mint.wait();
    expect(mint.hash).not.toBeUndefined();
    expect(mintdata.confirmations).toBeGreaterThanOrEqual(1);
    const owner = await contract.ownerOf(0);
    expect(owner.toLowerCase()).toBe(publicAddress.toLowerCase());
  });

  it('should return list of NFTs by address', async () => {
    const nfts = await externallyOwnedAccount.getNFTs(publicAddress);
    expect(nfts.assets.length).not.toBe(null);
  });

  it('should get contract', async () => {
    const currentContract = await externallyOwnedAccount.getContract(contract.address);
    expect(currentContract.mintWithTokenURI).not.toBe(null);
  });

  it('Given an Auth instance with valid rpcUrl, i should be able to deploy a contract', async () => {
    console.log(PRIV_KEY);
    const account = new Auth({
      privateKey: PRIV_KEY,
      projectId: process.env.PROJECT_ID,
      secretId: process.env.SECRET_ID,
      rpcUrl: 'http://0.0.0.0:8545',
      chainId: 4,
    });

    account.getProvider();
    const factory = new ethers.ContractFactory(
      smartContractArtifact.abi,
      smartContractArtifact.bytecode,
      account.getSigner(),
    );

    const contract = await factory.deploy(`Name${Math.random()}`, `symbol${Math.random()}`);
    await contract.deployed();
    deployTransaction = await contract.deployTransaction.wait();
    expect(contract.address).not.toBeUndefined();
    expect(contract.address).toContain('0x');
    expect(deployTransaction.confirmations).toBeGreaterThanOrEqual(1);
    expect(deployTransaction.from.toLowerCase()).toBe(owner);
  });
});

describe('E2E Test: Auth test with injected provider', () => {
  jest.setTimeout(120 * 1000);
  let deployTransaction;
  let PRIV_KEY;
  let ganacheProvider;
  let owner;

  beforeAll(async () => {
    const options = {
      wallet: {
        accountKeysPath: 'e2e/keys2.json',
      },
    };

    //use ganache provider to inject into Auth
    ganacheProvider = ganache.provider(options);
    await ganacheProvider.once('connect');

    // grab the first account
    // eslint-disable-next-line global-require
    const { addresses: addr, private_keys: pk } = require('./keys2.json');
    owner = Object.keys(addr)[0];
    PRIV_KEY = pk[owner];
  });

  it('Given an Auth instance with valid injected provider and empty rpcUrl, i should be able to deploy a contract', async () => {
    const account = new Auth({
      privateKey: PRIV_KEY,
      projectId: process.env.PROJECT_ID,
      secretId: process.env.SECRET_ID,
      chainId: 4,
    });

    account.getProvider(ganacheProvider);
    const factory = new ethers.ContractFactory(
      smartContractArtifact.abi,
      smartContractArtifact.bytecode,
      account.getSigner(),
    );

    const contract = await factory.deploy(`ProviderTestName`, `ProviderTestSymbol`);
    await contract.deployed();
    deployTransaction = await contract.deployTransaction.wait();
    expect(contract.address).not.toBeUndefined();
    expect(contract.address).toContain('0x');
    expect(deployTransaction.confirmations).toBeGreaterThanOrEqual(1);
    expect(deployTransaction.from.toLowerCase()).toBe(owner);
  });
});
