import { config as loadEnv } from 'dotenv';
import { ethers } from 'ethers';
import Signer from '../lib/Signer/Signer.js';
import { generateTestPrivateKey } from './__mocks__/utils.js';

loadEnv();

describe('Signer', () => {
  describe('getWallet', () => {
    it('should throw when args are missing (privateKey)', () => {
      expect(() => Signer.getWallet(null, ethers.providers.Provider)).toThrow(
        '[Signer.constructor] privateKey is missing!',
      );
    });

    it('should throw when args are missing (provider)', () => {
      expect(() => Signer.getWallet('privateKey', null)).toThrow(
        '[Signer.constructor] provider is missing!',
      );
    });

    it('should return the signer', () => {
      const privateKey = generateTestPrivateKey();
      const provider = new ethers.providers.Web3Provider(ethers.providers.Provider);

      expect(JSON.stringify(Signer.getWallet(privateKey, provider))).toStrictEqual(
        JSON.stringify(new ethers.Wallet(privateKey, provider)),
      );
    });
  });
});
