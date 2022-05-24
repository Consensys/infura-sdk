import { config as loadEnv } from 'dotenv';
import Auth from '../lib/Auth/index.js';
import SDK from '../lib/SDK/index.js';
import { TEMPLATES } from '../lib/NFT/constants.js';

loadEnv();
let sdk;
let account;

describe('E2E Test: Basic NFT (write)', () => {
  jest.setTimeout(120 * 1000);

  beforeAll(async () => {
    const privateKey = process.env.PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL;
    const chainId = '4';
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

    account.getProvider();

    sdk = new SDK(account);
  });

  it('should return deployed contract', async () => {
    const contractObject = await sdk.deploy({
      template: TEMPLATES.NFTContractCollection,
      params: {
        name: 'Cool Contract', // mandatory
        symbol: 'CC', // optional
        contractURI: 'ipfs://...', // optional
      },
    });

    expect(contractObject.address).not.ToBe(null);
  });
});
