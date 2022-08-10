import { config as loadEnv } from 'dotenv';
import ganache from 'ganache';
import { BigNumber, utils } from 'ethers';
import Auth from '../src/lib/Auth/Auth';
import SDK from '../src/lib/SDK/sdk';
import { TEMPLATES } from '../src/lib/NFT/constants';

loadEnv();
let sdk;
let account;
let server;
let contractObject;
let publicAddress;
let owner;
let thirdUser;
let privateKeyPublicAddress;

describe('E2E Test: Basic NFT (mint)', () => {
  jest.setTimeout(120 * 1000);

  beforeAll(async () => {
    // grab the first account
    // eslint-disable-next-line global-require
    const { addresses: addr, private_keys: pk } = require('./keys.json');
    [owner, publicAddress, thirdUser] = Object.keys(addr);
    const privateKey = pk[owner];
    privateKeyPublicAddress = pk[publicAddress];

    const rpcUrl = 'http://0.0.0.0:8545';
    const chainId = 5;
    const projectId = process.env.INFURA_PROJECT_ID;
    const secretId = process.env.INFURA_PROJECT_SECRET;
    const IPFS = { IPFSProjectID: '', IPFSProjectSecret: '' };

    account = new Auth({
      privateKey,
      projectId,
      secretId,
      rpcUrl,
      chainId,
      IPFS,
    });

    sdk = new SDK(account);
    contractObject = await sdk.deploy({
      template: TEMPLATES.ERC721Mintable,
      params: {
        name: 'Cool Contract',
        symbol: 'CC',
        contractURI: 'URI',
      },
    });
  });

  it('should return deployed contract', async () => {
    expect(contractObject.contractAddress).not.toBe(null);
  });

  it('should return loaded contract', async () => {
    const loadedContract = await sdk.loadContract({
      template: TEMPLATES.ERC721Mintable,
      contractAddress: contractObject.contractAddress,
    });

    expect(loadedContract).not.toBe(null);
  });

  it('should set contract URI', async () => {
    const tx = await contractObject.setContractURI({
      contractURI:
        'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
    });
    const receipt = await tx.wait();
    expect(receipt.status).toEqual(1);
  });

  it('should renounce contract ownership', async () => {
    const result = await contractObject.renounceOwnership();
    const receipt = await result.wait();

    expect(receipt.status).toBe(1);
  });
});
