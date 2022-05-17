import { config as loadEnv } from 'dotenv';
import { ExternallyOwnedAccount } from '../lib/NFT/externallyOwnedAccount';
import { HttpService } from '../services/httpService';

loadEnv();

jest.mock('ethers');

describe('ExternallyOwnedAccount', () => {
  jest.setTimeout(120 * 1000);

  it('should throw when args are missing (privateKey)', async () => {
    expect(() => {
      new ExternallyOwnedAccount({
        privateKey: null,
        apiKey: process.env.API_KEY,
        rpcUrl: 'https://rinkeby.infura.io/v3/86d4a35c8d7b4509983f9f6d0623656f',
      });
    }).toThrow('[ExternallyOwnedAccount.constructor] privateKey is missing!');
  });

  it('should throw when args are missing (apiKey)', async () => {
    expect(() => {
      new ExternallyOwnedAccount({
        privateKey: 'privatekey',
        apiKey: null,
        rpcUrl: 'https://rinkeby.infura.io/v3/86d4a35c8d7b4509983f9f6d0623656f',
      });
    }).toThrow('[ExternallyOwnedAccount.constructor] apiKey is missing!');
  });

  it('should throw when args are missing (rpcUrl)', async () => {
    expect(() => {
      new ExternallyOwnedAccount({
        privateKey: 'privatekey',
        apiKey: 'apikey',
        rpcUrl: null,
      });
    }).toThrow('[ExternallyOwnedAccount.constructor] rpcUrl is missing!');
  });

  describe('getSymbol', () => {
    it('should throw when contractAddress === null', async () => {
      const account = new ExternallyOwnedAccount({
        privateKey: 'privatekey',
        apiKey: 'apikey',
        rpcUrl: 'https://rinkeby.infura.io/v3/86d4a35c8d7b4509983f9f6d0623656f',
      });
      await expect(account.getSymbol(null)).rejects.toThrowError(
        new Error('contractAddress cannot be null'),
      );
    });

    it('should return the collection symbol', async () => {
      jest.spyOn(HttpService.prototype, 'get').mockResolvedValue({
        data: {
          symbol: 'SYMB',
        },
      });
      const account = new ExternallyOwnedAccount({
        privateKey: 'privatekey',
        apiKey: 'apikey',
        rpcUrl: 'https://rinkeby.infura.io/v3/86d4a35c8d7b4509983f9f6d0623656f',
      });

      expect(await account.getSymbol('0x97ed63533c9f4f50521d78e58caeb94b175f5d35')).toStrictEqual(
        'SYMB',
      );
    });
  });

  // Test present in E2E using Ganache instead of rinkeby
  // it('should create smart contract', async () => {
  //   const externallyOwnedAccount = new ExternallyOwnedAccount({
  //     privateKey: process.env.PRIVATE_KEY,
  //     apiKey: btoa(`${process.env.PROJECT_ID}:${process.env.SECRET_ID}`),
  //     rpcUrl: 'https://rinkeby.infura.io/v3/86d4a35c8d7b4509983f9f6d0623656f',
  //     chainId: '4',
  //   });
  //   contract = await externallyOwnedAccount.createSmartContract('name', 'symbol');
  //   expect(contract.address).not.toBe(null);
  // });
});
