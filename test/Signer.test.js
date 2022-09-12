import { config as loadEnv } from 'dotenv';
import { ethers } from 'ethers';

import Signer from '../src/lib/Signer/Signer.js';
import { generateTestPrivateKeyOrHash } from './__mocks__/utils.js';
import { errorLogger, ERROR_LOG } from '../src/lib/error/handler.js';

loadEnv();

describe('Signer', () => {
  describe('getWallet', () => {
    it('should throw when args are missing (privateKey)', () => {
      expect(() => Signer.getWallet(null, ethers.providers.Provider)).toThrow(
        errorLogger({
          location: ERROR_LOG.location.Signer_constructor,
          message: ERROR_LOG.message.no_privateKey,
        }),
      );
    });

    it('should throw when args are missing (provider)', () => {
      expect(() => Signer.getWallet('privateKey', null)).toThrow(
        errorLogger({
          location: ERROR_LOG.location.Signer_constructor,
          message: ERROR_LOG.message.no_provider,
        }),
      );
    });

    it('should return the signer', () => {
      const privateKey = generateTestPrivateKeyOrHash();
      const provider = new ethers.providers.Web3Provider(ethers.providers.Provider);

      expect(JSON.stringify(Signer.getWallet(privateKey, provider))).toStrictEqual(
        JSON.stringify(new ethers.Wallet(privateKey, provider)),
      );
    });
  });
});
