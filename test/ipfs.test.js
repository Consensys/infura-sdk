import { faker } from '@faker-js/faker';
import IPFS from '../src/lib/IPFS/ipfs';
import path from 'path';
import { config as loadEnv } from 'dotenv';
import { HttpService } from '../src/services/httpService';

loadEnv();
const unexistingFile = path.join(__dirname, 'infura-fake.png');

describe('ipfs', () => {
  let ipfs;
  const projectId = process.env.INFURA_IPFS_PROJECT_ID;
  const projectSecret = process.env.INFURA_IPFS_PROJECT_SECRET;
  const ipfsUrl = process.env.INFURA_IPFS_ENDPOINT;

  const getHttpService = jest.spyOn(HttpService, 'getImageStream').mockImplementation(() => ({
    data: faker.datatype.string(),
  }));
  const postHttpService = jest.spyOn(HttpService.prototype, 'post').mockImplementation(() => ({
    data: {
      Hash: faker.datatype.string(),
      Name: faker.datatype.string(),
      Size: faker.datatype.number(),
    },
  }));

  beforeAll(async () => {
    ipfs = new IPFS({ projectId, projectSecret, ipfsUrl });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should upload file', async () => {
    const data = await ipfs.uploadFile({
      name: faker.datatype.string(),
      source: 'https://cdn.consensys.net/uploads/2018/10/featured-infura.jpg',
    });

    expect(getHttpService).toHaveBeenCalledTimes(1);
    expect(postHttpService).toHaveBeenCalledTimes(1);
  });

  it('should unpin file', async () => {
    const data = await ipfs.unPinFile({
      hash: faker.datatype.string(),
    });

    expect(postHttpService).toHaveBeenCalledTimes(1);
  });

  it('should not upload unexisting file', async () => {
    jest.spyOn(HttpService.prototype, 'post').mockImplementation(async () => {
      throw new Error('[Ipfs.uploadFile] An error occured with infura ipfs api');
    });

    expect(
      async () =>
        await ipfs.uploadFile({
          name: faker.datatype.string(),
          source: unexistingFile,
        }),
    ).rejects.toThrow('[Ipfs.uploadFile] An error occured with infura ipfs api');
  });
});
