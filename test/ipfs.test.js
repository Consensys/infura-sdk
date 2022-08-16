import { faker } from '@faker-js/faker';
import IPFS from '../src/lib/IPFS/ipfs';
import path from 'path';
import { config as loadEnv } from 'dotenv';
const file = path.join(__dirname, 'consensys.png');
const folder = path.join(__dirname, '__mocks__');
loadEnv();

const myAsyncIterable = {
  async *[Symbol.asyncIterator]() {
    yield {
      cid: {
        toString: mockedCall,
      },
    };
  },
};

const mockedCall = jest.fn().mockImplementation(() => 'test');
const mockedRemoveCall = jest.fn().mockImplementation(() => 'test');
const mockedAddAllCall = jest.fn().mockImplementation(() => myAsyncIterable);

jest.mock('ipfs-http-client', () => ({
  globSource: () => [],
  create: jest.fn(() => ({
    add: jest.fn(() => ({
      cid: {
        toString: mockedCall,
      },
    })),

    addAll: mockedAddAllCall,

    pin: {
      rm: mockedRemoveCall,
    },
  })),
}));

const unexistingFile = path.join(__dirname, 'infura-fake.png');

describe('ipfs', () => {
  let ipfs;
  const projectId = process.env.INFURA_IPFS_PROJECT_ID;
  const projectSecret = process.env.INFURA_IPFS_PROJECT_SECRET;
  const ipfsUrl = process.env.INFURA_IPFS_ENDPOINT;

  beforeAll(async () => {
    ipfs = new IPFS({ projectId, projectSecret, ipfsUrl });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not instanciate ipfs without project id', async () => {
    expect(() => new IPFS({ projectId: null, projectSecret, ipfsUrl })).toThrow();
  });

  it('should not instanciate ipfs without project secret', async () => {
    expect(() => new IPFS({ projectId, projectSecret: null, ipfsUrl })).toThrow();
  });

  it('should not instanciate ipfs without ipfs url', async () => {
    expect(() => new IPFS({ projectId: null, projectSecret, ipfsUrl: null })).toThrow();
  });

  it('should upload file', async () => {
    const data = await ipfs.uploadFile({
      source: file,
    });

    expect(mockedCall).toHaveBeenCalledTimes(1);
  });

  it('should upload folder', async () => {
    await ipfs.uploadDirectory({
      source: folder,
    });

    expect(mockedCall).toHaveBeenCalledTimes(1);
  });

  it('should unpin file', async () => {
    await ipfs.unPinFile({
      hash: faker.datatype.string(),
    });

    expect(mockedRemoveCall).toHaveBeenCalledTimes(1);
  });

  it('should not upload unexisting file', async () => {
    expect(
      async () =>
        await ipfs.uploadFile({
          source: unexistingFile,
        }),
    ).rejects.toThrow();
  });

  it('should throw error if its a file', async () => {
    expect(
      async () =>
        await ipfs.uploadDirectory({
          source: file,
        }),
    ).rejects.toThrow();
  });

  it('should throw error if its a directory', async () => {
    expect(
      async () =>
        await ipfs.uploadFile({
          source: folder,
        }),
    ).rejects.toThrow();
  });
});
