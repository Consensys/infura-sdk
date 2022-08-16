import IPFS from '../src/lib/IPFS/ipfs';
import { config as loadEnv } from 'dotenv';
import path from 'path';
import { faker } from '@faker-js/faker';
const file = path.join(__dirname, 'infura.png');
const unexistingFile = path.join(__dirname, 'infura-fake.png');

loadEnv();
describe('E2E Test: IPFS Service', () => {
  jest.setTimeout(120 * 1000);
  let ipfs;
  let uploadedFileHash1;
  let uploadedFileHash2;

  beforeAll(async () => {
    ipfs = new IPFS({
      ipfsUrl: process.env.INFURA_IPFS_ENDPOINT,
    });
  });
  it.only('should upload image from url', async () => {
    const { Hash: hashFromUrl } = await ipfs.uploadFile({
      name: faker.datatype.string(),
      source: 'https://www.ledger.com/wp-content/uploads/2019/06/assets_logo_metamask.jpg',
    });

    uploadedFileHash1 = hashFromUrl;

    expect(hashFromUrl).not.toBe(null);
  });

  it('should upload image from local file', async () => {
    const { Hash: hashFromLocalFile } = await ipfs.uploadFile({
      name: faker.datatype.string(),
      source: file,
    });
    uploadedFileHash2 = hashFromLocalFile;

    expect(hashFromLocalFile).not.toBe(null);
  });

  it('should not upload image from an unexisting local file', () => {
    expect(
      async () =>
        await ipfs.uploadFile({
          name: faker.datatype.string(),
          source: unexistingFile,
        }),
    ).rejects.toThrow();
  });

  it('should unpin first image', async () => {
    const { Hash: hashUnpinFile1 } = await ipfs.unPinFile({
      hash: uploadedFileHash1,
    });

    expect(hashUnpinFile1).not.toBe(null);
  });

  it('should unpin second image', async () => {
    const { Hash: hashUnpinFile2 } = await ipfs.unPinFile({
      hash: uploadedFileHash2,
    });

    expect(hashUnpinFile2).not.toBe(null);
  });
});
