import Auth from '../../src/lib/Auth/Auth';
import { SDK } from '../../src/lib/SDK/sdk';
import Metadata from '../../src/lib/Metadata/Metadata';
import { config as loadEnv } from 'dotenv';
import version from '../../src/_version';
// import { sleep } from '../../src/lib/utils';

loadEnv();
describe('E2E Test: sdk store', () => {
  jest.setTimeout(120 * 1000);

  let accountWithIpfs: Auth;
  let sdkWithIpfs: SDK;
  let owner: string;

  beforeAll(() => {
    const { addresses: addr, private_keys: pk } = require('../keys.json');
    [owner] = Object.keys(addr);
    const privateKey = pk[owner];

    const rpcUrl = 'http://0.0.0.0:8545';
    const chainId = 5;
    const projectId = process.env.INFURA_PROJECT_ID;
    const secretId = process.env.INFURA_PROJECT_SECRET;
    const ipfs = {
      projectId: process.env.INFURA_IPFS_PROJECT_ID,
      apiKeySecret: process.env.INFURA_IPFS_PROJECT_SECRET,
    };

    accountWithIpfs = new Auth({
      privateKey,
      projectId,
      secretId,
      rpcUrl,
      chainId,
      ipfs,
    });

    sdkWithIpfs = new SDK(accountWithIpfs);
  });

  it('should fail to store openSea array if param is string', async () => {
    expect(
      async () => await sdkWithIpfs.createFolder({ metadata: ['test'], isErc1155: true }),
    ).rejects.toThrow(
      `data must be a valid json (location=\"[SDK.createFolder]\", argument=\"data\", value=\"test\", code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('should store openSea array token standard metadata', async () => {
    const getHash = await sdkWithIpfs.createFolder({
      metadata: [
        Metadata.openSeaTokenLevelStandard({
          description: 'Friendly OpenSea Creature that enjoys long swims in the ocean.',
          external_url: 'https://openseacreatures.io/3',
          image: await sdkWithIpfs.storeFile({
            metadata: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
          }),
          name: 'Dave Starbelly',
          attributes: [],
        }),
        Metadata.openSeaTokenLevelStandard({
          description: 'Friendly OpenSea Creature that enjoys long swims in the ocean.',
          external_url: 'https://openseacreatures.io/3',
          image: await sdkWithIpfs.storeFile({
            metadata: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
          }),
          name: 'Dave Starbelly',
          attributes: [],
        }),
      ],
      isErc1155: true,
    });

    expect(getHash).toBe('ipfs://QmSA116Mqdxj5qx1cVpMrfkxhynft61jSYWvrfUawH5CYw/');
  });
});
