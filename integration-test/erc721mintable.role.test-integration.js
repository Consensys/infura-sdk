import { config as loadEnv } from 'dotenv';
import Auth from '../src/lib/Auth/Auth';
import SDK from '../src/lib/SDK/sdk';
import { TEMPLATES } from '../src/lib/NFT/constants';
import { faker } from '@faker-js/faker';

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

  it('should Grant & check Minter role', async () => {
    // grant minter role
    const tx = await contractObject.addMinter({ publicAddress });
    const receipt = await tx.wait();

    // // check minter role
    const isMinter = await contractObject.isMinter({ publicAddress });

    expect(receipt.status).toEqual(1);
    expect(isMinter).toEqual(true);
  });

  it('should Grant & revoke & check Minter role', async () => {
    // grant minter role
    const tx = await contractObject.addMinter({ publicAddress });
    const receipt = await tx.wait();

    // revoke minter role
    const tx2 = await contractObject.removeMinter({ publicAddress });
    const receipt2 = await tx2.wait();

    // // check minter role
    const isMinter = await contractObject.isMinter({ publicAddress });

    expect(receipt.status).toEqual(1);
    expect(receipt2.status).toEqual(1);
    expect(isMinter).toEqual(false);
  });

  it('should Grant & renounce & check Minter role', async () => {
    // grant minter role
    const tx = await contractObject.addMinter({ publicAddress });
    const receipt = await tx.wait();

    // renounce minter role
    const accountPublic = new Auth({
      privateKey: privateKeyPublicAddress,
      projectId: process.env.INFURA_PROJECT_ID,
      secretId: process.env.INFURA_PROJECT_SECRET,
      rpcUrl: 'http://0.0.0.0:8545',
      chainId: 5,
    });

    const sdkPublic = new SDK(accountPublic);
    const existing = await sdkPublic.loadContract({
      template: TEMPLATES.ERC721Mintable,
      contractAddress: contractObject.contractAddress,
    });

    const tx2 = await existing.renounceMinter({ publicAddress });
    const receipt2 = await tx2.wait();

    // // check minter role
    const isMinter = await contractObject.isMinter({ publicAddress });

    expect(receipt.status).toEqual(1);
    expect(receipt2.status).toEqual(1);
    expect(isMinter).toEqual(false);
  });

  it('should set approval for all', async () => {
    const loadedContractObject = await sdk.loadContract({
      template: TEMPLATES.ERC721Mintable,
      contractAddress: contractObject.contractAddress,
    });
    const tx = await loadedContractObject.setApprovalForAll({
      to: publicAddress,
      approvalStatus: true,
    });
    const receipt = await tx.wait();

    expect(receipt.status).toEqual(1);
  });

  it('should grant & check Admin role', async () => {
    const tx = await contractObject.addAdmin({ publicAddress });
    const receipt = await tx.wait();

    const isAdmin = await contractObject.isAdmin({ publicAddress });

    expect(receipt.status).toEqual(1);
    expect(isAdmin).toEqual(true);
  });

  it('should grant & revoke & check Admin role', async () => {
    const tx = await contractObject.addAdmin({ publicAddress });
    const receipt = await tx.wait();

    const tx2 = await contractObject.removeAdmin({ publicAddress });
    const receipt2 = await tx2.wait();

    const isAdmin = await contractObject.isAdmin({ publicAddress });

    expect(receipt.status).toEqual(1);
    expect(receipt2.status).toEqual(1);
    expect(isAdmin).toEqual(false);
  });

  it('should grant & renounce & check Admin role', async () => {
    const tx = await contractObject.addAdmin({ publicAddress });
    const receipt = await tx.wait();

    const accountPublic = new Auth({
      privateKey: privateKeyPublicAddress,
      projectId: process.env.INFURA_PROJECT_ID,
      secretId: process.env.INFURA_PROJECT_SECRET,
      rpcUrl: 'http://0.0.0.0:8545',
      chainId: 5,
    });

    const sdkPublic = new SDK(accountPublic);
    const existing = await sdkPublic.loadContract({
      template: TEMPLATES.ERC721Mintable,
      contractAddress: contractObject.contractAddress,
    });

    const tx2 = await existing.renounceAdmin({ publicAddress });
    const receipt2 = await tx2.wait();

    const isAdmin = await contractObject.isAdmin({ publicAddress });

    expect(receipt.status).toEqual(1);
    expect(receipt2.status).toEqual(1);
    expect(isAdmin).toEqual(false);
  });

  it('should renounce contract ownership', async () => {
    const result = await contractObject.renounceOwnership();
    const receipt = await result.wait();

    expect(receipt.status).toBe(1);
  });
});
