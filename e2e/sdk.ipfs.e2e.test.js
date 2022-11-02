import { config as loadEnv } from 'dotenv';
import path from 'path';
import { SDK, Auth, Metadata } from '../index.js';
import IpfsApiClient from './utils/ipfsClient.js';

loadEnv();
const authInfo = {
  privateKey: process.env.WALLET_PRIVATE_KEY,
  projectId: process.env.INFURA_PROJECT_ID,
  secretId: process.env.INFURA_PROJECT_SECRET,
  rpcUrl: process.env.EVM_RPC_URL,
  chainId: 5,
  ipfs: {
    projectId: process.env.INFURA_IPFS_PROJECT_ID,
    apiKeySecret: process.env.INFURA_IPFS_PROJECT_SECRET,
  },
};

const file = path.join(__dirname, 'infura.jpeg');

describe('SDK - IPFS ', () => {
  const ipfsApiClient = new IpfsApiClient();
  it('Store file with an string', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const fileStored = await sdk.storeFile(file);
    const imageResponse = await ipfsApiClient.getIpfsImage(fileStored.replace('ipfs://', ''));
    expect(imageResponse.status).toEqual(200);
    expect(imageResponse.data).not.toBeNull();
  });
  it('Store content as string', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const fileStored = await sdk.storeContent(file);
    const imageResponse = await ipfsApiClient.getIpfsImage(fileStored.replace('ipfs://', ''));
    expect(imageResponse.status).toEqual(200);
    expect(imageResponse.data).not.toBeNull();
  });
  it('Store metadata as OpenSeaTokenLevel standard', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const fileStored = await sdk.storeMetadata(
      Metadata.openSeaTokenLevelStandard({
        description: 'Open see image',
        external_url: 'https://testing',
        image: await sdk.storeFile(file),
        name: 'Javivi',
        attributes: [],
      }),
    );

    const imageResponse = await ipfsApiClient.getIpfsImage(fileStored.replace('ipfs://', ''));
    expect(imageResponse.status).toEqual(200);
    expect(imageResponse.data).not.toBeNull();
  });
  it('Store metadata as OpenSeaTokenLevel standard within an array', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const fileStored = await sdk.storeMetadata([
      Metadata.openSeaTokenLevelStandard({
        description: 'Friendly Open see image 2',
        external_url: 'https://',
        image: await sdk.storeFile(file),
        name: 'Javivi',
        attributes: [],
      }),
    ]);

    const imageResponse = await ipfsApiClient.getIpfsImage(fileStored.replace('ipfs://', ''));
    expect(imageResponse.status).toEqual(200);
    expect(imageResponse.data).not.toBeNull();
  });
  it('Store base URI a few OpenSeaTokenLevel standard objects within an array', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const fileStored = await sdk.storeBaseURI([
      Metadata.openSeaTokenLevelStandard({
        description: 'Friendly Open see image',
        external_url: 'https://test',
        image: await sdk.storeFile(file),
        name: 'Javivi',
        attributes: [],
      }),
      Metadata.openSeaTokenLevelStandard({
        description: 'Friendly Open see image',
        external_url: 'https://test',
        image: await sdk.storeFile(file),
        name: 'Javivi',
        attributes: [],
      }),
    ]);
    const imageResponse = await ipfsApiClient.getIpfsImage(fileStored.replace('ipfs://', ''));
    expect(imageResponse.status).toEqual(200);
    expect(imageResponse.data).not.toBeNull();
  });
});
