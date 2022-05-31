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
});
