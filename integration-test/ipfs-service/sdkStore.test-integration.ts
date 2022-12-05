import Auth from '../../src/lib/Auth/Auth';
import { SDK } from '../../src/lib/SDK/sdk';
import path from 'path';
import Metadata from '../../src/lib/Metadata/Metadata';
import { config as loadEnv } from 'dotenv';
import version from '../../src/_version';
// import { sleep } from '../../src/lib/utils';

const file = path.join(__dirname, '../ipfs-test/infura.png');
const unexistingFile = path.join(__dirname, '../ipfs-test/infura2.png');

loadEnv();
describe.skip('E2E Test: sdk store', () => {
  jest.setTimeout(120 * 1000);

  let accountWithoutIpfs: Auth;
  let accountWithIpfs: Auth;
  let sdkWithoutIpfs: SDK;
  let sdkWithIpfs: SDK;
  let publicAddress: string;
  let owner: string;
  beforeAll(() => {
    const { addresses: addr, private_keys: pk } = require('../keys.json');
    [owner, publicAddress] = Object.keys(addr);
    const privateKey = pk[owner];

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

  it('should store file using url', async () => {
    const hash = await sdkWithIpfs.storeFile({
      metadata:
        'https://www.forbes.com/advisor/wp-content/uploads/2021/04/dogecoin.jpeg-900x510.jpg',
    });

    expect(hash).toEqual('ipfs://QmdwrHYSJe1Qa35htoqBGnDUfqkRUyhJBRBgBLSYM7ytbu');
  });

  it('should store file using path', async () => {
    const hash = await sdkWithIpfs.storeFile({ metadata: file });
    expect(hash).toEqual('ipfs://QmbuNrChRcADV4NVvDo2yctWu4Gt9atpVUC74ZsVqRw5uJ');
  });

  it('should not store unexisting file', async () => {
    const getHash = async () => await sdkWithIpfs.storeFile({ metadata: unexistingFile });
    expect(getHash).rejects.toThrow(
      `Error: An error occured with infura ipfs api (location=\"[IPFS.uploadFile]\", error=\"The file does not exists\", argument=\"file\", value=\"/Users/salim/infura-sdk-ts/integration-test/ipfs-test/infura2.png\", code=INVALID_ARGUMENT, version=${version})`,
    );
  });
});
