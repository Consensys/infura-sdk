/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */

import { Auth, SDK, TEMPLATE } from '@infura/sdk';

/**
 * Authentication object
 * Used in most of the SDK interaction
 * Does it need a validation (infura check? IPFS check ?)?
 * getProvider (injected or defaultRpcUrl)
 * getSigner
 * getApiKey ${projectId:secretId} | base64
 */

const account = new Auth({
  privateKey: 'privatekeystringverylongandveryprivate',
  projectId: 'keytoconnecttoreadAPI',
  projectSecret: 'keytoconnecttoreadAPI',
  rpcUrl: rpcUrl,
  chainId: '1',
  // IPFSProjectID
  // IPFSProjectSecret
});

/**
 * constructor
 * deploy method with switch statement // mvp
 * getContractMetadata(contractAddress) (name, symbol, tokenType) // mvp
 * getNFTs(publicAddress, metadata = false) // mvp
 * getNFTsForCollection(contractAddress) // mvp
 * getNFTMetadata(contractAddress, tokenId) // mvp
 * getEthBalance(publicAddress) // mvp
 * getERC20Balance(publicAddress) // mvp
 */
const sdk = new SDK(account);

/**
 * Read
 */

const BAYC = '0x0272080AB9269C730EF802';

await sdk.getContractMetadata(contractAddress); // mvp (name, symbol, tokenType)
await sdk.getNFTs(address, (metadata = false)); // mvp
await sdk.getNFTsForCollection(contractAddress); // mvp
await sdk.getTokenMetadata(contractAddress, tokenId); // mvp
await sdk.getEthBalance(publicAddress); // mvp
await sdk.getERC20Balance(publicAddress); // mvp

/**
 * WRITE
 * Deploy returns a ERC721Mintable class that you can interact with
 * deploy and getContractFromAddress returns the same type (ERC721Mintable)
 * ~10 write operations
 */

const contractObject = await sdk.deploy({
  template: TEMPLATE.ERC721Mintable,
  param: {
    name: 'Cool Contract', // mandatory
    symbol: 'CC', // optional
    contractURI: 'ipfs://...', // optional
    // royaltyPayee: '0x...',
    // royaltyShare: '5',
  },
});

const contractObject2 = await sdk.getContractFromAddress({
  template: TEMPLATE.ERC721Mintable,
  address: contractAddress,
});

const metadataUri = 'ipfs://...';
const to = '0x655ED967A80';
const sharePercent = 10;

// event txId ? wait until it's done (can be long)
const event = await contractObject.mint(to, metadataUri);
await contractObject.setRoyalties(to, share);
await contractObject.transfer(to);
