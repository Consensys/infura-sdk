import { config as loadEnv } from 'dotenv';
import Auth from '../lib/Auth/Auth';
import SDK from '../lib/SDK/sdk';
import { TEMPLATES } from '../lib/NFT/constants';

loadEnv();
let sdk;
let account;

describe('E2E Test: Basic NFT (write)', () => {
  jest.setTimeout(120 * 1000);

  beforeAll(async () => {
    const privateKey = process.env.PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL;
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
});
