import { config as loadEnv } from 'dotenv';
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
let thirdUser: string;
let privateKeyPublicAddress: string;

describe('E2E Test: Basic NFT (mint)', () => {
  jest.setTimeout(120 * 1000);

  beforeAll(async () => {
    // grab the first account
    const { addresses: addr, private_keys: pk } = require('../keys.json');
    [owner, publicAddress, thirdUser] = Object.keys(addr);
    const privateKey = pk[owner];
    privateKeyPublicAddress = pk[publicAddress];

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

  it('should return deployed contract', async () => {
    expect(contractObject.contractAddress).not.toBe(null);
    expect(contractObject.contractAddress).toContain('0x');
  });

  it('should return loaded contract', async () => {
    const loadedContract = await sdk.loadContract({
      template: TEMPLATES.ERC721Mintable,
      contractAddress: contractObject.contractAddress,
    });

    expect(loadedContract).not.toBe(null);
    expect(loadedContract.contractAddress).toEqual(contractObject.contractAddress);
    expect(loadedContract).toBeInstanceOf(ERC721Mintable);
  });

  it('should set contract URI', async () => {
    const tx = await contractObject.setContractURI({
      contractURI:
        'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
    });
    const receipt = await tx.wait();
    expect(receipt.status).toEqual(1);
  });

  it('should renounce contract ownership', async () => {
    const result = await contractObject.baseERC721.renounceOwnership({});
    const receipt = await result.wait();

    expect(receipt.status).toBe(1);
  });
});
