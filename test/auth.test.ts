import { config as loadEnv } from 'dotenv';
import { ethers } from 'ethers';
import ganache from 'ganache';
import Auth from '../src/lib/Auth/Auth';
import Provider from '../src/lib/Provider/Provider';
import { generateTestPrivateKeyOrHash } from './__mocks__/utils';
import { getChainName } from '../src/lib/Auth/availableChains';
import version from '../src/_version';

loadEnv();

class FakeProvider {}

describe('Auth', () => {
  it('should throw when passing both privateKey and provider', () => {
    expect(
      () =>
        new Auth({
          privateKey: generateTestPrivateKeyOrHash(),
          projectId: process.env.INFURA_PROJECT_ID,
          secretId: process.env.INFURA_PROJECT_SECRET,
          rpcUrl: process.env.EVM_RPC_URL,
          chainId: 5,
          provider: ethers.providers.Provider as ethers.providers.ExternalProvider,
        }),
    ).toThrow(
      `too many arguments: Only privateKey or provider required (location="[Auth.constructor]", code=UNEXPECTED_ARGUMENT, version=${version})`,
    );
  });

  it('should throw when passing invalid provider', () => {
    expect(
      () =>
        new Auth({
          projectId: process.env.INFURA_PROJECT_ID,
          secretId: process.env.INFURA_PROJECT_SECRET,
          rpcUrl: process.env.EVM_RPC_URL,
          chainId: 5,
          provider: new FakeProvider(),
        }),
    ).toThrow(
      `Invalid provider. (location="[Provider.getInjectedProvider]", error={"reason":"unsupported provider","code":"INVALID_ARGUMENT","argument":"provider","value":{}}, argument="injectedProvider", value={}, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('should throw when passing infuraProvider', () => {
    expect(
      () =>
        new Auth({
          projectId: process.env.INFURA_PROJECT_ID,
          secretId: process.env.INFURA_PROJECT_SECRET,
          rpcUrl: process.env.EVM_RPC_URL,
          chainId: 5,
          provider: new ethers.providers.InfuraProvider(
            5,
            process.env.INFURA_PROJECT_ID,
          ) as unknown as ethers.providers.ExternalProvider,
        }),
    ).toThrow(
      `unsupported provider (location=\"[Auth.setProvider]\", error=\"unsupported provider\", argument=\"provider\", value=\"ethers.providers.InfuraProvider\", code=INVALID_ARGUMENT, version=${version})`,
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
      `Chain not supported. (location="[Auth.constructor]", argument="chainId", value=6, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  describe('getSigner', () => {
    let ganacheProvider: any;
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
