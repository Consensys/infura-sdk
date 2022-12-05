import { config as loadEnv } from 'dotenv';
import { ethers } from 'ethers';
import Signer from '../src/lib/Signer/Signer';
import { generateTestPrivateKeyOrHash } from './__mocks__/utils';

loadEnv();

describe('Signer', () => {
  describe('getWallet', () => {
    it('should return the signer', () => {
      const privateKey = generateTestPrivateKeyOrHash();
      const provider = new ethers.providers.Web3Provider(
        ethers.providers.Provider as ethers.providers.ExternalProvider,
      );

      expect(JSON.stringify(Signer.getWallet(privateKey, provider))).toStrictEqual(
        JSON.stringify(new ethers.Wallet(privateKey, provider)),
      );
    });
  });
});
