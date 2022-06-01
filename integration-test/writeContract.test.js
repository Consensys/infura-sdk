import { config as loadEnv } from 'dotenv';
import ganache from 'ganache';
import Auth from '../lib/Auth/Auth';
import SDK from '../lib/SDK/sdk';
import { TEMPLATES } from '../lib/NFT/constants';
import { CONTRACT_ADDRESS } from '../test/__mocks__/utils';

loadEnv();
let sdk;
let account;
let server;
let contractObject;

const rpcUrl = process.env.RPC_URL;
const chainId = 4;
const projectId = process.env.PROJECT_ID;
const secretId = process.env.SECRET_ID;
const privateKey = process.env.PRIVATE_KEY;
const IPFS = { IPFSProjectID: '', IPFSProjectSecret: '' };

const accountRinkeby = new Auth({
  privateKey,
  projectId,
  secretId,
  rpcUrl,
  chainId,
  IPFS,
});

const sdkRinkeby = new SDK(accountRinkeby);

describe('E2E Test: Basic NFT (write)', () => {
  jest.setTimeout(120 * 1000);

  beforeAll(async () => {
    const options = {
      wallet: {
        accountKeysPath: 'integration-test/keys.json',
      },
    };

    server = ganache.server(options);
    await server.listen(8545);

    // grab the first account
    // eslint-disable-next-line global-require
    const { addresses: addr, private_keys: pk } = require('./keys.json');
    const owner = Object.keys(addr)[0];
    const privateKey = pk[owner];

    const rpcUrl = 'http://0.0.0.0:8545';
    const chainId = 4;
    const projectId = process.env.PROJECT_ID;
    const secretId = process.env.SECRET_ID;
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
  });

  afterAll(async () => {
    await server.close();
  });

  it('should return deployed contract', async () => {
    const contractObject = await sdk.deploy({
      template: TEMPLATES.ERC721Mintable,
      params: {
        name: 'Cool Contract',
        symbol: 'CC',
        contractURI: 'URI',
      },
    });
    expect(contractObject).not.toBe(null);
  });

  it('should return loaded contract', async () => {
    const contractObject = await sdk.loadContract({
      template: TEMPLATES.ERC721Mintable,
      contractAddress: CONTRACT_ADDRESS,
    });

    expect(contractObject).not.toBe(null);
  });

  it('should mint nft', async () => {
    contractObject = await sdkRinkeby.deploy({
      template: TEMPLATES.ERC721Mintable,
      params: {
        name: 'Cool Contract',
        symbol: 'CC',
        contractURI: 'URI',
      },
    });

    const tx = await contractObject.mint(
      process.env.PUBLIC_ADDRESS,
      'https://ipfs.io/ipfs/QmRfModHffFedTkHSW1ZEn8f19MdPztn9WV3kY1yjaKvBy',
    );

    const receipt = await tx.wait();

    expect(receipt.status).toEqual(1);
  });

  it('should transfer nft', async () => {
    const tx = await contractObject.transfer({
      from: process.env.PUBLIC_ADDRESS,
      to: '0xF6402e8fD69153a86c75a9995E527E549fd5707a',
      tokenId: 0,
    });

    const receipt = await tx.wait();

    expect(receipt.status).toEqual(1);
  });

  it('should set contract URI', async () => {
    const contractObject = await sdk.loadContract({
      template: TEMPLATES.ERC721Mintable,
      contractAddress: CONTRACT_ADDRESS,
    });

    const tx = await contractObject.setContractURI(
      'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
    );
    const receipt = await tx.wait();
    expect(receipt.status).toEqual(1);
  });
});
