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
const ownerAddress = <string>process.env.WALLET_PUBLIC_ADDRESS;
const ipfs = {
  projectId: process.env.INFURA_IPFS_PROJECT_ID,
  apiKeySecret: process.env.INFURA_IPFS_PROJECT_SECRET,
};
const authInfo = {
  privateKey: process.env.WALLET_PRIVATE_KEY,
  projectId: process.env.INFURA_PROJECT_ID,
  secretId: process.env.INFURA_PROJECT_SECRET,
  rpcUrl: process.env.EVM_RPC_URL,
  chainId: 80001,
  ipfs,
};

const file = path.join(__dirname, 'infura.jpeg');

describe('SDK - IPFS for ERC712', () => {
  jest.setTimeout(60 * 1000 * 10);
  const ipfsApiClient = new IpfsApiClient();
  it('Create folder and store 2 files openSeaTokenLevelStandard', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const imageFile = await sdk.storeFile({ metadata: file });
    const tokenMetadata1 = {
      description: 'Open see image',
      external_url: 'https://uri',
      image: imageFile,
      name: 'Javivi',
      attributes: [],
    };
    const tokenMetadata2 = {
      description: 'Open see image',
      external_url: 'https://uri2',
      image: imageFile,
      name: 'Javivi',
      attributes: [],
    };
    const tokenMetadata3 = {
      description: 'Open see image',
      external_url: 'https://uri3',
      image: imageFile,
      name: 'Javivi',
      attributes: [],
    };
    const folderUri = await sdk.createFolder({
      metadata: [
        Metadata.openSeaCollectionLevelStandard(tokenMetadata1),
        Metadata.openSeaCollectionLevelStandard(tokenMetadata2),
        Metadata.openSeaCollectionLevelStandard(tokenMetadata3),
      ],
      isErc1155: false,
    });
    const folderHash = await ipfsApiClient.getIpfsImage(folderUri.replace('ipfs://', ''));
    expect(folderHash.status).toEqual(200);
    expect(folderHash.data).not.toBeNull();
    const contractInfo = {
      template: TEMPLATES.ERC721Mintable,
      params: {
        name: 'Contract for testing',
        symbol: 'TOC',
        contractURI: 'https://test.io',
      },
    };
    const contract = await sdk.deploy(contractInfo);
    const mintHash1 = await contract.mint({
      publicAddress: ownerAddress,
      tokenURI: `${folderUri}/0`,
    });

    const receipt1 = await mintHash1.wait();
    expect(receipt1.status).toEqual(1);
    const mintHash2 = await contract.mint({
      publicAddress: ownerAddress,
      tokenURI: `${folderUri}/1`,
    });
    const receipt2 = await mintHash2.wait();
    expect(receipt2.status).toEqual(1);

    const mintHash3 = await contract.mint({
      publicAddress: ownerAddress,
      tokenURI: `${folderUri}/2`,
    });
    const receipt3 = await mintHash3.wait();
    expect(receipt3.status).toEqual(1);

    let response: MetadataDTO;
    let response2: MetadataDTO;
    await wait(
      async () => {
        response = await sdk.api.getTokenMetadata({
          contractAddress: contract.contractAddress,
          tokenId: 0,
        });
        response2 = await sdk.api.getTokenMetadata({
          contractAddress: contract.contractAddress,
          tokenId: 1,
        });
        return response.metadata !== null && response2.metadata !== null;
      },
      300000,
      1000,
      'Waiting for NFT collection to be available',
    );
    response = await sdk.api.getTokenMetadata({
      contractAddress: contract.contractAddress,
      tokenId: 0,
    });
    response2 = await sdk.api.getTokenMetadata({
      contractAddress: contract.contractAddress,
      tokenId: 1,
    });
    expect(response.metadata).not.toBeNull();
    expect(response2.metadata).not.toBeNull();

    const contractNftMetadata = await sdk.api.getNFTsForCollection({
      contractAddress: contract.contractAddress,
    });
    expect(
      contractNftMetadata.assets.filter(asset => asset.tokenId === '0')[0].metadata,
    ).not.toBeNull();
    expect(
      contractNftMetadata.assets.filter(asset => asset.tokenId === '1')[0].metadata,
    ).not.toBeNull();
  });
  it('Create folder and store 2 files openSeaCollectionLevelStandard', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const collectionLevelData1 = {
      description: 'Open see image 1',
      external_url: 'https://testing',
      image: await sdk.storeFile({ metadata: file }),
      name: 'Javivi',
      attributes: [],
    };
    const collectionLevelData2 = {
      description: 'Open see image 2',
      external_url: 'https://testing',
      image: await sdk.storeFile({ metadata: file }),
      name: 'Javivi',
      attributes: [],
    };
    const collectionLevelData3 = {
      description: 'Open see image 3',
      external_url: 'https://testing',
      image: await sdk.storeFile({ metadata: file }),
      name: 'Javivi',
      attributes: [],
    };
    const folderUri = await sdk.createFolder({
      metadata: [
        Metadata.openSeaCollectionLevelStandard(collectionLevelData1),
        Metadata.openSeaCollectionLevelStandard(collectionLevelData2),
        Metadata.openSeaCollectionLevelStandard(collectionLevelData3),
      ],
      isErc1155: false,
    });
    const folderHash = await ipfsApiClient.getIpfsImage(folderUri.replace('ipfs://', ''));
    expect(folderHash.status).toEqual(200);
    expect(folderHash.data).not.toBeNull();
    const contractInfo = {
      template: TEMPLATES.ERC721Mintable,
      params: {
        name: 'Contract for testing',
        symbol: 'TOC',
        contractURI: 'https://test.io',
      },
    };
    const contract = await sdk.deploy(contractInfo);
    const mintHash1 = await contract.mint({
      publicAddress: ownerAddress,
      tokenURI: `${folderUri}0`,
    });
    const receipt1 = await mintHash1.wait();
    expect(receipt1.status).toEqual(1);
    const mintHash2 = await contract.mint({
      publicAddress: ownerAddress,
      tokenURI: `${folderUri}1`,
    });
    const receipt2 = await mintHash2.wait();
    expect(receipt2.status).toEqual(1);

    const mintHash3 = await contract.mint({
      publicAddress: ownerAddress,
      tokenURI: `${folderUri}2`,
    });
    const receipt3 = await mintHash3.wait();
    expect(receipt3.status).toEqual(1);
    const mintHash4 = await contract.mint({
      publicAddress: ownerAddress,
      tokenURI: `${folderUri}3`,
    });
    const receipt4 = await mintHash4.wait();
    expect(receipt4.status).toEqual(1);
    let response: MetadataDTO;
    let response2: MetadataDTO;
    await wait(
      async () => {
        response = await sdk.api.getTokenMetadata({
          contractAddress: contract.contractAddress,
          tokenId: 0,
        });
        response2 = await sdk.api.getTokenMetadata({
          contractAddress: contract.contractAddress,
          tokenId: 1,
        });
        return response.metadata !== null && response2.metadata !== null;
      },
      300000,
      1000,
      'Waiting for NFT collection to be available',
    );
    response = await sdk.api.getTokenMetadata({
      contractAddress: contract.contractAddress,
      tokenId: 0,
    });
    response2 = await sdk.api.getTokenMetadata({
      contractAddress: contract.contractAddress,
      tokenId: 1,
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

  it('Create folder and store 3 files openSeaTokenLevelStandard', async () => {
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
      isErc1155: false,
    });
    const folderHash = await ipfsApiClient.getIpfsImage(folderUri.replace('ipfs://', ''));
    expect(folderHash.status).toEqual(200);
    expect(folderHash.data).not.toBeNull();
    const contractInfo = {
      template: TEMPLATES.ERC721Mintable,
      params: {
        name: 'Contract for testing',
        symbol: 'TOC',
        contractURI: 'https://test.io',
      },
    };
    const contract = await sdk.deploy(contractInfo);
    const mintHash1 = await contract.mint({
      publicAddress: ownerAddress,
      tokenURI: `${folderUri}/0`,
    });
    const receipt1 = await mintHash1.wait();
    expect(receipt1.status).toEqual(1);
    const mintHash2 = await contract.mint({
      publicAddress: ownerAddress,
      tokenURI: `${folderUri}/1`,
    });
    const receipt2 = await mintHash2.wait();
    expect(receipt2.status).toEqual(1);
    const mintHash3 = await contract.mint({
      publicAddress: ownerAddress,
      tokenURI: `${folderUri}/2`,
    });
    const receipt3 = await mintHash3.wait();
    expect(receipt3.status).toEqual(1);

    let response: MetadataDTO;
    let response2: MetadataDTO;
    await wait(
      async () => {
        response = await sdk.api.getTokenMetadata({
          contractAddress: contract.contractAddress,
          tokenId: 0,
        });
        response2 = await sdk.api.getTokenMetadata({
          contractAddress: contract.contractAddress,
          tokenId: 1,
        });
        return response.metadata !== null && response2.metadata !== null;
      },
      300000,
      1000,
      'Waiting for NFT collection to be available',
    );
    response = await sdk.api.getTokenMetadata({
      contractAddress: contract.contractAddress,
      tokenId: 0,
    });
    response2 = await sdk.api.getTokenMetadata({
      contractAddress: contract.contractAddress,
      tokenId: 1,
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
  it('storeMetadata and check ', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const metadata = {
      description: 'Friendly Open see image',
      external_url: 'https://test',
      image: await sdk.storeFile({ metadata: file }),
      name: 'Javivi',
      attributes: [],
    };
    const fileStored = await sdk.storeMetadata({
      metadata: Metadata.openSeaTokenLevelStandard({
        description: 'Friendly Open see image',
        external_url: 'https://test',
        image: await sdk.storeFile({ metadata: file }),
        name: 'Javivi',
        attributes: [],
      }),
    });

    const imageResponse = await ipfsApiClient.getIpfsImage(fileStored.replace('ipfs://', ''));
    expect(imageResponse.status).toEqual(200);
    expect(imageResponse.data).not.toBeNull();
    const contractInfo = {
      template: TEMPLATES.ERC721Mintable,
      params: {
        name: 'Contract for testing',
        symbol: 'TOC',
        contractURI: fileStored,
      },
    };
    const newContract = await sdk.deploy(contractInfo);
    const mintHash = await newContract.mint({
      publicAddress: ownerAddress,
      tokenURI: fileStored,
    });
    const receipt = await mintHash.wait();
    expect(receipt.status).toEqual(1);
    let resp: MetadataDTO;
    await wait(
      async () => {
        resp = await sdk.api.getTokenMetadata({
          contractAddress: newContract.contractAddress,
          tokenId: 0,
        });
        return resp.metadata !== null;
      },
      120000,
      1000,
      'Waiting for NFT collection to be available for an user',
    );
    resp = await sdk.api.getTokenMetadata({
      contractAddress: newContract.contractAddress,
      tokenId: 0,
    });
    expect(resp.metadata).toEqual(metadata);
  });
});
