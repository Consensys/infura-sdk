import { config as loadEnv } from 'dotenv';
import { ethers } from 'ethers';
import Provider from '../src/lib/Provider/Provider';

loadEnv();

describe('Provider', () => {
  it('should return the provider', () => {
    const rpcUrl = process.env.EVM_RPC_URL;

    expect(JSON.stringify(Provider.getProvider(rpcUrl))).toStrictEqual(
      JSON.stringify(ethers.providers.getDefaultProvider(rpcUrl) as ethers.providers.BaseProvider),
    );
  });

  it('should return the injected provider', () => {
    expect(
      JSON.stringify(
        Provider.getInjectedProvider(
          ethers.providers.Provider as ethers.providers.ExternalProvider,
        ),
      ),
    ).toStrictEqual(
      JSON.stringify(
        new ethers.providers.Web3Provider(
          ethers.providers.Provider as ethers.providers.ExternalProvider,
        ),
      ),
    );
  });
});
