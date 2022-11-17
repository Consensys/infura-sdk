/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable sonarjs/no-duplicate-string */
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

describe('SDK - IPFS for ERC1155', () => {
  jest.setTimeout(60 * 1000 * 10);
  console.log(process.env);
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
        external_url: 'https://uri',
        image: await sdk.storeFile(file),
        name: 'Javivi',
        attributes: [],
      }),
    );

    const imageResponse = await ipfsApiClient.getIpfsImage(fileStored.replace('ipfs://', ''));
    expect(imageResponse.status).toEqual(200);
    expect(imageResponse.data).not.toBeNull();
  });
  it('Store metadata as OpenSeaCollectionLevel standard', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const fileStored = await sdk.storeMetadata(
      Metadata.openSeaCollectionLevelStandard({
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

  it('Create folder and store 2 files openSeaCollectionLevelStandard', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const folderUri = await sdk.createFolder(
      [
        Metadata.openSeaCollectionLevelStandard({
          description: 'Open see image 1',
          external_url: 'https://testing',
          image: await sdk.storeFile(file),
          name: 'Javivi',
          attributes: [],
        }),
        Metadata.openSeaCollectionLevelStandard({
          description: 'Open see image 2',
          external_url: 'https://testing',
          image: await sdk.storeFile(file),
          name: 'Javivi',
          attributes: [],
        }),
        Metadata.openSeaCollectionLevelStandard({
          description: 'Open see image 3',
          external_url: 'https://testing',
          image: await sdk.storeFile(file),
          name: 'Javivi',
          attributes: [],
        }),
        Metadata.openSeaCollectionLevelStandard({
          description: 'Open see image 4',
          external_url: 'https://testing',
          image: await sdk.storeFile(file),
          name: 'Javivi',
          attributes: [],
        }),
      ],
      true,
    );
    const folderHash = await ipfsApiClient.getIpfsImage(folderUri.replace('ipfs://', ''));
    console.log(folderUri);
    expect(folderHash.status).toEqual(200);
    expect(folderHash.data).not.toBeNull();
    const contractInfo = {
      template: TEMPLATES.ERC1155Mintable,
      params: {
        baseURI: folderUri,
        contractURI: folderUri,
        ids: [0, 1, 3, 4],
      },
    };
    const contract = await sdk.deploy(contractInfo);
    console.log(contract.contractAddress);
    console.log('Deployed and Minting');
    const mintHash1 = await contract.mint({
      to: ownerAddress,
      id: 0,
      quantity: 1,
    });
    const receipt1 = await mintHash1.wait();
    expect(receipt1.status).toEqual(1);
    const mintHash2 = await contract.mint({
      to: ownerAddress,
      id: 1,
      quantity: 1,
    });
    const receipt2 = await mintHash2.wait();
    expect(receipt2.status).toEqual(1);
    const mintHash3 = await contract.mint({
      to: ownerAddress,
      id: 2,
      quantity: 1,
    });
    const receipt3 = await mintHash3.wait();
    expect(receipt3.status).toEqual(1);

    console.log(contract.contractAddress);
    let response;
    let response2;
    await wait(
      async () => {
        response = await sdk.getTokenMetadata({
          contractAddress: contract.contractAddress,
          tokenId: 0,
        });
        response2 = await sdk.getTokenMetadata({
          contractAddress: contract.contractAddress,
          tokenId: 1,
        });
        return response.metadata !== null && response2.metadata !== null;
      },
      300000,
      1000,
      // eslint-disable-next-line sonarjs/no-duplicate-string
      'Waiting for NFT collection to be available',
    );
    expect(response.metadata).not.toBeNull();
    expect(response2.metadata).not.toBeNull();

    const contractNftMetadata = await sdk.getNFTsForCollection({
      contractAddress: contract.contractAddress,
    });
    console.log(contractNftMetadata.assets);
    expect(contractNftMetadata.assets.filter(asset => asset.tokenId === 1).metadata).not.toBeNull();
    expect(contractNftMetadata.assets.filter(asset => asset.tokenId === 0).metadata).not.toBeNull();
  });

  it('Create folder and store 2 files openSeaTokenLevelStandard', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const folderUri = await sdk.createFolder(
      [
        Metadata.openSeaTokenLevelStandard({
          description: 'Description 1',
          external_url: 'https://url1',
          image: await sdk.storeFile(file),
          name: 'image1',
          attributes: [{ value: 1, trait_type: 'a' }],
        }),
        Metadata.openSeaTokenLevelStandard({
          description: 'Description 2',
          external_url: 'https://url2',
          image: await sdk.storeFile(file),
          name: 'image2',
          attributes: [{ value: 2, trait_type: 'a' }],
        }),
        Metadata.openSeaTokenLevelStandard({
          description: 'Description 3',
          external_url: 'https://url1',
          image: await sdk.storeFile(file),
          name: 'image3',
          attributes: [{ value: 3, trait_type: 'a' }],
        }),
        Metadata.openSeaTokenLevelStandard({
          description: 'Description 4',
          external_url: 'https://url4',
          image: await sdk.storeFile(file),
          name: 'image3',
          attributes: [{ value: 4, trait_type: 'a' }],
        }),
      ],
      true,
    );
    const folderHash = await ipfsApiClient.getIpfsImage(folderUri.replace('ipfs://', ''));
    console.log(folderUri);
    expect(folderHash.status).toEqual(200);
    expect(folderHash.data).not.toBeNull();
    const contractInfo = {
      template: TEMPLATES.ERC1155Mintable,
      params: {
        baseURI: folderUri,
        contractURI: folderUri,
        ids: [0, 1, 3, 4],
      },
    };
    const contract = await sdk.deploy(contractInfo);
    console.log(contract.contractAddress);
    console.log('Deployed and Minting');
    const mintHash1 = await contract.mint({
      to: ownerAddress,
      id: 0,
      quantity: 2,
    });
    const receipt1 = await mintHash1.wait();
    expect(receipt1.status).toEqual(1);
    const mintHash2 = await contract.mint({
      to: ownerAddress,
      id: 1,
      quantity: 1,
    });
    const receipt2 = await mintHash2.wait();
    expect(receipt2.status).toEqual(1);
    const mintHash3 = await contract.mint({
      to: ownerAddress,
      id: 2,
      quantity: 1,
    });
    const receipt3 = await mintHash3.wait();
    expect(receipt3.status).toEqual(1);
    console.log(contract.contractAddress);
    let response;
    let response2;
    await wait(
      async () => {
        const nftCollection = await sdk.getNFTsForCollection({
          contractAddress: contract.contractAddress,
        });
        response = await sdk.getTokenMetadata({
          contractAddress: contract.contractAddress,
          tokenId: 0,
        });
        response2 = await sdk.getTokenMetadata({
          contractAddress: contract.contractAddress,
          tokenId: 1,
        });
        console.log(`Total is ${nftCollection.total}`);
        console.log(
          `Response metadata for contract${contract.contractAddress} is ${JSON.stringify(
            response.metadata,
          )}`,
        );
        console.log(
          `Response2 metadata for contract${contract.contractAddress} is ${JSON.stringify(
            response2.metadata,
          )}`,
        );
        return (
          nftCollection.total === 3 && response.metadata !== null && response2.metadata !== null
        );
      },
      300000,
      1000,
      // eslint-disable-next-line sonarjs/no-duplicate-string
      'Waiting for NFT collection to be available',
    );
    expect(response.metadata).not.toBeNull();
    expect(response2.metadata).not.toBeNull();

    const contractNftMetadata = await sdk.getNFTsForCollection({
      contractAddress: contract.contractAddress,
    });
    console.log(contractNftMetadata.assets);
    expect(contractNftMetadata.assets.filter(asset => asset.tokenId === 1).metadata).not.toBeNull();
    expect(contractNftMetadata.assets.filter(asset => asset.tokenId === 0).metadata).not.toBeNull();
  });
});
