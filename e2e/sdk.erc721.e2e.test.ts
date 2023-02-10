import { config as loadEnv } from 'dotenv';
import Auth from '../src/lib/Auth/Auth';
import { SDK } from '../src/lib/SDK/sdk';
import { TEMPLATES } from '../src/lib/constants';
import wait, { existingContractAddress } from './utils/utils.ts/utils';
import { CollectionsDTO, MetadataDTO, OwnersDTO, SearchNftDTO } from '../src/lib/SDK/types';

loadEnv();
const ownerAddress = process.env.WALLET_PUBLIC_ADDRESS
  ? process.env.WALLET_PUBLIC_ADDRESS
  : '0x3bE0Ec232d2D9B3912dE6f1ff941CB499db4eCe7';
const tokenURI: string = 'https://';
const authInfo: any = {
  privateKey: process.env.WALLET_PRIVATE_KEY,
  projectId: process.env.INFURA_PROJECT_ID,
  secretId: process.env.INFURA_PROJECT_SECRET,
  rpcUrl: process.env.EVM_RPC_URL,
  chainId: 80001,
};
const contractInfo = {
  template: TEMPLATES.ERC721Mintable,
  params: {
    name: 'Contract for testing',
    symbol: 'TOC',
    contractURI: 'https://test.io',
  },
};
jest.retryTimes(2, { logErrorsBeforeRetry: true });
describe('SDK - contract interaction (deploy, load and mint)', () => {
  jest.setTimeout(60 * 1000 * 5);
  it('Deploy - Get all nfts by owner address', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const response: any = await sdk.api.getNFTs({
      publicAddress: ownerAddress,
      includeMetadata: false,
    });
    const newContract = await sdk.deploy(contractInfo);
    const mintHash: any = await newContract.mint({
      publicAddress: ownerAddress,
      tokenURI: 'https://ipfs.io/ipfs/QmRfModHffFedTkHSW1ZEn8f19MdPztn9WV3kY1yjaKvBy',
    });
    const receipt: any = await mintHash.wait();

    expect(receipt.status).toEqual(1);

    await wait(
      async () => {
        const resp = await sdk.api.getNFTs({ publicAddress: ownerAddress, includeMetadata: false });
        const newContractCollection = await resp.assets.filter(
          asset => asset.contract.toLowerCase() === newContract.contractAddress.toLowerCase(),
        )[0];
        return (
          resp.total > response.total &&
          newContractCollection !== null &&
          newContractCollection.metadata !== null
        );
      },
      120000,
      1000,
      'Waiting for NFT collection to be available for an user',
    );
    const response2 = await sdk.api.getNFTs({
      publicAddress: ownerAddress,
      includeMetadata: false,
    });
    expect(response2.total).toBeGreaterThan(response.total);
    expect(response2.assets[0].metadata).toEqual(undefined);

    const responseGetCollectionByWallet: CollectionsDTO = await sdk.api.getCollectionsByWallet({
      walletAddress: '0x3bE0Ec232d2D9B3912dE6f1ff941CB499db4eCe7',
    });

    expect(responseGetCollectionByWallet.collections).not.toBeNull();

    await wait(async () => {
      const nfts = await sdk.api.getNFTs({ publicAddress: ownerAddress, includeMetadata: true });
      const token = await nfts.assets.filter(
        (asset: any) => asset.contract.toLowerCase() === newContract.contractAddress.toLowerCase(),
      );
      return token[0].metadata !== null;
    });
    const response3 = await sdk.api.getNFTs({ publicAddress: ownerAddress, includeMetadata: true });
    const createdToken = await response3.assets.filter(
      (asset: any) => asset.contract.toLowerCase() === newContract.contractAddress.toLowerCase(),
    );
    expect(createdToken[0].metadata).not.toBeNull();
  });
  it('Deploy - Get all nfts from a collection', async () => {
    const acc: Auth = new Auth(authInfo);
    const sdk: SDK = new SDK(acc);
    const contract = await sdk.deploy(contractInfo);
    const mintHash1 = await contract.mint({
      publicAddress: ownerAddress,
      tokenURI,
    });
    const receipt1 = await mintHash1.wait();
    expect(receipt1.status).toEqual(1);

    const mintHash2 = await contract.mint({
      publicAddress: ownerAddress,
      tokenURI,
    });
    const receipt2 = await mintHash2.wait();
    expect(receipt2.status).toEqual(1);
    const mintHash3 = await contract.mint({
      publicAddress: ownerAddress,
      tokenURI,
    });
    const receipt3 = await mintHash3.wait();
    expect(receipt3.status).toEqual(1);

    let response: any;
    await wait(
      async () => {
        response = await sdk.api.getNFTsForCollection({
          contractAddress: contract.contractAddress,
        });
        return response.total === 3;
      },
      600000,
      1000,
      'Waiting for NFT collection to be available',
    );
    if (response) {
      response.assets.forEach((asset: { contract: string; type: any }) => {
        expect(asset.contract.toLowerCase()).toEqual(contract.contractAddress.toLowerCase());
        expect(asset.type).toEqual('ERC721');
      });
    }
  });

  it('Deploy - Get all collection metadata', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const contract = await sdk.deploy(contractInfo);

    const mintHash1 = await contract.mint({
      publicAddress: ownerAddress,
      tokenURI,
    });
    const receipt1 = await mintHash1.wait();
    expect(receipt1.status).toEqual(1);
    let response;
    await wait(
      async () => {
        response = await sdk.api.getContractMetadata({ contractAddress: contract.contractAddress });
        return response !== null;
      },
      120000,
      1000,
      'Waiting for NFT collection metadata to be available',
    );
    response = await sdk.api.getContractMetadata({ contractAddress: contract.contractAddress });
    expect(response.name).toEqual(contractInfo.params.name);
    expect(response.symbol).toEqual(contractInfo.params.symbol);
    expect(response.tokenType).toEqual('ERC721');
  }, 240000);

  it('Deploy - Get NFT metadata', async () => {
    // skipped because we are caching the response from Moralis before metadata is available
    // and NFT api is returning null
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const newContract = await sdk.deploy(contractInfo);

    const mintHash1 = await newContract.mint({
      publicAddress: ownerAddress,
      tokenURI: 'https://ipfs.io/ipfs/QmRfModHffFedTkHSW1ZEn8f19MdPztn9WV3kY1yjaKvBy',
    });
    const receipt1 = await mintHash1.wait();
    expect(receipt1.status).toEqual(1);
    await wait(
      async () => {
        const response: any = await sdk.api.getTokenMetadata({
          contractAddress: newContract.contractAddress,
          tokenId: '0',
          resyncMetadata: true,
        });
        return response.metadata !== null;
      },
      600000,
      1000,
      'Waiting for NFT metadata to be available',
    );

    const metadataResponse: MetadataDTO = await sdk.api.getTokenMetadata({
      contractAddress: newContract.contractAddress,
      tokenId: '0',
    });
    expect(metadataResponse.contract.toLowerCase()).toEqual(
      newContract.contractAddress.toLowerCase(),
    );
    expect(metadataResponse.metadata.name).toEqual('Astro Soccer');
    expect(metadataResponse.metadata.description).toEqual(
      "The world's most adorable and sensitive pup.",
    );
    expect(metadataResponse.metadata.image).toContain('https://ipfs.io/ipfs/');
    expect(metadataResponse.metadata.attributes).not.toBeNull();
  }, 600000);

  it('Load existing contract', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const newContract = await sdk.deploy(contractInfo);
    const loadedContract = await sdk.loadContract({
      template: TEMPLATES.ERC721Mintable,
      contractAddress: newContract.contractAddress,
    });
    expect(loadedContract.contractAddress).toEqual(newContract.contractAddress);
  });

  it('Load old contract', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const cont = {
      template: TEMPLATES.ERC721Mintable,
      contractAddress: existingContractAddress,
    };
    const contract = await sdk.loadContract(cont);
    expect(contract.contractAddress).toEqual(cont.contractAddress);
  });

  it('Load new contract and get Metadata', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const newContract = await sdk.deploy(contractInfo);
    const mintHash1 = await newContract.mint({
      publicAddress: ownerAddress,
      tokenURI: 'https://ipfs.io/ipfs/QmRfModHffFedTkHSW1ZEn8f19MdPztn9WV3kY1yjaKvBy',
    });
    const receipt1 = await mintHash1.wait();
    expect(receipt1.status).toEqual(1);
    await wait(
      async () => {
        const response = await sdk.api.getContractMetadata({
          contractAddress: newContract.contractAddress,
        });

        return response !== null;
      },
      300000,
      1000,
      'Waiting for NFT metadata to be available',
    );
    const meta = await sdk.api.getContractMetadata({
      contractAddress: newContract.contractAddress,
    });
    expect(meta.symbol).toEqual(contractInfo.params.symbol);
    expect(meta.name).toEqual(contractInfo.params.name);
    expect(meta.tokenType).toEqual('ERC721');

    await wait(
      async () => {
        const response = await sdk.api.getOwnersbyContractAddress({
          contractAddress: newContract.contractAddress,
        });

        return (
          response.owners.length !== 0 &&
          response.owners[0].metadata !== null &&
          response.owners[0].minterAddress !== null
        );
      },
      300000,
      1000,
      'Waiting for owners to be updated',
    );
    // Check owners
    const result: OwnersDTO = await sdk.api.getOwnersbyContractAddress({
      contractAddress: newContract.contractAddress,
    });
    expect(result).toMatchObject({
      total: expect.any(Number),
      pageNumber: expect.any(Number),
      pageSize: expect.any(Number),
      network: expect.any(String),
      owners: [
        {
          tokenAddress: newContract.contractAddress.toLowerCase(),
          tokenId: expect.any(String),
          amount: '1',
          ownerOf: ownerAddress.toLowerCase(),
          tokenHash: expect.any(String),
          blockNumberMinted: expect.any(String),
          blockNumber: expect.any(String),
          contractType: expect.any(String),
          name: contractInfo.params.name,
          symbol: contractInfo.params.symbol,
          metadata: expect.any(String),
          minterAddress: expect.any(String),
        },
      ],
    });
    // Check owners by token address and tokenId
    const result2: OwnersDTO = await sdk.api.getOwnersbyTokenAddressAndTokenId({
      tokenAddress: newContract.contractAddress,
      tokenId: '0',
    });
    await wait(
      async () => {
        const response = await sdk.api.getOwnersbyTokenAddressAndTokenId({
          tokenAddress: newContract.contractAddress,
          tokenId: '0',
        });

        return (
          response.owners.length !== 0 &&
          response.owners[0].metadata !== null &&
          response.owners[0].metadata !== null
        );
      },
      300000,
      1000,
      'Waiting for owners to be updated',
    );
    expect(result2).toMatchObject({
      total: expect.any(Number),
      pageNumber: expect.any(Number),
      pageSize: expect.any(Number),
      network: expect.any(String),
      owners: expect.arrayContaining([
        expect.objectContaining({
          tokenAddress: newContract.contractAddress.toLowerCase(),
          tokenId: expect.any(String),
          amount: '1',
          ownerOf: ownerAddress.toLowerCase(),
          tokenHash: expect.any(String),
          blockNumber: expect.any(String),
          blockNumberMinted: expect.any(String),
          contractType: expect.any(String),
          name: contractInfo.params.name,
          symbol: contractInfo.params.symbol,
          metadata: expect.any(String),
          minterAddress: expect.any(String),
        }),
      ]),
    });

    // test search nfts

    const resultSearch: SearchNftDTO = await sdk.api.searchNfts({
      query: contractInfo.params.name,
    });
    // check if there is any result that matches a substr from contractInfo.params.name
    const match = resultSearch.nfts.some(element => element.metadata.includes('test'));
    expect(match).toBeTruthy();

    expect(resultSearch).toMatchObject({
      total: expect.any(Number),
      pageNumber: expect.any(Number),
      pageSize: expect.any(Number),
      network: expect.any(String),
      nfts: expect.arrayContaining([
        expect.objectContaining({
          tokenId: expect.any(String),
          tokenAddress: expect.any(String),
          metadata: expect.any(String),
          contractType: expect.any(String),
          tokenHash: expect.any(String),
          minterAddress: expect.any(String),
          blockNumberMinted: expect.any(String),
          createdAt: expect.any(String),
        }),
      ]),
    });
  });
});
