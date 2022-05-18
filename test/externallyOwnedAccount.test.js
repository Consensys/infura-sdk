import { ethers } from 'ethers';
import { config as loadEnv } from 'dotenv';
import { ExternallyOwnedAccount } from '../lib/NFT/externallyOwnedAccount';

loadEnv();

jest.mock('ethers');

describe('ExternallyOwnedAccount', () => {
  jest.setTimeout(120 * 1000);

  it('should throw when args are missing (privateKey)', async () => {
    expect(
      () =>
        new ExternallyOwnedAccount({
          privateKey: null,
          apiKey: 'apikey',
          rpcUrl: process.env.RPC_URL,
        }),
    ).toThrow('[ExternallyOwnedAccount.constructor] privateKey is missing!');
  });

  it('should throw when args are missing (apiKey)', async () => {
    expect(
      () =>
        new ExternallyOwnedAccount({
          privateKey: 'privatekey',
          apiKey: null,
          rpcUrl: process.env.RPC_URL,
        }),
    ).toThrow('[ExternallyOwnedAccount.constructor] apiKey is missing!');
  });

  it('should throw when args are missing (rpcUrl)', async () => {
    expect(
      () =>
        new ExternallyOwnedAccount({
          privateKey: 'privatekey',
          apiKey: 'apikey',
          rpcUrl: null,
        }),
    ).toThrow('[ExternallyOwnedAccount.constructor] rpcUrl is missing!');
  });

  describe('getContractAbstraction', () => {
    it('should return an error if contractAddress is not a valid address', async () => {
      const account = new ExternallyOwnedAccount({
        privateKey: 'privatekey',
        apiKey: 'apikey',
        rpcUrl: process.env.RPC_URL,
      });

      jest.spyOn(ethers.utils, 'isAddress').mockReturnValueOnce(false);

      await expect(account.getContractAbstraction('not a valid address')).rejects.toThrowError(
        new Error(
          '[ExternallyOwnedAccount.getContractAbstraction] contractAddress is not a valid address!',
        ),
      );
    });

    it('should return the contract abstraction for this contract address', async () => {
      const account = new ExternallyOwnedAccount({
        privateKey: 'privatekey',
        apiKey: 'apikey',
        rpcUrl: process.env.RPC_URL,
      });

      jest.spyOn(ExternallyOwnedAccount.prototype, 'getContract').mockImplementationOnce(() => ({
        name: jest.fn().mockResolvedValue('testName'),
        symbol: jest.fn().mockResolvedValue('SYMB'),
      }));

      jest.spyOn(ethers.utils, 'isAddress').mockReturnValueOnce(true);

      const contract = await account.getContractAbstraction(
        '0xE26a682fa90322eC48eB9F3FA66E8961D799177C',
      );
      expect(Object.keys(contract)).toEqual(['deploy', 'mint']);
    });
  });

  // Test present in E2E using Ganache instead of rinkeby
  // it('should create smart contract', async () => {
  //   const externallyOwnedAccount = new ExternallyOwnedAccount({
  //     privateKey: process.env.PRIVATE_KEY,
  //     apiKey: btoa(`${process.env.PROJECT_ID}:${process.env.SECRET_ID}`),
  //     rpcUrl: process.env.RPC_URL,
  //     chainId: '4',
  //   });
  //   contract = await externallyOwnedAccount.createSmartContract('name', 'symbol');
  //   expect(contract.address).not.toBe(null);
  // });
});
