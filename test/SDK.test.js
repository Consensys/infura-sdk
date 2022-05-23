import { config as loadEnv } from 'dotenv';
import SDK from '../lib/NFT/SDK';
import Auth from '../lib/Auth';

loadEnv();

describe('SDK', () => {
  jest.setTimeout(120 * 1000);

  let sdk;
  beforeAll(() => {
    const account = new Auth({
      privateKey: 'privateKey',
      projectId: process.env.PROJECT_ID,
      secretId: process.env.SECRET_ID,
      rpcUrl: process.env.RPC_URL,
      chainId: 4,
    });
    sdk = new SDK(account);
  });

  it('should throw when args are missing auth instance', () => {
    expect(() => new SDK(1)).toThrow(
      '[SDK.constructor] You need to pass a valid instance of Auth class!',
    );
  });
});
