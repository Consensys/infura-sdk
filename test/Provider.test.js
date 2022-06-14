import { config as loadEnv } from 'dotenv';
import { ethers } from 'ethers';
import Provider from '../src/lib/Provider/Provider.js';

loadEnv();

let provider;
describe('Provider', () => {
  //   jest.spyOn(ethers.providers, 'getDefaultProvider').mockImplementation(() => ({}));

  it('should throw when args are missing (rpcUrl)', () => {
    expect(() => Provider.getProvider(null)).toThrow('[Provider.getProvider] rpcUrl is missing!');
  });

  it('should return the provider', () => {
    const rpcUrl = process.env.EVM_RPC_URL;

    expect(JSON.stringify(Provider.getProvider(rpcUrl))).toStrictEqual(
      JSON.stringify(new ethers.providers.getDefaultProvider(rpcUrl)),
    );
  });

  it('should return the injected provider', () => {
    expect(JSON.stringify(Provider.getInjectedProvider(ethers.providers.Provider))).toStrictEqual(
      JSON.stringify(new ethers.providers.Web3Provider(ethers.providers.Provider)),
    );
  });
});
