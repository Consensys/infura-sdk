# Infura NFT SDK

The Infura NFT SDK is a JavaScript library that wraps REST calls to Ethereum nodes.

The library allows you to deploy and call methods on common Ethereum smart-contract definitions through Infura without the developer overhead of learning Solidity, compiling code, importing ABI’s, etc.

The current alpha version of the SDK defines common ERC721 read and write methods. The read methods are also available for interactive testing on a Swagger doc.

Contact us on slack channel #nft-infura-alpha-testing with any questions, or if you haven't yet received a username/password.

## Prerequisites

In a terminal window: 

* Log into the [registry](https://registry.nft.consensys-solutions.net) with the username and password we gave you for private alpha access.

```bash
npm login --registry https://registry.nft.consensys-solutions.net
```

* Input your email address.

## Initialize a new project

```bash
mkdir new_project
cd new_project
npm init -y
```

Add `"type":"module"` to the `package.json` file to run it as an ESmodule.

## Install the libraries

```bash
npm install -S @infura/sdk --registry https://registry.nft.consensys-solutions.net /
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
     contractURI: 'link-to-public-hosted-metadata.json',
   },
 });
console.log(`Contract address is: ${newContract.contractAddress}`);
```

### Run with Node

```bash
node index.js
```

## Examples

Check out [this demo file](usage.js) for example method calls such as minting an NFT, getting NFT info, and transferring an NFT.

## Swagger READ methods

- Username: `PROJECT-ID`
- Password: `PROJECT-SECRET`

https://docs.api.infura.io/nft/

## SDK methods

https://github.com/ConsenSys/infura-sdk/blob/main/src/lib/SDK/sdk.js

## ERC721 template methods

https://github.com/ConsenSys/infura-sdk/blob/main/src/lib/ContractTemplates/ERC721Mintable.js