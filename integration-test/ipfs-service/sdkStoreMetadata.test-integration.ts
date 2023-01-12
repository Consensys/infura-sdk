import Auth from '../../src/lib/Auth/Auth';
import { SDK } from '../../src/lib/SDK/sdk';
import Metadata from '../../src/lib/Metadata/Metadata';
import { config as loadEnv } from 'dotenv';
import version from '../../src/_version';
// import { sleep } from '../../src/lib/utils';

loadEnv();
describe.skip('E2E Test: sdk store', () => {
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

  it('should store openSea contract standard metadata', async () => {
    const hash = await sdkWithIpfs.storeMetadata({
      metadata: Metadata.openSeaCollectionLevelStandard({
        name: 'My awesome collection',
        description: "A long description explaining why it's awesome",
        image: await sdkWithIpfs.storeFile({
          metadata: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
        }),
        external_link: 'https://myawesomewebsite.net',
      }),
    });
    expect(hash).toBe('ipfs://QmZ75v2TmpBhV37TnvUwynjygiecQbZDY7F6N5c84576GX');
  });

  it('should store openSea token standard metadata', async () => {
    const hash = await sdkWithIpfs.storeMetadata({
      metadata: Metadata.openSeaTokenLevelStandard({
        description: 'Friendly OpenSea Creature that enjoys long swims in the ocean.',
        external_url: 'https://openseacreatures.io/3',
        image: await sdkWithIpfs.storeFile({
          metadata: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
        }),
        name: 'Dave Starbelly',
        attributes: [],
      }),
    });
    expect(hash).toBe('ipfs://QmUrDwbA9XBvhRsc5LDQUz3pxEHypUESNy6jxLXw1UgaTS');
  });

  it('should store free level metadata', async () => {
    const hash = await sdkWithIpfs.storeMetadata({
      metadata: Metadata.freeLevelMetadata({
        key: 'test',
      }),
    });

    expect(hash).toBe('ipfs://QmUAKAJZvyBuvMX9VqwfhS1K7iyPhR1ZWnT9AQXcovrMkn');
  });

  it('should throw error if json is not valid', async () => {
    const getHash = async () =>
      await sdkWithIpfs.createFolder({
        metadata: ['test'],
        isErc1155: true,
      });

    expect(getHash).rejects.toThrow(
      `data must be a valid json (location=\"[SDK.createFolder]\", argument=\"data\", value=\"test\", code=INVALID_ARGUMENT, version=${version})`,
    );
  });
});
