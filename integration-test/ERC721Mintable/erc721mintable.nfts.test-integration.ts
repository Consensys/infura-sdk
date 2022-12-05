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
let successfulTx: string;

describe('E2E Test: Basic NFT (mint)', () => {
  jest.setTimeout(120 * 1000);

  beforeAll(async () => {
    // grab the first account
    // eslint-disable-next-line global-require
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

  it('should mint nft', async () => {
    const tx = await contractObject.mint({
      publicAddress: owner,
      tokenURI: 'https://ipfs.io/ipfs/QmRfModHffFedTkHSW1ZEn8f19MdPztn9WV3kY1yjaKvBy',
    });

    const receipt = await tx.wait();
    successfulTx = receipt.transactionHash;

    expect(receipt.status).toEqual(1);
  });

  it('should return details of transaction', async () => {
    const txStatus = await sdk.getStatus({ txHash: successfulTx });
    expect(txStatus.status).toEqual(1);
    expect(txStatus.from.toLowerCase()).toEqual(owner);
  });

  it('should not transfer nft if your are not the owner', async () => {
    const tx = await contractObject.baseERC721.transfer({
      from: thirdUser,
      to: publicAddress,
      tokenId: 0,
    });

    const txDetails = await sdk.getStatus({ txHash: tx.hash });

    expect(txDetails.status).toEqual(0);
  });

  it('should transfer nft', async () => {
    const tx = await contractObject.baseERC721.transfer({
      from: owner,
      to: publicAddress,
      tokenId: 0,
    });

    const receipt = await tx.wait();
    expect(receipt.status).toEqual(1);
    expect(receipt.from.toLowerCase()).toEqual(owner);
    expect(receipt.to.toLowerCase()).toEqual(contractObject.contractAddress.toLowerCase());
  });
});
