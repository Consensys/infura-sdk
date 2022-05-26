import { config as loadEnv } from 'dotenv';
import Auth from '../lib/Auth/Auth';
import SDK from '../lib/SDK/sdk';
import { TEMPLATES } from '../lib/NFT/constants';
import { CONTRACT_ADDRESS } from '../test/__mocks__/utils';

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
