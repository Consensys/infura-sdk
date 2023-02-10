import { config as loadEnv } from 'dotenv';
import path from 'path';
import Auth from '../src/lib/Auth/Auth';
import { SDK } from '../src/lib/SDK/sdk';
import { TEMPLATES } from '../src/lib/constants';
import wait from './utils/utils.ts/utils';
import IpfsApiClient from './utils/utils.ts/ipfsClient';
import Metadata from '../src/lib/Metadata/Metadata';
import { MetadataDTO } from '../src/lib/SDK/types';

loadEnv();
const ownerAddress = process.env.WALLET_PUBLIC_ADDRESS
  ? process.env.WALLET_PUBLIC_ADDRESS
  : '0x3bE0Ec232d2D9B3912dE6f1ff941CB499db4eCe7';
const ipfs = {
  projectId: process.env.INFURA_IPFS_PROJECT_ID,
  apiKeySecret: process.env.INFURA_IPFS_PROJECT_SECRET,
};
const authInfo: any = {
  privateKey: process.env.WALLET_PRIVATE_KEY,
  projectId: process.env.INFURA_PROJECT_ID,
  secretId: process.env.INFURA_PROJECT_SECRET,
  rpcUrl: process.env.EVM_RPC_URL,
  chainId: 80001,
  ipfs,
};

