import Auth from '../src/lib/Auth/Auth';
import SDK from '../src/lib/SDK/sdk';
import path from 'path';
import Metadata from '../src/lib/Metadata/Metadata';
import { config as loadEnv } from 'dotenv';

const file = path.join(__dirname, 'ipfs-test/infura.png');
const unexistingFile = path.join(__dirname, 'ipfs-test/infura2.png');

loadEnv();
describe('E2E Test: sdk store', () => {
  jest.setTimeout(120 * 1000);

  let accountWithoutIpfs;
  let accountWithIpfs;
  let sdkWithoutIpfs;
  let sdkWithIpfs;

  beforeAll(async () => {
    const { addresses: addr, private_keys: pk } = require('./keys.json');
    [owner, publicAddress, thirdUser] = Object.keys(addr);
    const privateKey = pk[owner];
    privateKeyPublicAddress = pk[publicAddress];

    const rpcUrl = 'http://0.0.0.0:8545';
    const chainId = 5;
    const projectId = process.env.INFURA_PROJECT_ID;
    const secretId = process.env.INFURA_PROJECT_SECRET;
    const ipfs = {
      projectId: process.env.INFURA_IPFS_PROJECT_ID,
      apiKeySecret: process.env.INFURA_IPFS_PROJECT_SECRET,
    };

    accountWithoutIpfs = new Auth({
      privateKey,
      projectId,
      secretId,
      rpcUrl,
      chainId,
    });

    accountWithIpfs = new Auth({
      privateKey,
      projectId,
      secretId,
      rpcUrl,
      chainId,
      ipfs,
    });

    sdkWithoutIpfs = new SDK(accountWithoutIpfs);
    sdkWithIpfs = new SDK(accountWithIpfs);
  });

  afterAll(() => {
    accountWithIpfs.getIpfsClient().closeConnection();
  });

  it('should not store file if the url is not a media', async () => {
    const getHash = async () => await sdkWithIpfs.storeFile('https://openseacreatures.io/3');
    expect(getHash).rejects.toThrow('[IPFS.uploadFile] Forbidden');
  });

  it('should store free level metadata', async () => {
    const getHash = async () =>
      await sdkWithIpfs.storeMetadata(
        Metadata.freeLevelMetadata({
          key: 'test',
        }),
      );

    expect(getHash).not.toThrow();
  });

  it('should store openSea contract standard metadata', async () => {
    const hash = await sdkWithIpfs.storeMetadata(
      Metadata.openSeaCollectionLevelStandard({
        name: 'My awesome collection',
        description: "A long description explaining why it's awesome",
        image: await sdkWithIpfs.storeFile(
          'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
        ),
        external_link: 'https://myawesomewebsite.net',
      }),
    );
    expect(hash).toBe('ipfs://QmZ75v2TmpBhV37TnvUwynjygiecQbZDY7F6N5c84576GX');
  });

  it('should store openSea token standard metadata', async () => {
    const hash = await sdkWithIpfs.storeMetadata(
      Metadata.openSeaTokenLevelStandard({
        description: 'Friendly OpenSea Creature that enjoys long swims in the ocean.',
        external_url: 'https://openseacreatures.io/3',
        image: await sdkWithIpfs.storeFile(
          'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
        ),
        name: 'Dave Starbelly',
        attributes: [],
      }),
    );
    expect(hash).toBe('ipfs://QmUrDwbA9XBvhRsc5LDQUz3pxEHypUESNy6jxLXw1UgaTS');
  });

  describe('baseURI', () => {
    it('should fail to store openSea array if param is string', async () => {
      const getHash = async () => await sdkWithIpfs.createFolder(['test'], true);

      expect(getHash).rejects.toThrow('[SDK.store] Data must be a valid json');
    });

    it('should store openSea array token standard metadata', async () => {
      const getHash = async () =>
        await sdkWithIpfs.createFolder(
          [
            Metadata.openSeaTokenLevelStandard({
              description: 'Friendly OpenSea Creature that enjoys long swims in the ocean.',
              external_url: 'https://openseacreatures.io/3',
              image: await sdkWithIpfs.storeFile(
                'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
              ),
              name: 'Dave Starbelly',
              attributes: [],
            }),
            Metadata.openSeaTokenLevelStandard({
              description: 'Friendly OpenSea Creature that enjoys long swims in the ocean.',
              external_url: 'https://openseacreatures.io/3',
              image: await sdkWithIpfs.storeFile(
                'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
              ),
              name: 'Dave Starbelly',
              attributes: [],
            }),
          ],
          true,
        );

      expect(getHash).not.toThrow();
    });

    it('should fail to store openSea array of contract Metadata', async () => {
      const getHash = async () =>
        await sdkWithIpfs.createFolder(
          [
            Metadata.openSeaCollectionLevelStandard({
              name: 'My awesome collection',
              description: "A long description explaining why it's awesome",
              image: await sdkWithIpfs.storeFile(
                'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
              ),
              external_link: 'https://myawesomewebsite.net',
            }),
          ],
          true,
        );

      expect(getHash).rejects.toThrow(
        '[Metadata.tokenLevelMetadata] Data must be a string or an array of metadata token object',
      );
    });
  });
});
