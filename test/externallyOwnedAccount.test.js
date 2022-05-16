import { ExternallyOwnedAccount } from '../lib/NFT/externallyOwnedAccount';
import { config as loadEnv } from 'dotenv';
loadEnv();

describe('ExternallyOwnedAccount', () => {
  jest.setTimeout(120 * 1000);
  let contractAbstraction;

  const NFTImage = 'https://infura.io/images/404.png';

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