const file: string = path.join(__dirname, 'infura.jpeg');
jest.retryTimes(2, { logErrorsBeforeRetry: true });
describe('SDK - IPFS for ERC1155', () => {
  jest.setTimeout(60 * 1000 * 10);
  const ipfsApiClient = new IpfsApiClient();
  it.skip('Deploy - Set URI for a contract and transfer', async () => {
    // skipped as endpoint is available but is not included in the sdk yet
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const contractInfo = {
      template: TEMPLATES.ERC1155Mintable,
      params: {
        baseURI: 'https://testuri',
        contractURI: 'https://testuri',
        ids: [0, 1, 3, 4],
      },
    };
    const newContract = await sdk.deploy(contractInfo);
    const folderUri = await sdk.createFolder({
      metadata: [
        Metadata.openSeaCollectionLevelStandard({
          description: 'Open see image 1',
          external_link: 'https://testing',
          image: await sdk.storeFile({ metadata: file }),
          name: 'Javivi',
        }),
        Metadata.openSeaCollectionLevelStandard({
          description: 'Open see image 2',
          external_link: 'https://testing',
          image: await sdk.storeFile({ metadata: file }),
          name: 'Javivi',
        }),
        Metadata.openSeaCollectionLevelStandard({
          description: 'Open see image 3',
          external_link: 'https://testing',
          image: await sdk.storeFile({ metadata: file }),
          name: 'Javivi',
        }),
        Metadata.openSeaCollectionLevelStandard({
          description: 'Open see image 4',
          external_link: 'https://testing',
          image: await sdk.storeFile({ metadata: file }),
          name: 'Javivi',
        }),
      ],
      isErc1155: true,
    });
    const tx = await newContract.setBaseURI({ baseURI: folderUri });
    const txReceipt = await tx.wait();
    expect(txReceipt.status).toEqual(1);
    const mintHash = await newContract.mint({
      to: ownerAddress,
      id: 0,
      quantity: 3,
    });
    const receipt = await mintHash.wait();
    expect(receipt.status).toEqual(1);
    await wait(
      async () => {
        const response: MetadataDTO = await sdk.api.getTokenMetadata({
          contractAddress: newContract.contractAddress,
          tokenId: '0',
          resyncMetadata: true,
        });

        return response.metadata !== null;
      },
      300000,
      1000,
      'Waiting for NFT collection to be available',
    );
    const response: MetadataDTO = await sdk.api.getTokenMetadata({
      contractAddress: newContract.contractAddress,
      tokenId: '0',
    });
    expect(response.metadata).toContain(folderUri);
  });
  it('Store file with an string', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const fileStored = await sdk.storeFile({ metadata: file });
    const imageResponse = await ipfsApiClient.getIpfsImage(fileStored.replace('ipfs://', ''));
    expect(imageResponse.status).toEqual(200);
    expect(imageResponse.data).not.toBeNull();
  });
  it('Store metadata as string', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const fileStored = await sdk.storeMetadata({ metadata: file });
    const imageResponse = await ipfsApiClient.getIpfsImage(fileStored.replace('ipfs://', ''));
    expect(imageResponse.status).toEqual(200);
    expect(imageResponse.data).not.toBeNull();
  });
  it('Store metadata as OpenSeaTokenLevel standard', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const tokenMetadata = {
      description: 'Open see image',
      external_url: 'https://uri',
      image: await sdk.storeFile({ metadata: file }),
      name: 'Javivi',
      attributes: [],
    };
    const fileStored = await sdk.storeMetadata({
      metadata: Metadata.openSeaTokenLevelStandard(tokenMetadata),
    });

    const imageResponse = await ipfsApiClient.getIpfsImage(fileStored.replace('ipfs://', ''));
    expect(imageResponse.status).toEqual(200);
    expect(imageResponse.data).not.toBeNull();
  });
  it('Store metadata as OpenSeaCollectionLevel standard', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const tokenMetadata = {
      description: 'Open see image',
      external_url: 'https://uri',
      image: await sdk.storeFile({ metadata: file }),
      name: 'Javivi',
      attributes: [],
    };
    const fileStored = await sdk.storeMetadata({
      metadata: Metadata.openSeaCollectionLevelStandard(tokenMetadata),
    });

    const imageResponse = await ipfsApiClient.getIpfsImage(fileStored.replace('ipfs://', ''));
    expect(imageResponse.status).toEqual(200);
    expect(imageResponse.data).not.toBeNull();
  });

  it('Create folder and store 2 files openSeaCollectionLevelStandard', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);

    const folderUri = await sdk.createFolder({
      metadata: [
        Metadata.openSeaCollectionLevelStandard({
          description: 'Open see image 1',
          external_link: 'https://testing',
          image: await sdk.storeFile({ metadata: file }),
          name: 'Javivi',
        }),
        Metadata.openSeaCollectionLevelStandard({
          description: 'Open see image 2',
          external_link: 'https://testing',
          image: await sdk.storeFile({ metadata: file }),
          name: 'Javivi',
        }),
        Metadata.openSeaCollectionLevelStandard({
          description: 'Open see image 3',
          external_link: 'https://testing',
          image: await sdk.storeFile({ metadata: file }),
          name: 'Javivi',
        }),
        Metadata.openSeaCollectionLevelStandard({
          description: 'Open see image 4',
          external_link: 'https://testing',
          image: await sdk.storeFile({ metadata: file }),
          name: 'Javivi',
        }),
      ],
      isErc1155: true,
    });
    const folderHash = await ipfsApiClient.getIpfsImage(folderUri.replace('ipfs://', ''));
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

    await wait(
      async () => {
        const response: MetadataDTO = await sdk.api.getTokenMetadata({
          contractAddress: contract.contractAddress,
          tokenId: '0',
          resyncMetadata: true,
        });
        const response2: MetadataDTO = await sdk.api.getTokenMetadata({
          contractAddress: contract.contractAddress,
          tokenId: '1',
          resyncMetadata: true,
        });
        return response.metadata !== null && response2.metadata !== null;
      },
      300000,
      1000,
      'Waiting for NFT collection to be available',
    );
    const response: MetadataDTO = await sdk.api.getTokenMetadata({
      contractAddress: contract.contractAddress,
      tokenId: '0',
    });
    const response2: MetadataDTO = await sdk.api.getTokenMetadata({
      contractAddress: contract.contractAddress,
      tokenId: '1',
    });
    expect(response.metadata).not.toBeNull();
    expect(response2.metadata).not.toBeNull();

    const contractNftMetadata = await sdk.api.getNFTsForCollection({
      contractAddress: contract.contractAddress,
    });
    expect(
      contractNftMetadata.assets.filter(asset => asset.tokenId === '1')[0].metadata,
    ).not.toBeNull();
    expect(
      contractNftMetadata.assets.filter(asset => asset.tokenId === '0')[0].metadata,
    ).not.toBeNull();
  });

  it('Create folder and store 2 files openSeaTokenLevelStandard', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const folderUri = await sdk.createFolder({
      metadata: [
        Metadata.openSeaTokenLevelStandard({
          description: 'Description 1',
          external_url: 'https://url1',
          image: await sdk.storeFile({ metadata: file }),
          name: 'image1',
          attributes: [{ value: 1, trait_type: 'a' }],
        }),
        Metadata.openSeaTokenLevelStandard({
          description: 'Description 2',
          external_url: 'https://url2',
          image: await sdk.storeFile({ metadata: file }),
          name: 'image2',
          attributes: [{ value: '2', trait_type: 'a' }],
        }),
        Metadata.openSeaTokenLevelStandard({
          description: 'Description 3',
          external_url: 'https://url1',
          image: await sdk.storeFile({ metadata: file }),
          name: 'image3',
          attributes: [{ value: 3, trait_type: 'a' }],
        }),
        Metadata.openSeaTokenLevelStandard({
          description: 'Description 4',
          external_url: 'https://url4',
          image: await sdk.storeFile({ metadata: file }),
          name: 'image3',
          attributes: [{ value: '4', trait_type: 'a' }],
        }),
      ],
      isErc1155: true,
    });
    const folderHash = await ipfsApiClient.getIpfsImage(folderUri.replace('ipfs://', ''));
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
    let response: MetadataDTO;
    let response2: MetadataDTO;
    await wait(
      async () => {
        const nftCollection = await sdk.api.getNFTsForCollection({
          contractAddress: contract.contractAddress,
        });
        response = await sdk.api.getTokenMetadata({
          contractAddress: contract.contractAddress,
          tokenId: '0',
          resyncMetadata: true,
        });
        response2 = await sdk.api.getTokenMetadata({
          contractAddress: contract.contractAddress,
          tokenId: '1',
          resyncMetadata: true,
        });
        return (
          nftCollection.total === 3 && response.metadata !== null && response2.metadata !== null
        );
      },
      300000,
      1000,
      'Waiting for NFT collection to be available',
    );
    response = await sdk.api.getTokenMetadata({
      contractAddress: contract.contractAddress,
      tokenId: '0',
    });
    response2 = await sdk.api.getTokenMetadata({
      contractAddress: contract.contractAddress,
      tokenId: '1',
    });
    expect(response.metadata).not.toBeNull();
    expect(response2.metadata).not.toBeNull();

    const contractNftMetadata = await sdk.api.getNFTsForCollection({
      contractAddress: contract.contractAddress,
    });
    expect(
      contractNftMetadata.assets.filter(asset => asset.tokenId === '1')[0].metadata,
    ).not.toBeNull();
    expect(
      contractNftMetadata.assets.filter(asset => asset.tokenId === '0')[0].metadata,
    ).not.toBeNull();
  });
});
