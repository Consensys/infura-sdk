# Infura NFT SDK - TypeScript

The Infura NFT SDK is a TypeScript library that wraps REST calls to Ethereum nodes.

The library allows you to deploy and call methods on common Ethereum smart-contract definitions through Infura without the developer overhead of learning Solidity, compiling code, importing ABI’s, etc.

The current alpha version of the SDK defines common ERC721 and ERC1155 read and write methods. The read methods are also available for interactive testing on a Swagger doc.

[Contact us](https://infura.io/contact) if you have any questions.

## Supported chains

### Write
- Ethereum: Mainnet, Goerli, Sepolia
- Polygon: Mainnet, Mumbai
- Arbitrum: Mainnet
- Avalanche C Chain: Mainnet and testnet
- Palm: Mainnet and testnet
### Read
- Ethereum: Mainnet, Goerli, Sepolia
- Polygon: Mainnet, Mumbai
- Arbitrum: Mainnet
- BSC: Mainnet and testnet
- Avalanche C Chain: Mainnet and testnet
- Palm: Mainnet
- Cronos: Mainnet and testnet
- Fantom: Mainnet

You can find method documentation of the Infura SDK at the [infura Docs linked in the sidebar](https://docs.infura.io/infura/infura-custom-apis/nft-sdk).
## Initialize a new typescript project

```bash
mkdir new_project
cd new_project
npm init -y
npm install -D typescript ts-node
npx tsc --init
```

## Install the libraries

```bash
npm install -S @infura/sdk
npm install dotenv 
```

> **Note**
> `dotenv` is optional.


## Authentication

Authentication requires an active `API_KEY` and `API_KEY_SECRET` from an Ethereum project in Infura. You can find it in your [Infura dashboard](https://infura.io/dashboard) in project settings.

To run the example code, add the following environment variables to a `.env` file:

```bash
INFURA_API_KEY=xxx
INFURA_API_KEY_SECRET=xxx
WALLET_PRIVATE_KEY=xxx
EVM_RPC_URL=https://goerli.infura.io/v3/<API-KEY>
```

## Use the SDK

### Import the libraries

Create an `index.ts` file, import the libraries, and load the environment variables.

```ts
import { config as loadEnv } from 'dotenv';
import { SDK, Auth, TEMPLATES } from '@infura/sdk-ts';

loadEnv();
```

### Create an `Auth` object

```ts
const auth = new Auth({
  projectId: process.env.INFURA_API_KEY,
  secretId: process.env.INFURA_API_KEY_SECRET,
  privateKey: process.env.WALLET_PRIVATE_KEY,
  rpcUrl: process.env.EVM_RPC_URL,
  chainId: 5, // Goerli
  ipfs: {
    projectId: process.env.INFURA_IPFS_PROJECT_ID,
    apiKeySecret: process.env.INFURA_IPFS_PROJECT_SECRET,
  }
});
```

> **Note**
> `rpcUrl` is optional if you provide the chainId and the projectId

### Instantiate the SDK

```ts
const sdk = new SDK(auth);
```

### Deploy an ERC721Mintable contract

```ts
const newContract = await sdk.deploy({
   template: TEMPLATES.ERC721Mintable,
   params: {
     name: 'NFT contract',
     symbol: 'CNSYS',
     contractURI: 'https://link-to-public-hosted-metadata.json',
   },
 });
console.log(`Contract address is: ${newContract.contractAddress}`);
```

### Run with TS-Node

```bash
ts-node index.ts
```

## Examples

Check out [this demo file](https://github.com/ConsenSys/infura-sdk/blob/main/usage.ts) for example method calls such as minting an NFT, getting NFT info, and transferring an NFT.

## Swagger API methods

Authenticate using your infura project's information:

- Username: `API-KEY`
- Password: `API-KEY-SECRET`

https://docs.api.infura.io/nft/

## SDK methods

https://github.com/ConsenSys/infura-sdk/blob/main/src/lib/SDK/sdk.ts

## ERC721 template methods

https://github.com/ConsenSys/infura-sdk/blob/main/src/lib/ContractTemplates/ERC721Mintable.ts

## ERC721 user mintable template methods

https://github.com/ConsenSys/infura-sdk/blob/main/src/lib/ContractTemplates/ERC721UserMintable.ts

## ERC1155 mintable template methods
https://github.com/ConsenSys/infura-sdk/blob/main/src/lib/ContractTemplates/ERC1155Mintable.ts

## Infura NFT API
The SDK currently supports the following NFT API endpoints under the `sdk.api` namespace:

- `getContractMetadata()`: Get contract metadata by contract address
- `getNFTs()`: Get NFTs with metadata currently owned by a given address
- `getNFTsForCollection()`: Get list of NFTs for the specified contract address
- `getTokenMetadata()`: Get nft metadata
- `getTransfersByBlockNumber()`: Gets transfers by block number.
- `getTransfersByBlockHash()`: Gets transfers by block hash.
- `getNftsTransfersByWallet()`: Gets transfers of NFTs for a given wallet address.
- `getTransferFromBlockToBlock()`: Gets transfers from a block to block.
- `getTransfersByTokenId()`: Gets transfers of an NFT by contract address and token ID.
- `getTransfersByContractAddress()`: Get transfers by contract address.
- `getLowestTradePrice()`: Get the lowest ETH based price for contract.
- `getOwnersbyContractAddress()`: Get NFT owners given a token address.
- `getOwnersbyTokenAddressAndTokenId()`: Gets NFT owners for a specific token address and a tokenId.
- `getCollectionsByWallet()`: Get NFT collections owned by a given wallet address..
- `searchNfts()`: Search for Nfts given a string.

## Pagination
The Infura NFT endpoints return 100 results per page. To get the next page, you can pass in the cursor returned by the previous call.

Here's an example of how to paginate using infura sdk through all bored ape yacht club NFTs:
```ts
import { config as loadEnv } from 'dotenv';
import { SDK, Auth, Metadata, TEMPLATES } from '@infura/sdk';

loadEnv();

const acc = new Auth({
    privateKey: process.env.WALLET_PRIVATE_KEY,
    projectId: process.env.INFURA_API_KEY,
    secretId: process.env.INFURA_API_KEY_SECRET,
    rpcUrl: process.env.EVM_RPC_URL,
    chainId: 5,
  });

const sdk = new SDK(acc);

// Get Nfts by collection
const nftsFirstPage = await sdk.api.getNFTsForCollection({
  contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
});
console.log('NFTs first page:', nftsFirstPage);

const nftsSecondPage = await sdk.api.getNFTsForCollection({
  contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
  cursor: nftsFirstPage.cursor,
});
console.log('NFTs second page:', nftsSecondPage);
```

## Infura IPFS API
The SDK currently supports the following IPFS API methods under the sdk class:

- `storeFile()`: Store file on ipfs
- `storeMetadata()`: Store metadata on ipfs
- `createFolder()`: Store array of metadata on ipfs

# Usage Examples
## ERC721 template

```ts
import { config as loadEnv } from 'dotenv';
import { SDK, Auth, Metadata, TEMPLATES } from '@infura/sdk';

loadEnv();

const acc = new Auth({
    privateKey: process.env.WALLET_PRIVATE_KEY,
    projectId: process.env.INFURA_API_KEY,
    secretId: process.env.INFURA_API_KEY_SECRET,
    rpcUrl: process.env.EVM_RPC_URL,
    chainId: 5,
    ipfs: {
      projectId: process.env.INFURA_IPFS_PROJECT_ID,
      apiKeySecret: process.env.INFURA_IPFS_PROJECT_SECRET,
    },
  });

const sdk = new SDK(acc);

// CREATE CONTRACT Metadata
const collectionMetadata = Metadata.openSeaCollectionLevelStandard({
  name: 'My awesome collection',
  description: "A long description explaining why it's awesome",
  image: await sdk.storeFile({
    metadata: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
  }),
  external_link: 'https://myawesomewebsite.net',
});

const storeMetadata = await sdk.storeMetadata({ metadata: collectionMetadata });

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

const storeTokenMetadata = await sdk.storeMetadata({ metadata: tokenMetadata });

// Create a new contract
const newContract = await sdk.deploy({
  template: TEMPLATES.ERC721Mintable,
  params: {
    name: '1507Contract',
    symbol: 'TOC',
    contractURI: storeMetadata,
  },
});

// mint a NFT
const mint = await newContract.mint({
  publicAddress:
    process.env.WALLET_PUBLIC_ADDRESS ?? '0x3bE0Ec232d2D9B3912dE6f1ff941CB499db4eCe7',
  tokenURI: storeTokenMetadata,
});

const minted = await mint.wait();

// READ API
// Get contract metadata
const contractMetadata = await sdk.api.getContractMetadata({
  contractAddress: newContract.contractAddress,
});
console.log('contractMetadata:', contractMetadata);

// Get the token metadata
const tokenMetadataResult = await sdk.api.getTokenMetadata({
  contractAddress: newContract.contractAddress,
  tokenId: 0,
});
console.log('tokenMetadataResult:', tokenMetadataResult);
```
## ERC721 user mintable template

```ts
import { config as loadEnv } from 'dotenv';
import { SDK, Auth, Metadata, TEMPLATES } from '@infura/sdk';

loadEnv();

loadEnv();

const acc = new Auth({
    privateKey: process.env.WALLET_PRIVATE_KEY,
    projectId: process.env.INFURA_API_KEY,
    secretId: process.env.INFURA_API_KEY_SECRET,
    rpcUrl: process.env.EVM_RPC_URL,
    chainId: 5,
    ipfs: {
      projectId: process.env.INFURA_IPFS_PROJECT_ID,
      apiKeySecret: process.env.INFURA_IPFS_PROJECT_SECRET,
    },
  });

const sdk = new SDK(acc);

// IPFS STORE
const storeArrayMetadata = await sdk.createFolder({
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
  });

// CREATE CONTRACT Metadata
const collectionMetadata = Metadata.openSeaCollectionLevelStandard({
  name: 'My awesome collection',
  description: "A long description explaining why it's awesome",
  image: await sdk.storeFile({
    metadata: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
  }),
  external_link: 'https://myawesomewebsite.net',
});

const storeMetadata = await sdk.storeMetadata({ metadata: collectionMetadata });

// Deploy new contract
const ERC721UserMintable = await sdk.deploy({
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

const tx = await ERC721UserMintable.toggleSale();

await tx.wait();

const txMinted = await ERC721UserMintable.mint({
  quantity: 1,
  cost: '0.00002',
});

const mintedNFTERC721 = await txMinted.wait();

```

## ERC1155 mintable template

```ts
import { config as loadEnv } from 'dotenv';
import { SDK, Auth, Metadata, TEMPLATES } from '@infura/sdk';

loadEnv();

loadEnv();

const acc = new Auth({
    privateKey: process.env.WALLET_PRIVATE_KEY,
    projectId: process.env.INFURA_API_KEY,
    secretId: process.env.INFURA_API_KEY_SECRET,
    rpcUrl: process.env.EVM_RPC_URL,
    chainId: 5,
    ipfs: {
      projectId: process.env.INFURA_IPFS_PROJECT_ID,
      apiKeySecret: process.env.INFURA_IPFS_PROJECT_SECRET,
    },
  });

const sdk = new SDK(acc);

// IPFS Store
const storeArrayMetadataForERC1155 = await sdk.createFolder({
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
  });

// Deploy new contract
const newContractERC1155 = await sdk.deploy({
    template: TEMPLATES.ERC1155Mintable,
    params: {
      baseURI: storeArrayMetadataForERC1155,
      contractURI: storeTokenMetadata,
      ids: [0, 1],
    },
  });


  const tx = await newContractERC1155.mint({
    to: process.env.WALLET_PUBLIC_ADDRESS,
    id: 1,
    quantity: 1,
  });

  const mintedNFT = await tx.wait();
  console.log('mintedNFT:', mintedNFT);

```