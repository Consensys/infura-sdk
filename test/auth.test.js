import { config as loadEnv } from 'dotenv';
import { ethers } from 'ethers';
import Auth from '../src/lib/Auth/Auth.js';
import Provider from '../src/lib/Provider/Provider.js';
import { generateTestPrivateKeyOrHash } from './__mocks__/utils.js';
import ganache from 'ganache';
import { getChainName } from '../src/lib/Auth/availableChains.js';
import { errorLogger, ERROR_LOG } from '../src/lib/error/handler.js';

loadEnv();

class FakeProvider {}

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
    ).toThrow(
      errorLogger({
        location: ERROR_LOG.location.Auth_constructor,
        message: ERROR_LOG.message.no_parameters_supplied,
      }),
    );
  });

  it('should throw when passing both privateKey and provider', () => {
    expect(
      () =>
        // eslint-disable-next-line implicit-arrow-linebreak
        new Auth({
          privateKey: generateTestPrivateKeyOrHash(),
          projectId: process.env.INFURA_PROJECT_ID,
          secretId: process.env.INFURA_PROJECT_SECRET,
          rpcUrl: process.env.EVM_RPC_URL,
          chainId: 5,
          provider: ethers.providers.Provider,
        }),
    ).toThrow(
      errorLogger({
        location: ERROR_LOG.location.Auth_constructor,
        message: ERROR_LOG.message.only_privateKey_or_provider_required,
      }),
    );
  });

  it('should throw when passing invalid provider', () => {
    expect(
      () =>
        // eslint-disable-next-line implicit-arrow-linebreak
        new Auth({
          projectId: process.env.INFURA_PROJECT_ID,
          secretId: process.env.INFURA_PROJECT_SECRET,
          rpcUrl: process.env.EVM_RPC_URL,
          chainId: 5,
          provider: new FakeProvider(),
        }),
    ).toThrow(
      errorLogger({
        location: ERROR_LOG.location.Provider_getInjectedProvider,
        message: ERROR_LOG.message.invalid_provider,
      }),
    );
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
    ).toThrow(
      errorLogger({
        location: ERROR_LOG.location.Auth_constructor,
        message: ERROR_LOG.message.no_projectId_supplied,
      }),
    );
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
    ).toThrow(
      errorLogger({
        location: ERROR_LOG.location.Auth_constructor,
        message: ERROR_LOG.message.no_secretId_supplied,
      }),
    );
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
    ).toThrow(
      errorLogger({
        location: ERROR_LOG.location.Auth_constructor,
        message: ERROR_LOG.message.no_chainId_supplied,
      }),
    );
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
    ).toThrow(
      errorLogger({
        location: ERROR_LOG.location.Auth_constructor,
        message: ERROR_LOG.message.chain_not_supported,
      }),
    );
  });

  describe('getSigner', () => {
    let ganacheProvider;
    beforeAll(async () => {
      ganacheProvider = ganache.provider();
      await ganacheProvider.once('connect');
    });

    afterAll(async () => {
      ganacheProvider.clearListeners();
      await ganacheProvider.disconnect();
    });

    it('should return the signer using private key and rpc_url', async () => {
      const privateKey = generateTestPrivateKeyOrHash();
      const account = new Auth({
        privateKey,
        projectId: process.env.INFURA_PROJECT_ID,
        secretId: process.env.INFURA_PROJECT_SECRET,
        rpcUrl: process.env.EVM_RPC_URL,
        chainId: 5,
      });
      const provider = Provider.getProvider(process.env.EVM_RPC_URL);
      const signer = await account.getSigner();

      expect(JSON.stringify(signer)).toStrictEqual(
        JSON.stringify(new ethers.Wallet(privateKey, provider)),
      );
    });

    it('should return the signer using passed provider', async () => {
      const account = new Auth({
        projectId: process.env.INFURA_PROJECT_ID,
        secretId: process.env.INFURA_PROJECT_SECRET,
        rpcUrl: process.env.EVM_RPC_URL,
        chainId: 5,
        provider: ganacheProvider,
      });

      const signer = await new ethers.providers.Web3Provider(ganacheProvider).getSigner();
      const authSigner = await account.getSigner();

      expect(JSON.stringify(authSigner)).toStrictEqual(JSON.stringify(signer));
    });
  });

  describe('getApiAuth', () => {
    it('should return the apiAuth key', () => {
      const account = new Auth({
        privateKey: generateTestPrivateKeyOrHash(),
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
        privateKey: generateTestPrivateKeyOrHash(),
        projectId: process.env.INFURA_PROJECT_ID,
        secretId: process.env.INFURA_PROJECT_SECRET,
        rpcUrl: process.env.EVM_RPC_URL,
        chainId: 5,
      });

      expect(account.getChainId()).toStrictEqual(5);
    });
  });

  describe('getRpcUrl', () => {
    it('should return the rpcUrl', () => {
      const account = new Auth({
        privateKey: 'privateKey',
        projectId: process.env.INFURA_PROJECT_ID,
        secretId: process.env.INFURA_PROJECT_SECRET,
        rpcUrl: process.env.EVM_RPC_URL,
        chainId: 5,
      });

      expect(account.getRpcUrl()).toStrictEqual(process.env.EVM_RPC_URL);
    });
  });

  describe('rpcUrl', () => {
    it('Auth should construct correct RpcURL, if no rpcUrl is provided', () => {
      const defaultRpcUrl = `https://${getChainName(5)}.infura.io/v3/${
        process.env.INFURA_PROJECT_ID
      }`;

      const account = new Auth({
        privateKey: 'privateKey',
        projectId: process.env.INFURA_PROJECT_ID,
        secretId: process.env.INFURA_PROJECT_SECRET,
        chainId: 5,
      });

      expect(account.getRpcUrl()).toStrictEqual(defaultRpcUrl);
    });
  });

  describe('getApiAuthHeader', () => {
    it('should return the chainId', () => {
      const account = new Auth({
        privateKey: generateTestPrivateKeyOrHash(),
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
