# Infura NFT SDK

The Infura NFT SDK is a JavaScript library that wraps REST calls to Ethereum nodes.

The library allows you to deploy and call methods on common Ethereum smart-contract definitions through Infura without the developer overhead of learning Solidity, compiling code, importing ABI’s, etc.

The current alpha version of the SDK defines common ERC721 read and write methods. The read methods are also available for interactive testing on a Swagger doc.

Contact us if you have any trouble or questions on the SDK [contact](https://infura.io/contact).

## Prerequisites

Sign in for the Beta on the [Beta Signup page](https://infura.io/resources/apis/nft-api-beta-signup).
Once accepted, you will be able to use the NFT API and the NFT SDK.

## Initialize a new project

```bash
mkdir new_project
cd new_project
npm init -y
```

Add `"type":"module"` to the `package.json` file to run it as an ESmodule.

## Install the libraries

```bash
npm install -S @infura/sdk
npm install dotenv 
```

> **Note**
> `dotenv` is optional.


## Authentication

Authentication requires an active `PROJECT_ID` and `PROJECT_SECRET` from an Ethereum project. Find an example in your [Infura dashboard](https://infura.io/dashboard) or create a new Ethereum project and get the details in project settings.

To run the example code, add the following environment variables to a `.env` file:

```bash
INFURA_PROJECT_ID=xxx
INFURA_PROJECT_SECRET=xxx
WALLET_PRIVATE_KEY=xxx
EVM_RPC_URL=https://goerli.infura.io/v3/<PROJECT-ID>
```

## Use the SDK

### Import the libraries

Create an `index.js` file, import the libraries, and load the environment variables.

```js
import { config as loadEnv } from 'dotenv';
import { SDK, Auth, TEMPLATES } from '@infura/sdk';

loadEnv();
```

### Create an `Auth` object

```javascript
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

```js
const sdk = new SDK(auth);
```

### Deploy an ERC721Mintable contract

```js
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

### Run with Node

```bash
node index.js
```

## Examples

Check out [this demo file](https://github.com/ConsenSys/infura-sdk/blob/main/usage.js) for example method calls such as minting an NFT, getting NFT info, and transferring an NFT.

## Swagger API methods

Authenticate using your infura project's information:

- Username: `PROJECT-ID`
- Password: `PROJECT-SECRET`

https://docs.api.infura.io/nft/

## SDK methods

https://github.com/ConsenSys/infura-sdk/blob/main/src/lib/SDK/sdk.js

## ERC721 template methods

https://github.com/ConsenSys/infura-sdk/blob/main/src/lib/ContractTemplates/ERC721Mintable.js