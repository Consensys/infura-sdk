import { config as loadEnv } from 'dotenv';
// import { faker } from '@faker-js/faker';
import path from 'path';

import IPFS from '../src/services/ipfsService';
import IpfsServerClient from '../e2e/utils/utils.ts/ipfsServerClient';

const file = path.join(__dirname, 'ipfs-test/consensys.png');

loadEnv();

const unexistingFile = path.join(__dirname, 'infura-fake.png');

describe('ipfs', () => {
  let ipfs: IPFS;
  const projectId = process.env.INFURA_IPFS_PROJECT_ID;
  const apiKeySecret = process.env.INFURA_IPFS_PROJECT_SECRET;

  const IpfsServerClientMockAdd = jest
    .spyOn(IpfsServerClient.prototype, 'add')
    .mockImplementation(async () => 'test');

  const IpfsServerClientMockAddAll = jest
    .spyOn(IpfsServerClient.prototype, 'addAll')
    .mockImplementation(async () => 'test');

  beforeAll(async () => {
    ipfs = new IPFS({ projectId, apiKeySecret });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not instanciate ipfs without project id', async () => {
    expect(() => new IPFS({ projectId: undefined, apiKeySecret })).toThrow();
  });

  it('should not instanciate ipfs without project secret', async () => {
    expect(() => new IPFS({ projectId, apiKeySecret: undefined })).toThrow();
  });

  it('should upload local file', async () => {
    await ipfs.uploadFile({
      source: file,
    });

    expect(IpfsServerClientMockAdd).toHaveBeenCalledTimes(1);
  });

  it('should upload remote file', async () => {
    await ipfs.uploadFile({
      source: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
    });

    expect(IpfsServerClientMockAdd).toHaveBeenCalledTimes(1);
  });

  it('should upload an array', async () => {
    await ipfs.uploadArray({
      sources: [
        {
          source: {
            name: 'my object',
            description: 'My description',
          },
        },
      ],
      isErc1155: true,
    });

    expect(IpfsServerClientMockAddAll).toHaveBeenCalledTimes(1);
  });

  it('should upload content', async () => {
    await ipfs.uploadContent({
      source: 'test',
    });

    expect(IpfsServerClientMockAdd).toHaveBeenCalledTimes(1);
  });

  it('should not upload unexisting file', async () => {
    expect(
      async () =>
        await ipfs.uploadFile({
          source: unexistingFile,
        }),
    ).rejects.toThrow();
  });
});
