import { config as loadEnv } from 'dotenv';
import Auth from '../src/lib/Auth/Auth';
import { SDK } from '../src/lib/SDK/sdk';
import { TEMPLATES } from '../src/lib/constants';
import { Metadata } from '../src';
import wait from './utils/utils.ts/utils';
import { sleep } from '../src/lib/utils';

loadEnv();
const ownerAddress = process.env.WALLET_PUBLIC_ADDRESS
  ? process.env.WALLET_PUBLIC_ADDRESS
  : '0x3bE0Ec232d2D9B3912dE6f1ff941CB499db4eCe7';
// const tokenURI: string = 'https://';
const authInfo: any = {
  privateKey: process.env.WALLET_PRIVATE_KEY,
  projectId: process.env.INFURA_PROJECT_ID,
  secretId: process.env.INFURA_PROJECT_SECRET,
  rpcUrl: process.env.EVM_RPC_URL,
  chainId: 80001,
  ipfs: {
    projectId: process.env.INFURA_IPFS_PROJECT_ID,
    apiKeySecret: process.env.INFURA_IPFS_PROJECT_SECRET,
  },
};

const acc = new Auth(authInfo);
const sdk = new SDK(acc);
let unrevealedMetadata: string;
let revealedMetadata: string;
let storeMetadata: string;

