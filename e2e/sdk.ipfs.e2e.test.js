import { config as loadEnv } from 'dotenv';
import path from 'path';
import { SDK, Auth, Metadata, TEMPLATES } from '../index.js';
import IpfsApiClient from './utils/ipfsClient.js';
import { wait } from './utils/utils.js';

loadEnv();
const ownerAddress = process.env.WALLET_PUBLIC_ADDRESS;
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
  jest.setTimeout(60 * 1000 * 10);
  const ipfsApiClient = new IpfsApiClient();
  it('Store file with an string', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const fileStored = await sdk.storeFile(file);
    const imageResponse = await ipfsApiClient.getIpfsImage(fileStored.replace('ipfs://', ''));
    expect(imageResponse.status).toEqual(200);
    expect(imageResponse.data).not.toBeNull();
  });
  it('Store metadata as string', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const fileStored = await sdk.storeMetadata(file);
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
  it.only('Create folder and store 2 files', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    /* const folderUri = await sdk.createFolder([
      JSON.stringify(
        Metadata.openSeaTokenLevelStandard({
          description: 'Description 1',
          external_url: 'https://url1',
          image: await sdk.storeFile(file),
          name: 'image1',
          attributes: [{ value: 1, trait_type: 'a' }],
        }),
      ),
      JSON.stringify(
        Metadata.openSeaTokenLevelStandard({
          description: 'Description 2',
          external_url: 'https://url2',
          image: await sdk.storeFile(file),
          name: 'image2',
          attributes: [{ value: 2, trait_type: 'a' }],
        }),
      ),
    ]); */
    const folderData = await ipfsApiClient.getIpfsImage(
      'QmSA116Mqdxj5qx1cVpMrfkxhynft61jSYWvrfUawH5CYw',
    );
    const folderUri = 'ipfs://QmSA116Mqdxj5qx1cVpMrfkxhynft61jSYWvrfUawH5CYw';
    expect(folderData.status).toEqual(200);
    expect(folderData.data).not.toBeNull();
    const contractInfo = {
      template: TEMPLATES.ERC1155Mintable,
      params: {
        baseURI: folderUri,
        contractURI: folderUri,
        ids: [0, 2],
      },
    };
    const contract = await sdk.deploy(contractInfo);
    const mintHash1 = await contract.mint({
      to: ownerAddress,
      id: 1,
      quantity: 2,
    });
    const receipt1 = await mintHash1.wait();
    expect(receipt1.status).toEqual(1);
    const mintHash2 = await contract.mint({
      to: ownerAddress,
      id: 0,
      quantity: 2,
    });
    const receipt2 = await mintHash2.wait();
    expect(receipt2.status).toEqual(1);
    const mintHash3 = await contract.mint({
      to: ownerAddress,
      id: 3,
      quantity: 2,
    });
    const receipt3 = await mintHash3.wait();
    expect(receipt3.status).toEqual(1);
    console.log(contract.contractAddress);
    console.log(folderUri);
    let response;
    await wait(
      async () => {
        response = await sdk.getNFTsForCollection({ contractAddress: contract.contractAddress });
        return response.total === 3;
      },
      120000,
      1000,
      // eslint-disable-next-line sonarjs/no-duplicate-string
      'Waiting for NFT collection to be available',
    );
    response = await sdk.getNFTsForCollection({ contractAddress: contract.contractAddress });
    console.log(response);
  });
  it('storeMetadata and check ', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const fileStored = await sdk.storeMetadata([
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
