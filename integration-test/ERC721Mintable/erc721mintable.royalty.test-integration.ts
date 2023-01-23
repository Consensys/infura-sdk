import { config as loadEnv } from 'dotenv';
import { BigNumber, utils } from 'ethers';
import Auth from '../../src/lib/Auth/Auth';
import { SDK } from '../../src/lib/SDK/sdk';
import { TEMPLATES } from '../../src/lib/constants';
import ERC721Mintable from '../../src/lib/ContractTemplates/ERC721Mintable';
import { faker } from '@faker-js/faker';

loadEnv();
let sdk: SDK;
let account: Auth;
let contractObject: ERC721Mintable;
let publicAddress: string;
let owner: string;

describe('E2E Test: Basic NFT (mint)', () => {
  jest.setTimeout(120 * 1000);

  beforeAll(async () => {
    // grab the first account
    // eslint-disable-next-line global-require
    const { addresses: addr, private_keys: pk } = require('../keys.json');
    [owner, publicAddress] = Object.keys(addr);
    const privateKey = pk[owner];

    const rpcUrl = 'http://0.0.0.0:8545';
    const chainId = 5;
    const projectId = process.env.INFURA_PROJECT_ID;
    const secretId = process.env.INFURA_PROJECT_SECRET;

    account = new Auth({
      privateKey,
      projectId,
      secretId,
      rpcUrl,
      chainId,
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
    await contractObject.royalty.setRoyalties({ publicAddress, fee: 1000 });
    const infos = await contractObject.royalty.royaltyInfo({ tokenId: 1, sellPrice: 10 });

    expect(infos).toStrictEqual([utils.getAddress(publicAddress), BigNumber.from('1')]);
  });

  it('should return setRoyalties when tokenId is zero', async () => {
    await contractObject.royalty.setRoyalties({ publicAddress, fee: 1000 });
    const infos = await contractObject.royalty.royaltyInfo({ tokenId: 0, sellPrice: 10 });

    expect(infos).toStrictEqual([utils.getAddress(publicAddress), BigNumber.from('1')]);
  });
});
