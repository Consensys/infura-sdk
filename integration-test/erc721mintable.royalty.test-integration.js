import { config as loadEnv } from 'dotenv';
import { faker } from '@faker-js/faker';
import { BigNumber, utils } from 'ethers';

import Auth from '../src/lib/Auth/Auth';
import SDK from '../src/lib/SDK/sdk';
import { TEMPLATES } from '../src/lib/NFT/constants';

loadEnv();
let sdk;
let account;
let contractObject;
let publicAddress;
let owner;
let thirdUser;
let privateKeyPublicAddress;

describe('E2E Test: Basic NFT (mint)', () => {
  jest.setTimeout(120 * 1000);

  beforeAll(async () => {
    // grab the first account
    // eslint-disable-next-line global-require
    const { addresses: addr, private_keys: pk } = require('./keys.json');
    [owner, publicAddress, thirdUser] = Object.keys(addr);
    const privateKey = pk[owner];
    privateKeyPublicAddress = pk[publicAddress];

    const rpcUrl = 'http://0.0.0.0:8545';
    const chainId = 5;
    const projectId = process.env.INFURA_PROJECT_ID;
    const secretId = process.env.INFURA_PROJECT_SECRET;
    const IPFS = { IPFSProjectID: '', IPFSProjectSecret: '' };

    account = new Auth({
      privateKey,
      projectId,
      secretId,
      rpcUrl,
      chainId,
      IPFS,
    });

    sdk = new SDK(account);
    contractObject = await sdk.deploy({
      template: TEMPLATES.ERC721Mintable,
      params: {
        name: 'Cool Contract',
        symbol: 'CC',
        contractURI: faker.internet.url(),
      },
    });
  });

  it('should return setRoyalties', async () => {
    await contractObject.setRoyalties({ publicAddress, fee: 1000 });
    const infos = await contractObject.royaltyInfo({ tokenId: 1, sellPrice: 10 });

    expect(infos).toStrictEqual([utils.getAddress(publicAddress), BigNumber.from('1')]);
  });

  it('should return setRoyalties when tokenId is zero', async () => {
    await contractObject.setRoyalties({ publicAddress, fee: 1000 });
    const infos = await contractObject.royaltyInfo({ tokenId: 0, sellPrice: 10 });

    expect(infos).toStrictEqual([utils.getAddress(publicAddress), BigNumber.from('1')]);
  });
});
