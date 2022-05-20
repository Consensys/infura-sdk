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
 */

const account = new Auth({
  privateKey: 'privatekeystringsuperlonguesarace',
  apiKey: 'keytoconnecttoreadAPI',
  rpcUrl: rpcUrl,
  // IPFSProjectID
  // IPFSProjectSecret
});

/**
 * Read
 */

const BAYC = '0x0272080AB9269C730EF802';
const contractToRead = SDK(account).read(BAYC);

contractToRead.getNFTFromCollection();
contractToRead.getContractMetadata();
contractToRead.getAllNFTsWihMetadata();
contractToRead.getOwnerOf(tokenId);

/**
 * WRITE
 */

const { receipt, address } = SDK(account).deploy({
  template: TEMPLATE.ERC721Mintable,
  name: 'Cool Contract',
  symbol: 'CC',
  contractURI: 'ipfs://...',
  royaltyPayee: '0x...',
  royaltyShare: '5',
});

const metadataUri = 'ipfs://...';
const contractToInteract = SDK(account).interact(address);

const tokenId = contractToInteract.mint(to, metadataUri);
contractToInteract.updateRoyalty('10');
contractToInteract.transfer(to);
