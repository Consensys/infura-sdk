import { faker } from '@faker-js/faker';
import IPFS from '../src/lib/IPFS/ipfs';
import path from 'path';
import { config as loadEnv } from 'dotenv';
const file = path.join(__dirname, 'consensys.png');
const folder = path.join(__dirname, 'coverage');

const mockedCall = jest.fn().mockImplementation(() => 'test');
const mockedRemoveCall = jest.fn().mockImplementation(() => 'test');

jest.mock('ipfs-http-client', () => ({
  create: jest.fn(() => ({
    add: jest.fn(() => ({
      cid: {
        toString: mockedCall,
      },
    })),

    pin: {
      rm: mockedRemoveCall,
    },
  })),
}));

loadEnv();
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

  it('should upload file', async () => {
    const data = await ipfs.uploadFile({
      source: file,
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
          name: faker.datatype.string(),
          source: unexistingFile,
        }),
    ).rejects.toThrow();
  });
});
