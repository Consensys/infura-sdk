import { config as loadEnv } from 'dotenv';
import ganache from 'ganache';
import { BigNumber, utils } from 'ethers';
import Auth from '../src/lib/Auth/Auth';
import SDK from '../src/lib/SDK/sdk';
import { TEMPLATES } from '../src/lib/NFT/constants';

loadEnv();
let sdk;
let account;
let server;
let contractObject;
let publicAddress;
let owner;
let thirdUser;
let privateKeyPublicAddress;

describe('E2E Test: Basic NFT (write)', () => {
  jest.setTimeout(120 * 1000);

  beforeAll(async () => {
    const options = {
      wallet: {
        accountKeysPath: 'integration-test/keys.json',
      },
    };

    // server = ganache.server(options);
    // await server.listen(8545);

    // grab the first account
    // eslint-disable-next-line global-require
    //const { addresses: addr, private_keys: pk } = require('./keys.json');
    //[owner, publicAddress, thirdUser] = Object.keys(addr);
    const privateKey = process.env.WALLET_PRIVATE_KEY;
    //privateKeyPublicAddress = pk[publicAddress];

    const rpcUrl = process.env.EVM_RPC_URL;
    const chainId = 5;
    const projectId = process.env.INFURA_PROJECT_ID;
    const secretId = process.env.INFURA_PROJECT_SECRET;
    //const IPFS = { IPFSProjectID: '', IPFSProjectSecret: '' };

    account = new Auth({
      privateKey,
      projectId,
      secretId,
      chainId,
    });

    sdk = new SDK(account);
    contractObject = await sdk.deploy({
      template: TEMPLATES.ERC721Mintable,
      params: {
        name: 'Cool Contract',
        symbol: 'CC',
        contractURI: 'URI',
      },
    });
  });

  //   afterAll(async () => {
  //     await server.close();
  //   });

  it('should return deployed contract', async () => {
    expect(contractObject.contractAddress).not.toBe(null);
  });
});