// jest.retryTimes(2, { logErrorsBeforeRetry: true });
describe('SDK - contract interaction (deploy, load and mint)', () => {
  jest.setTimeout(60 * 1000 * 5);
  beforeAll(async () => {
    const collectionMetadata = Metadata.openSeaCollectionLevelStandard({
      name: 'My awesome collection',
      description: "A long description explaining why it's awesome",
      image: await sdk.storeFile({
        metadata: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
      }),
      external_link: 'https://myawesomewebsite.net',
    });

    console.log('collectionMetadata ----', collectionMetadata);
    storeMetadata = await sdk.storeMetadata({ metadata: collectionMetadata });
    unrevealedMetadata = await sdk.createFolder({
      metadata: [
        Metadata.openSeaTokenLevelStandard({
          description: 'Friendly OpenSea Creature that enjoys long swims in the ocean.',
          external_url: 'https://openseacreatures.io/3',
          image: await sdk.storeFile({
            metadata: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
          }),
          name: 'Dave Starbelly',
          attributes: [{ trait_type: 'type', value: 'unrevealed' }],
        }),
        Metadata.openSeaTokenLevelStandard({
          description: 'Friendly OpenSea Creature that enjoys long swims in the ocean.',
          external_url: 'https://openseacreatures.io/3',
          image: await sdk.storeFile({
            metadata: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
          }),
          name: 'Dave Starbelly',
          attributes: [{ trait_type: 'type', value: 'unrevealed' }],
        }),
      ],
      isErc1155: false,
    });

    revealedMetadata = await sdk.createFolder({
      metadata: [
        Metadata.openSeaTokenLevelStandard({
          description: 'Friendly OpenSea Creature that enjoys long swims in the ocean.',
          external_url: 'https://openseacreatures.io/3',
          image: await sdk.storeFile({
            metadata: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
          }),
          name: 'Dave Starbelly',
          attributes: [{ trait_type: 'type', value: 'revealed' }],
        }),
        Metadata.openSeaTokenLevelStandard({
          description: 'Friendly OpenSea Creature that enjoys long swims in the ocean.',
          external_url: 'https://openseacreatures.io/3',
          image: await sdk.storeFile({
            metadata: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
          }),
          name: 'Dave Starbelly',
          attributes: [{ trait_type: 'type', value: 'revealed' }],
        }),
      ],
      isErc1155: false,
    });
  });
  it('Deploy - Get all nfts by owner address', async () => {
    const response: any = await sdk.api.getNFTs({
      publicAddress: ownerAddress,
      includeMetadata: false,
    });
    const erc721UserMintable = await sdk.deploy({
      template: TEMPLATES.ERC721UserMintable,
      params: {
        name: 'Payable Mint Contract',
        symbol: 'PYMC',
        contractURI: storeMetadata,
        baseURI: unrevealedMetadata,
        maxSupply: 10,
        price: '0.00001',
        maxTokenRequest: 1,
      },
    });

    console.log('Contract ERC721 UserMintable', erc721UserMintable.contractAddress);

    const tx = await erc721UserMintable.toggleSale();

    await tx.wait();

    const tx1Minted = await erc721UserMintable.mint({
      quantity: 1,
      cost: '0.00002',
    });

    await tx1Minted.wait();
    console.log('mintedNFT 1');
    const tx2Minted = await erc721UserMintable.mint({
      quantity: 1,
      cost: '0.00002',
    });

    await tx2Minted.wait();

    await wait(
      async () => {
        const resp = await sdk.api.getNFTs({ publicAddress: ownerAddress, includeMetadata: true });
        const newContractCollection = await resp.assets.filter(
          asset =>
            asset.contract.toLowerCase() === erc721UserMintable.contractAddress.toLowerCase(),
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
    let token0: any = await sdk.api.getTokenMetadata({
      contractAddress: erc721UserMintable.contractAddress.toLowerCase(),
      tokenId: '0',
    });
    let token1: any = await sdk.api.getTokenMetadata({
      contractAddress: erc721UserMintable.contractAddress.toLowerCase(),
      tokenId: '1',
    });
    expect(token0.metadata.name).toEqual('Dave Starbelly');
    expect(token0.metadata.description).toEqual(
      'Friendly OpenSea Creature that enjoys long swims in the ocean.',
    );
    expect(token0.metadata.attributes[0]).toEqual({ trait_type: 'type', value: 'unrevealed' });
    expect(token1.metadata.name).toEqual('Dave Starbelly');
    expect(token1.metadata.description).toEqual(
      'Friendly OpenSea Creature that enjoys long swims in the ocean.',
    );
    expect(token1.metadata.attributes[0]).toEqual({ trait_type: 'type', value: 'unrevealed' });

    console.log('Calling reveal');
    // Reveal metadata
    const txResponse = await erc721UserMintable.reveal({ baseURI: revealedMetadata });
    await txResponse.wait();

    console.log('Calling getTokenMetadata1');
    token0 = await sdk.api.getTokenMetadata({
      contractAddress: erc721UserMintable.contractAddress.toLowerCase(),
      tokenId: '0',
    });
    console.log('Calling getTokenMetadata2');
    token1 = await sdk.api.getTokenMetadata({
      contractAddress: erc721UserMintable.contractAddress.toLowerCase(),
      tokenId: '1',
    });
    expect(token0.metadata.attributes[0]).toEqual({ trait_type: 'type', value: 'unrevealed' });
    expect(token1.metadata.attributes[0]).toEqual({ trait_type: 'type', value: 'unrevealed' });
    console.log('Calling getTokenMetadata0 with resync');
    token0 = await sdk.api.getTokenMetadata({
      contractAddress: erc721UserMintable.contractAddress.toLowerCase(),
      tokenId: '0',
      resyncMetadata: true,
    });
    expect(token0.metadata.attributes[0]).toEqual({ trait_type: 'type', value: 'revealed' });
    console.log('Calling getTokenMetadata1 with resync false');
    token1 = await sdk.api.getTokenMetadata({
      contractAddress: erc721UserMintable.contractAddress.toLowerCase(),
      tokenId: '1',
    });
    expect(token0.metadata.attributes[0]).toEqual({ trait_type: 'type', value: 'revealed' });
    expect(token1.metadata.attributes[0]).toEqual({ trait_type: 'type', value: 'unrevealed' });
    await sleep(60000);
    await wait(
      async () => {
        const resp = await sdk.api.getNFTs({ publicAddress: ownerAddress, includeMetadata: true });
        const token0Minted = await resp.assets.filter(token => token.tokenId === '0')[0];
        const token1Minted = await resp.assets.filter(token => token.tokenId === '1')[0];
        const token0Metadata: any = token0Minted.metadata;
        const token1Metadata: any = token1Minted.metadata;
        console.log(token0Metadata);
        console.log(token1Metadata);
        return (
          token0Metadata.attributes[0].value === 'revealed' &&
          token1Metadata.attributes[0].value === 'revealed'
        );
      },
      120000,
      1000,
      'Waiting for NFT metadata to be available',
    );
    token1 = await sdk.api.getTokenMetadata({
      contractAddress: erc721UserMintable.contractAddress.toLowerCase(),
      tokenId: '1',
      resyncMetadata: true,
    });
    expect(token1.metadata.attributes[0]).toEqual({ trait_type: 'type', value: 'revealed' });
    const nftList = await sdk.api.getNFTs({
      publicAddress: ownerAddress,
      includeMetadata: true,
    });

    const tokensMinted = nftList.assets.filter(
      asset => asset.contract.toLowerCase() === erc721UserMintable.contractAddress.toLowerCase(),
    );
    const token0Minted = await tokensMinted.filter(token => token.tokenId === '0')[0];
    const token1Minted = await tokensMinted.filter(token => token.tokenId === '1')[0];

    const token0Metadata: any = token0Minted.metadata;
    const token1Metadata: any = token1Minted.metadata;
    console.log(token0Metadata);
    console.log(token1Metadata);

    expect(token0Metadata.attributes[0]).toEqual({ trait_type: 'type', value: 'revealed' });
    expect(token1Metadata.attributes[0]).toEqual({
      trait_type: 'type',
      value: 'revealed',
    });
  });
});
