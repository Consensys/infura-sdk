import IPFS from '../src/lib/IPFS/ipfs';
import { config as loadEnv } from 'dotenv';
import path from 'path';
const file = path.join(__dirname, 'ipfs-test/infura.png');
const folder = 'integration-test/ipfs-test';
const unexistingFile = path.join(__dirname, 'infura-fake.png');

loadEnv();
describe('E2E Test: IPFS Service', () => {
  jest.setTimeout(120 * 1000);
  let ipfs;
  let uploadedFileHash;
  let uploadedDirectoryHash;

  beforeAll(async () => {
    ipfs = new IPFS({
      projectId: process.env.INFURA_IPFS_PROJECT_ID,
      projectSecret: process.env.INFURA_IPFS_PROJECT_SECRET,
      ipfsUrl: process.env.INFURA_IPFS_ENDPOINT,
    });
  });

  it('should upload image from local file', async () => {
    const hash = await ipfs.uploadFile({
      source: file,
    });
    uploadedFileHash = hash;

    expect(hash).toBe('QmbuNrChRcADV4NVvDo2yctWu4Gt9atpVUC74ZsVqRw5uJ');
  });

  it('should upload a directory', async () => {
    const hash = await ipfs.uploadDirectory({
      source: folder,
    });

    uploadedDirectoryHash = hash;

    expect(hash).toBe('Qmd3oKEr4c3QA2QGXfanxSnY37XKrtqCzhon1XoV9a1YbR');
  });

  it('should not upload image from an unexisting local file', () => {
    expect(
      async () =>
        await ipfs.uploadFile({
          source: unexistingFile,
        }),
    ).rejects.toThrow();
  });

  it('should unpin first image', async () => {
    const { Hash: hashUnpinFile } = await ipfs.unPinFile({
      hash: uploadedFileHash,
    });

    expect(hashUnpinFile).not.toBe(null);
  });

  it('should unpin the created directory', async () => {
    const { Hash: hashUnpinFile } = await ipfs.unPinFile({
      hash: uploadedDirectoryHash,
    });

    expect(hashUnpinFile).not.toBe(null);
  });

  it('should throw error if the hash is not valid', async () => {
    expect(
      async () =>
        await ipfs.unPinFile({
          hash: 'test',
        }),
    ).rejects.toThrow(`invalid path "test": illegal base32 data at input byte 0`);
  });
});
