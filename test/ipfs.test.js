import { config as loadEnv } from 'dotenv';
import { faker } from '@faker-js/faker';
import path from 'path';

import IPFS from '../src/services/ipfsService';

const file = path.join(__dirname, 'ipfs-test/consensys.png');
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
const mockedTickCall = jest.fn().mockImplementation(() => 'test');

jest.mock('ipfs-http-client', () => ({
  globSource: () => [],
  urlSource: () => [],
  create: jest.fn(() => ({
    add: jest.fn((inputSrc, { progress }) => {
      progress();
      return {
        cid: {
          toString: mockedCall,
        },
      };
    }),

    addAll: mockedAddAllCall,

    pin: {
      rm: mockedRemoveCall,
    },
  })),
}));

jest.mock('../src/services/utils', () => ({
  progressBar: () => ({
    tick: mockedTickCall,
  }),
}));

const unexistingFile = path.join(__dirname, 'infura-fake.png');

describe('ipfs', () => {
  let ipfs;
  const projectId = process.env.INFURA_IPFS_PROJECT_ID;
  const projectSecret = process.env.INFURA_IPFS_PROJECT_SECRET;

  beforeAll(async () => {
    ipfs = new IPFS({ projectId, projectSecret });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not instanciate ipfs without project id', async () => {
    expect(() => new IPFS({ projectId: null, projectSecret })).toThrow(
      '[IPFS.constructor] No projectId supplied.',
    );
  });

  it('should not instanciate ipfs without project secret', async () => {
    expect(() => new IPFS({ projectId, projectSecret: null })).toThrow(
      '[IPFS.constructor] No projectSecret supplied.',
    );
  });

  it('should upload local file', async () => {
    await ipfs.uploadFile({
      source: file,
    });

    expect(mockedCall).toHaveBeenCalledTimes(1);
    expect(mockedTickCall).toHaveBeenCalledTimes(1);
  });

  it('should upload remote file', async () => {
    await ipfs.uploadFile({
      source: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
    });

    expect(mockedCall).toHaveBeenCalledTimes(1);
    expect(mockedTickCall).toHaveBeenCalledTimes(1);
  });

  it('should upload object', async () => {
    await ipfs.uploadObject({
      source: {
        name: 'my object',
        description: 'My description',
      },
    });

    expect(mockedCall).toHaveBeenCalledTimes(1);
    expect(mockedTickCall).toHaveBeenCalledTimes(1);
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

  it('should not unpin unexisting file', async () => {
    mockedRemoveCall.mockImplementationOnce(() => {
      throw new Error();
    });
    expect(
      async () =>
        await ipfs.unPinFile({
          hash: faker.datatype.string(),
        }),
    ).rejects.toThrow();
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
