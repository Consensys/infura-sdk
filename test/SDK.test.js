// import { config as loadEnv } from 'dotenv';
import Auth from '../lib/Auth/index.js';
import SDK from '../lib/SDK/index.js';
import ContractFactory from '../lib/NFT/contractFactory.js';
import { TEMPLATES } from '../lib/NFT/constants.js';

let sdk;
let account;

describe('SDK', () => {
  beforeAll(() => {
    const privateKey = 'privateKey';
    const rpcUrl = 'rpcUrl';
    const chainId = '4';
    const projectId = 'projectID';
    const secretId = 'secretId';
    const IPFS = { IPFSProjectID: '', IPFSProjectSecret: '' };

    account = new Auth({
      privateKey,
      projectId,
      secretId,
      rpcUrl,
      chainId,
      IPFS,
    });

    jest.spyOn(account, 'getProvider').mockImplementation(() => ({}));
    jest.spyOn(account, 'getSigner').mockImplementation(() => ({}));

    account.getProvider();

    sdk = new SDK(account);
  });

  it('should return correct template', async () => {
    jest.spyOn(ContractFactory, 'factory').mockImplementation(() => ({
      deploy: () => ({
        address: 'contractAdress',
      }),
    }));

    const contract = await sdk.deploy({
      template: TEMPLATES.NFTContractCollection,
      params: {
        name: 'name',
        symbol: 'symbol',
      },
    });

    expect(contract).not.toBe(null);
  });

  it('should return error if name is not provided', async () => {
    jest.spyOn(ContractFactory, 'factory').mockImplementation(() => ({
      deploy: () => ({
        address: 'contractAdress',
      }),
    }));

    const t = async () =>
      // eslint-disable-next-line implicit-arrow-linebreak
      sdk.deploy({ template: TEMPLATES.NFTContractCollection, params: { name: null } });

    expect(t).rejects.toThrow('Name is mandatory');
  });
});
