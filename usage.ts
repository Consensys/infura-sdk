/* eslint-disable no-console */
/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

import { config as loadEnv } from 'dotenv';
import { SDK, Auth, Metadata, TEMPLATES } from './src/index';

loadEnv();

(async () => {
  const acc = new Auth({
    privateKey: process.env.WALLET_PRIVATE_KEY,
    projectId: process.env.INFURA_PROJECT_ID,
    secretId: process.env.INFURA_PROJECT_SECRET,
    rpcUrl: process.env.EVM_RPC_URL,
    chainId: 5,
    ipfs: {
      projectId: process.env.INFURA_IPFS_PROJECT_ID,
      apiKeySecret: process.env.INFURA_IPFS_PROJECT_SECRET,
    },
  });

  const sdk = new SDK(acc);

  /**
   * METADATA
   */
  // CREATE CONTRACT Metadata
  const collectionMetadata = Metadata.openSeaCollectionLevelStandard({
    name: 'My awesome collection',
    description: "A long description explaining why it's awesome",
    image: await sdk.storeFile({
      metadata: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
    }),
    external_link: 'https://myawesomewebsite.net',
  });

  console.log('collectionMetadata ----', collectionMetadata);
  const storeMetadata = await sdk.storeMetadata({ metadata: collectionMetadata });
  console.log(':rocket: ~ file: usage.ipfs.ts:60 ~ storeMetadata', storeMetadata);

  /**
   * METADATA
   */
  // CREATE Token Metadata
  const tokenMetadata = Metadata.openSeaTokenLevelStandard({
    description: 'Friendly OpenSea Creature that enjoys long swims in the ocean.',
    external_url: 'https://openseacreatures.io/3',
    image: await sdk.storeFile({
      metadata: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
    }),
    name: 'Dave Starbelly',
    attributes: [],
  });

  console.log('tokenMetadata ----', tokenMetadata);

  const storeTokenMetadata = await sdk.storeMetadata({ metadata: tokenMetadata });
  console.log(':rocket: ~ file: usage.ipfs.ts:60 ~ storeMetadata', storeTokenMetadata);

  /*   const storeImageUrl = await sdk.storeFile({
    metadata: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
  });

  const storeImageFile = await sdk.storeFile({
    metadata: './integration-test/ipfs-test/metamask.jpeg',
  }); */

  /*   console.log('storeMetadata ----', storeMetadata);
  console.log('storeImageUrl ----', storeImageUrl);
  console.log('storeImageUrl ----', storeImageFile); */

  /*   const storeArrayMetadata = await sdk.createFolder({
    metadata: [
      Metadata.openSeaTokenLevelStandard({
        description: 'Friendly OpenSea Creature that enjoys long swims in the ocean.',
        external_url: 'https://openseacreatures.io/3',
        image: await sdk.storeFile({
          metadata: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
        }),
        name: 'Dave Starbelly',
        attributes: [],
      }),
      Metadata.openSeaTokenLevelStandard({
        description: 'Friendly OpenSea Creature that enjoys long swims in the ocean.',
        external_url: 'https://openseacreatures.io/3',
        image: await sdk.storeFile({
          metadata: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
        }),
        name: 'Dave Starbelly',
        attributes: [],
      }),
    ],
    isErc1155: false,
  }); */

  /*   const storeArrayMetadataForERC1155 = await sdk.createFolder({
    metadata: [
      Metadata.openSeaTokenLevelStandard({
        description: 'Friendly OpenSea Creature that enjoys long swims in the ocean.',
        external_url: 'https://openseacreatures.io/3',
        image: await sdk.storeFile({
          metadata: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
        }),
        name: 'Dave Starbelly',
        attributes: [],
      }),
      Metadata.openSeaTokenLevelStandard({
        description: 'Friendly OpenSea Creature that enjoys long swims in the ocean.',
        external_url: 'https://openseacreatures.io/3',
        image: await sdk.storeFile({
          metadata: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
        }),
        name: 'Dave Starbelly',
        attributes: [],
      }),
    ],
    isErc1155: true,
  }); */

  //  console.log('storeArrayMetadata ----', storeArrayMetadata);
  /**
   * METADATA
   */
  // CREATE free Metadata
  /*   Metadata.freeLevelMetadata({
    test: 'test.',
  }); */

  // -----------------------------------------------------------------------------
  // ERC721 Mintable

  // Create a new contract
  const newContract = await sdk.deploy({
    template: TEMPLATES.ERC721Mintable,
    params: {
      name: '1507Contract',
      symbol: 'TOC',
      contractURI: storeMetadata,
    },
  });
  console.log('contract address: \n', newContract.contractAddress);

  // mint a NFT
  const mint = await newContract.mint({
    publicAddress:
      process.env.WALLET_PUBLIC_ADDRESS ?? '0x3bE0Ec232d2D9B3912dE6f1ff941CB499db4eCe7',
    tokenURI: storeTokenMetadata,
  });

  const minted = await mint.wait();
  console.log(minted);

  // READ API
  // Get contract metadata
  /*  const contractMetadata = await sdk.getContractMetadata({
    contractAddress: newContract.contractAddress,
  });
  console.log('contractMetadata', contractMetadata); */

  // Get the token metadata
  /*   const tokenMetadataResult = await sdk.getTokenMetadata({
    contractAddress: newContract.contractAddress,
    tokenId: 0,
  });
  console.log('tokenMetadataResult', tokenMetadataResult);
 */
  // -----------------------------------------------------------------------------
  // ERC1155
  /*   const newContractERC1155 = await sdk.deploy({
    template: TEMPLATES.ERC1155Mintable,
    params: {
      baseURI: storeArrayMetadataForERC1155,
      contractURI: storeTokenMetadata,
      ids: [0, 1],
    },
  });

  console.log('Contract ERC 1155 --------', newContractERC1155.contractAddress);

  const tx1 = await newContractERC1155.mint({
    to: process.env.WALLET_PUBLIC_ADDRESS ?? '0x3bE0Ec232d2D9B3912dE6f1ff941CB499db4eCe7',
    id: 1,
    quantity: 1,
  });

  const mintedNFT = await tx1.wait();
  console.log('mintedNFT --------', mintedNFT); */

  // -----------------------------------------------------------------------------
  // ERC721UserMintable
  /*  const ERC721UserMintable = await sdk.deploy({
    template: TEMPLATES.ERC721UserMintable,
    params: {
      name: 'Payable Mint Contract',
      symbol: 'PYMC',
      contractURI: storeMetadata,
      baseURI: storeArrayMetadata,
      maxSupply: 10,
      price: '0.00001',
      maxTokenRequest: 1,
    },
  });

  console.log('Contract ERC721 UserMintable --------', ERC721UserMintable.contractAddress);

  const tx = await ERC721UserMintable.toggleSale();

  await tx.wait();

  const txMinted = await ERC721UserMintable.mint({
    quantity: 1,
    cost: '0.00002',
  });

  const mintedNFTERC721 = await txMinted.wait();
  console.log('mintedNFT --------', mintedNFTERC721); */
})();
