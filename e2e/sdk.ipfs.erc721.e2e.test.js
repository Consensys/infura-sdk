/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable sonarjs/no-duplicate-string */
import { config as loadEnv } from 'dotenv';
import path from 'path';
import { SDK, Auth, Metadata, TEMPLATES } from '../index.js';
import IpfsApiClient from './utils/ipfsClient.js';
import { wait } from './utils/utils.js';

loadEnv();
const ownerAddress = process.env.WALLET_PUBLIC_ADDRESS;
const ipfs = {
  projectId: process.env.INFURA_IPFS_PROJECT_ID,
  apiKeySecret: process.env.INFURA_IPFS_PROJECT_SECRET,
};
const authInfo = {
  privateKey: process.env.WALLET_PRIVATE_KEY,
  projectId: process.env.INFURA_PROJECT_ID,
  secretId: process.env.INFURA_PROJECT_SECRET,
  rpcUrl: process.env.EVM_RPC_URL,
  chainId: 5,
  ipfs,
};

const file = path.join(__dirname, 'infura.jpeg');

describe('SDK - IPFS for ERC712', () => {
  jest.setTimeout(60 * 1000 * 10);
  const ipfsApiClient = new IpfsApiClient();
  it('Create folder and store 2 files openSeaTokenLevelStandard', async () => {
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
      ],
      false,
    );
    const folderHash = await ipfsApiClient.getIpfsImage(folderUri.replace('ipfs://', ''));
    console.log(folderUri);
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
    console.log(contract.contractAddress);
    console.log('Deployed and Minting');
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
        console.log(response.metadata);
        console.log(response2.metadata);
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
      ],
      false,
    );
    const folderHash = await ipfsApiClient.getIpfsImage(folderUri.replace('ipfs://', ''));
    console.log(folderUri);
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
    console.log(contract.contractAddress);
    console.log('Deployed and Minting');
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
    expect(
      contractNftMetadata.assets.filter(asset => asset.tokenId === '1').metadata,
    ).not.toBeNull();
    expect(
      contractNftMetadata.assets.filter(asset => asset.tokenId === '0').metadata,
    ).not.toBeNull();
  });

  it('Create folder and store 3 files openSeaTokenLevelStandard', async () => {
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
      false,
    );
    const folderHash = await ipfsApiClient.getIpfsImage(folderUri.replace('ipfs://', ''));
    console.log(folderUri);
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
    console.log(contract.contractAddress);
    console.log('Deployed and Minting');
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
    console.log(contractNftMetadata);
    expect(
      contractNftMetadata.assets.filter(asset => asset.tokenId === '1').metadata,
    ).not.toBeNull();
    expect(
      contractNftMetadata.assets.filter(asset => asset.tokenId === '0').metadata,
    ).not.toBeNull();
  });
  it('storeMetadata and check ', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const metadata = {
      description: 'Friendly Open see image',
      external_url: 'https://test',
      image: await sdk.storeFile(file),
      name: 'Javivi',
      attributes: [],
    };
    const fileStored = await sdk.storeMetadata(
      Metadata.openSeaTokenLevelStandard({
        description: 'Friendly Open see image',
        external_url: 'https://test',
        image: await sdk.storeFile(file),
        name: 'Javivi',
        attributes: [],
      }),
    );

    console.log(fileStored);
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
    console.log(newContract.contractAddress);
    console.log(fileStored);
    const mintHash = await newContract.mint({
      publicAddress: ownerAddress,
      // eslint-disable-next-line sonarjs/no-duplicate-string
      tokenURI: fileStored,
    });
    const receipt = await mintHash.wait();
    expect(receipt.status).toEqual(1);
    let resp;
    await wait(
      async () => {
        resp = await sdk.getTokenMetadata({
          contractAddress: newContract.contractAddress,
          tokenId: 0,
        });
        console.log(resp.metadata);
        return resp.metadata !== null;
      },
      120000,
      1000,
      'Waiting for NFT collection to be available for an user',
    );
    expect(resp.metadata).toEqual(metadata);
  });
});
