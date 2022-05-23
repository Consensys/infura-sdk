import { config as loadEnv } from 'dotenv';
import { ethers } from 'ethers';
import Auth from '../lib/Auth/Auth';

loadEnv();

describe('Auth', () => {
  it('should throw when args are missing (privateKey)', () => {
    expect(
      () =>
        new Auth({
          privateKey: null,
          projectId: process.env.PROJECT_ID,
          secretId: process.env.SECRET_ID,
          rpcUrl: process.env.RPC_URL,
          chainId: 4,
        }),
    ).toThrow('[Auth.constructor] privateKey is missing!');
  });

  it('should throw when args are missing (projectId)', () => {
    expect(
      () =>
        new Auth({
          privateKey: 'privateKey',
          secretId: process.env.SECRET_ID,
          rpcUrl: process.env.RPC_URL,
          chainId: 4,
        }),
    ).toThrow('[Auth.constructor] projectId is missing!');
  });

  it('should throw when args are missing (secretId)', () => {
    expect(
      () =>
        new Auth({
          privateKey: 'privateKey',
          projectId: process.env.PROJECT_ID,
          rpcUrl: process.env.RPC_URL,
          chainId: 4,
        }),
    ).toThrow('[Auth.constructor] secretId is missing!');
  });

  it('should throw when args are missing (chainId)', () => {
    expect(
      () =>
        new Auth({
          privateKey: 'privateKey',
          projectId: process.env.PROJECT_ID,
          secretId: process.env.SECRET_ID,
          rpcUrl: process.env.RPC_URL,
        }),
    ).toThrow('[Auth.constructor] chainId is missing!');
  });

  it('should throw when chainId is not supported', () => {
    expect(
      () =>
        new Auth({
          privateKey: 'privateKey',
          projectId: process.env.PROJECT_ID,
          secretId: process.env.SECRET_ID,
          rpcUrl: process.env.RPC_URL,
          chainId: 6,
        }),
    ).toThrow('[Auth.constructor] chainId: 6 is not supported!');
  });

  describe('getProvider', () => {
    it("Should return default provider when we don't pass the injectedProvider parameter", () => {
      const account = new Auth({
        privateKey: 'privateKey',
        projectId: process.env.PROJECT_ID,
        secretId: process.env.SECRET_ID,
        rpcUrl: process.env.RPC_URL,
        chainId: 4,
      });

      expect(account.getProvider()).toStrictEqual(
        new ethers.providers.getDefaultProvider(process.env.RPC_URL),
      );
    });
  });

  describe('setInjectedProvider', () => {
    it("Should throw when we don't pass the injectedProvider parameter", () => {
      const account = new Auth({
        privateKey: 'privateKey',
        projectId: process.env.PROJECT_ID,
        secretId: process.env.SECRET_ID,
        rpcUrl: process.env.RPC_URL,
        chainId: 4,
      });

      expect(() => account.setInjectedProvider()).toThrow(
        '[Auth.setInjectedProvider] You need to pass an injected provider to this function!',
      );
    });
    it("Should return default provider when we don't pass the injectedProvider parameter", () => {
      const account = new Auth({
        privateKey: 'privateKey',
        projectId: process.env.PROJECT_ID,
        secretId: process.env.SECRET_ID,
        rpcUrl: process.env.RPC_URL,
        chainId: 4,
      });

      expect(account.setInjectedProvider(ethers.providers.Provider)).toStrictEqual(
        new ethers.providers.Web3Provider(ethers.providers.Provider),
      );
    });
  });

  describe('getSigner', () => {
    it('should return the signer', () => {
      const privateKey = '0xb40c8233a0c61ddf064e83b0cc29522b1e6ac6166965861fbc6cefdecbf53d63';
      const account = new Auth({
        privateKey: '0xb40c8233a0c61ddf064e83b0cc29522b1e6ac6166965861fbc6cefdecbf53d63',
        projectId: process.env.PROJECT_ID,
        secretId: process.env.SECRET_ID,
        rpcUrl: process.env.RPC_URL,
        chainId: 4,
      });
      const provider = account.getProvider();

      expect(provider).toStrictEqual(new ethers.providers.getDefaultProvider(process.env.RPC_URL));
      expect(JSON.stringify(account.getSigner())).toStrictEqual(
        JSON.stringify(new ethers.Wallet(privateKey, provider)),
      );
    });
  });

  describe('getApiAuth', () => {
    it('should return the apiAuth key', () => {
      const account = new Auth({
        privateKey: 'privateKey',
        projectId: process.env.PROJECT_ID,
        secretId: process.env.SECRET_ID,
        rpcUrl: process.env.RPC_URL,
        chainId: 4,
      });

      expect(account.getApiAuth()).toStrictEqual(
        Buffer.from(`${process.env.PROJECT_ID}:${process.env.SECRET_ID}`).toString('base64'),
      );
    });
  });

  describe('getChainId', () => {
    it('should return the chainId', () => {
      const account = new Auth({
        privateKey: 'privateKey',
        projectId: process.env.PROJECT_ID,
        secretId: process.env.SECRET_ID,
        rpcUrl: process.env.RPC_URL,
        chainId: 4,
      });

      expect(account.getChainId()).toStrictEqual(4);
    });
  });

  describe('getApiAuthHeader', () => {
    it('should return the chainId', () => {
      const account = new Auth({
        privateKey: 'privateKey',
        projectId: process.env.PROJECT_ID,
        secretId: process.env.SECRET_ID,
        rpcUrl: process.env.RPC_URL,
        chainId: 4,
      });

      expect(account.getApiAuthHeader()).toStrictEqual({
        Authorization: `Basic ${Buffer.from(
          `${process.env.PROJECT_ID}:${process.env.SECRET_ID}`,
        ).toString('base64')}`,
      });
    });
  });
});
