/* eslint-disable prefer-destructuring */
import { config as loadEnv } from 'dotenv';
import ganache from 'ganache';
import { ethers } from 'ethers';
import fs from 'fs';
import { ExternallyOwnedAccount } from '../lib/NFT/externallyOwnedAccount';
import Auth from '../lib/Auth';

loadEnv();
const smartContractArtifact = JSON.parse(fs.readFileSync('ERC721.json'));

/**
 * Every feature-test file resembles a Test Suite, and would be wrapped inside ONE Describe function
 */
describe('Feature Test: Basic NFT', () => {
  jest.setTimeout(120 * 1000);
  let externallyOwnedAccount;
  let contractAbstraction;
  let contract;
  let owner;
  let publicAddress;
  let server;
  let deployTransaction;
  let PRIV_KEY;
  let ganacheProvider;
  const NFTImage = 'https://infura.io/images/404.png';

  // Arrange
  beforeAll(async () => {
    const options = {
      wallet: {
        accountKeysPath: 'feature-test/keys.json',
      },
    };

    server = ganache.server(options);
    await server.listen(8545);
    ganacheProvider = server.provider;

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
  });

  afterAll(async () => {
    await server.close();
  });

  it('Given a valid account, I should be able to create a contract abstraction', () => {
    // Act
    contractAbstraction = externallyOwnedAccount.createSmartContract('name', 'symbol');

    // Assert
    expect(contractAbstraction.deploy).not.toBe(null);
  });

  it('Given a valid contact abstraction, As a Contract Owner I should be able to deploy a contract', async () => {
    // Act
    contract = await contractAbstraction.deploy();
    deployTransaction = await contract.deployTransaction.wait();

    // Assert
    expect(contract.address).not.toBeUndefined();
    expect(contract.address).toContain('0x');
    expect(deployTransaction.confirmations).toBeGreaterThanOrEqual(1);
    expect(deployTransaction.from.toLowerCase()).toBe(owner);
  });

  it('Given a contract was deployed with success, i should be able to fetch the contract', async () => {
    // Act
    const currentContract = await externallyOwnedAccount.getContract(contract.address);
    const name = await contract.name();
    const symbol = await contract.symbol();

    // Assert
    expect(currentContract.mintWithTokenURI).not.toBe(null);
    expect(name).toBe('name');
    expect(symbol).toBe('symbol');
  });

  it('Given a valid contact abstraction, As a Contract Owner I should be able to mint a NFT', async () => {
    // Act
    const mint = await contractAbstraction.mint(publicAddress, NFTImage);
    const mintdata = await mint.wait();
    owner = await contract.ownerOf(0);

    // Assert
    expect(mint.hash).not.toBeUndefined();
    expect(mintdata.confirmations).toBeGreaterThanOrEqual(1);
    expect(owner.toLowerCase()).toBe(publicAddress.toLowerCase());
  });

  it('Given an Auth instance with valid rpcUrl, i should be able to deploy a contract', async () => {
    // Arrange
    const account = new Auth({
      privateKey: PRIV_KEY,
      projectId: process.env.PROJECT_ID,
      secretId: process.env.SECRET_ID,
      rpcUrl: 'http://0.0.0.0:8545',
      chainId: 4,
    });
    account.getProvider();

    /**
     * Act
     * Since we donot have a SDK function at the moment to deploy a contract,
     * we would use etherJs to do the job for us,
     * this snippet would be replaced with the actual SDK function.
     */
    const factory = new ethers.ContractFactory(
      smartContractArtifact.abi,
      smartContractArtifact.bytecode,
      account.getSigner(),
    );
    contract = await factory.deploy(`Name${Math.random()}`, `symbol${Math.random()}`);
    await contract.deployed();

    // Assert
    expect(contract.address).not.toBeUndefined();
    expect(contract.address).toContain('0x');
  });

  it('Given an Auth instance with valid injected provider and empty rpcUrl, i should be able to deploy a contract', async () => {
    // Arrange
    const account = new Auth({
      privateKey: PRIV_KEY,
      projectId: process.env.PROJECT_ID,
      secretId: process.env.SECRET_ID,
      chainId: 4,
    });
    // Use injected provider
    account.getProvider(ganacheProvider);

    /**
     * Act
     * Since we donot have a SDK function at the moment to deploy a contract,
     * we would use etherJs to do the job for us,
     * this snippet would be replaced with the actual SDK function.
     */
    const factory = new ethers.ContractFactory(
      smartContractArtifact.abi,
      smartContractArtifact.bytecode,
      account.getSigner(),
    );
    contract = await factory.deploy('ProviderTestName', 'ProviderTestSymbol');
    await contract.deployed();
    deployTransaction = await contract.deployTransaction.wait();

    // Assert
    expect(contract.address).not.toBeUndefined();
    expect(contract.address).toContain('0x');
  });
});
