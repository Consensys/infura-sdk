import { config as loadEnv } from 'dotenv';
import { ethers } from 'ethers';
import Auth from '../lib/Auth/Auth.js';
import Provider from '../lib/Provider/Provider.js';
import { generateTestPrivateKey } from './__mocks__/utils.js';

loadEnv();

describe('Auth', () => {
  it('should throw when args are missing (privateKey)', () => {
    expect(
      () =>
        // eslint-disable-next-line implicit-arrow-linebreak
        new Auth({
          privateKey: null,
          projectId: process.env.INFURA_PROJECT_ID,
          secretId: process.env.INFURA_PROJECT_SECRET,
          rpcUrl: process.env.EVM_RPC_URL,
          chainId: 5,
        }),
    ).toThrow('[Auth.constructor] privateKey is missing!');
  });

  it('should throw when args are missing (projectId)', () => {
    expect(
      () =>
        // eslint-disable-next-line implicit-arrow-linebreak
        new Auth({
          privateKey: 'privateKey',
          secretId: process.env.INFURA_PROJECT_SECRET,
          rpcUrl: process.env.EVM_RPC_URL,
          chainId: 5,
        }),
    ).toThrow('[Auth.constructor] projectId is missing!');
  });

  it('should throw when args are missing (secretId)', () => {
    expect(
      () =>
        // eslint-disable-next-line implicit-arrow-linebreak
        new Auth({
          privateKey: 'privateKey',
          projectId: process.env.INFURA_PROJECT_ID,
          rpcUrl: process.env.EVM_RPC_URL,
          chainId: 5,
        }),
    ).toThrow('[Auth.constructor] secretId is missing!');
  });

  it('should throw when args are missing (chainId)', () => {
    expect(
      () =>
        // eslint-disable-next-line implicit-arrow-linebreak
        new Auth({
          privateKey: 'privateKey',
          projectId: process.env.INFURA_PROJECT_ID,
          secretId: process.env.INFURA_PROJECT_SECRET,
          rpcUrl: process.env.EVM_RPC_URL,
        }),
    ).toThrow('[Auth.constructor] chainId is missing!');
  });

  it('should throw when chainId is not supported', () => {
    expect(
      () =>
        new Auth({
          privateKey: 'privateKey',
          projectId: process.env.INFURA_PROJECT_ID,
          secretId: process.env.INFURA_PROJECT_SECRET,
          rpcUrl: process.env.EVM_RPC_URL,
          chainId: 6,
        }),
    ).toThrow('[Auth.constructor] chainId: 6 is not supported!');
  });

  describe('setInjectedProvider', () => {
    it("Should throw when we don't pass the injectedProvider parameter", () => {
      const account = new Auth({
        privateKey: 'privateKey',
        projectId: process.env.INFURA_PROJECT_ID,
        secretId: process.env.INFURA_PROJECT_SECRET,
        rpcUrl: process.env.EVM_RPC_URL,
        chainId: 5,
      });

      expect(() => account.setInjectedProvider()).toThrow(
        '[Auth.setInjectedProvider] You need to pass an injected provider to this function!',
      );
    });
    it("Should return default provider when we don't pass the injectedProvider parameter", () => {
      const account = new Auth({
        privateKey: 'privateKey',
        projectId: process.env.INFURA_PROJECT_ID,
        secretId: process.env.INFURA_PROJECT_SECRET,
        rpcUrl: process.env.EVM_RPC_URL,
        chainId: 5,
      });

      expect(account.setInjectedProvider(ethers.providers.Provider)).toStrictEqual(
        new ethers.providers.Web3Provider(ethers.providers.Provider),
      );
    });
  });

  describe('getSigner', () => {
    it('should return the signer', () => {
      const privateKey = generateTestPrivateKey();
      const account = new Auth({
        privateKey,
        projectId: process.env.INFURA_PROJECT_ID,
        secretId: process.env.INFURA_PROJECT_SECRET,
        rpcUrl: process.env.EVM_RPC_URL,
        chainId: 5,
      });
      const provider = Provider.getProvider(process.env.EVM_RPC_URL);

      // eslint-disable-next-line new-cap
      expect(provider).toStrictEqual(
        new ethers.providers.getDefaultProvider(process.env.EVM_RPC_URL),
      );
      expect(JSON.stringify(account.getSigner())).toStrictEqual(
        JSON.stringify(new ethers.Wallet(privateKey, provider)),
      );
    });
  });

  describe('getApiAuth', () => {
    it('should return the apiAuth key', () => {
      const account = new Auth({
        privateKey: 'privateKey',
        projectId: process.env.INFURA_PROJECT_ID,
        secretId: process.env.INFURA_PROJECT_SECRET,
        rpcUrl: process.env.EVM_RPC_URL,
        chainId: 5,
      });

      expect(account.getApiAuth()).toStrictEqual(
        Buffer.from(
          `${process.env.INFURA_PROJECT_ID}:${process.env.INFURA_PROJECT_SECRET}`,
        ).toString('base64'),
      );
    });
  });

  describe('getChainId', () => {
    it('should return the chainId', () => {
      const account = new Auth({
        privateKey: 'privateKey',
        projectId: process.env.INFURA_PROJECT_ID,
        secretId: process.env.INFURA_PROJECT_SECRET,
        rpcUrl: process.env.EVM_RPC_URL,
        chainId: 5,
      });

      expect(account.getChainId()).toStrictEqual(5);
    });
  });

  describe('getApiAuthHeader', () => {
    it('should return the chainId', () => {
      const account = new Auth({
        privateKey: 'privateKey',
        projectId: process.env.INFURA_PROJECT_ID,
        secretId: process.env.INFURA_PROJECT_SECRET,
        rpcUrl: process.env.EVM_RPC_URL,
        chainId: 5,
      });

      expect(account.getApiAuthHeader()).toStrictEqual({
        Authorization: `Basic ${Buffer.from(
          `${process.env.INFURA_PROJECT_ID}:${process.env.INFURA_PROJECT_SECRET}`,
        ).toString('base64')}`,
      });
    });
  });
});
