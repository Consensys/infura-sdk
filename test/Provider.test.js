import { ethers } from 'ethers';
import Provider from '../src/lib/Provider/Provider.js';
import { errorLogger, ERROR_LOG } from '../src/lib/error/handler.js';
import { faker } from '@faker-js/faker';

describe('Provider', () => {
  //   jest.spyOn(ethers.providers, 'getDefaultProvider').mockImplementation(() => ({}));

  it('should throw when args are missing (rpcUrl)', () => {
    expect(() => Provider.getProvider(null)).toThrow(
      errorLogger({
        location: ERROR_LOG.location.Provider_getProvider,
        message: ERROR_LOG.message.no_rpcURL,
      }),
    );
  });

  it('should return the provider', () => {
    const rpcUrl = faker.internet.url();

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
