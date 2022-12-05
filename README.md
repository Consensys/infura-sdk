# Infura NFT SDK - TypeScript

The Infura NFT SDK is a TypeScript library that wraps REST calls to Ethereum nodes.

The library allows you to deploy and call methods on common Ethereum smart-contract definitions through Infura without the developer overhead of learning Solidity, compiling code, importing ABI’s, etc.

The current alpha version of the SDK defines common ERC721 read and write methods. The read methods are also available for interactive testing on a Swagger doc.

[Contact us](https://infura.io/contact) if you have any questions.

## Prerequisites

Sign up for the Beta on the [Beta Signup page](https://infura.io/resources/apis/nft-api-beta-signup).
Once accepted, you will be able to use the NFT API and the NFT SDK.

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
npm install -S @infura/sdk-ts
npm install dotenv 
```

> **Note**
> `dotenv` is optional.


## Authentication

Authentication requires an active `PROJECT_ID` and `PROJECT_SECRET` from an Ethereum project in Infura. You can find it in your [Infura dashboard](https://infura.io/dashboard) in project settings.

To run the example code, add the following environment variables to a `.env` file:

```bash
INFURA_PROJECT_ID=xxx
INFURA_PROJECT_SECRET=xxx
WALLET_PRIVATE_KEY=xxx
EVM_RPC_URL=https://goerli.infura.io/v3/<PROJECT-ID>
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
  projectId: process.env.INFURA_PROJECT_ID,
  secretId: process.env.INFURA_PROJECT_SECRET,
  privateKey: process.env.WALLET_PRIVATE_KEY,
  rpcUrl: process.env.EVM_RPC_URL,
  chainId: 5, // Goerli
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

Check out [this demo file](https://github.com/ConsenSys/infura-sdk-ts/blob/main/usage.ts) for example method calls such as minting an NFT, getting NFT info, and transferring an NFT.

## Swagger API methods

Authenticate using your infura project's information:

- Username: `PROJECT-ID`
- Password: `PROJECT-SECRET`

https://docs.api.infura.io/nft/

## SDK methods

https://github.com/ConsenSys/infura-sdk-ts/blob/main/src/lib/SDK/sdk.ts

## ERC721 template methods

https://github.com/ConsenSys/infura-sdk-ts/blob/main/src/lib/ContractTemplates/ERC721Mintable.ts
