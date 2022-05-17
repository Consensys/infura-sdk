/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */

import { Auth, NFT, MultiNFT, Utils, Token, DAO, Gas } from '@infura/sdk';

/**
 * Authentication object
 * Used in most of the SDK interaction
 * Does it need a validation (infura check? IPFS check ?)?
 */

const account = new Auth({
  provider: ethers.providers.Web3Provider() || rpcUrl,
  signer: ethers.Signer() || 'privatekeystringsuperlonguesarace' || '',
  chainId: 1 | null,
  apiKey: 'keytoconnecttoreadAPI',
  // infuraProjectID: "keytoconnecttoreadAPI", not sure it will be used as it will be present in rpcUrl
  // infuraProjectSecret: "keytoconnecttoreadAPI", not sure how it will be used
  // IPFSProjectID
  // IPFSProjectSecret
});

// additional methods
account.getNFTs(); // my NFT
account.getNFTs(address); // get NFT for provided address

/**
 * NFT - Basic
 */

const myNFTBasic = new NFT({ Auth });
const BasicContractDeployed = myNFTBasic.deploy({
  name: 'name',
  symbol: 'symbol',
});
const txReceiptBasic = BasicContractDeployed.mint(address, MetadataURI);
// contract deployed => we can interact with all contract features, methods, ....

BasicContractDeployed.name(); // 'name'
BasicContractDeployed.symbol(); // 'symbol'
BasicContractDeployed.grant(address, 'role');
BasicContractDeployed.getOwner(txReceiptBasicMint.tokenID);

/**
 * NFT - Multi
 */

const myMultiNFT = new MultiNFT({ Auth });
const MultiContractDeployed = myMultiNFT.deploy({
  name: 'name',
  symbol: 'symbol',
  max_supply: 100,
});

const txReceiptMulti = MultiContractDeployed.mint(address, MetadataURI);
// contract deployed => we can interact with all contract features, methods, ....

MultiContractDeployed.name(); // 'name'
MultiContractDeployed.symbol(); // 'symbol'
MultiContractDeployed.maxSupply(); // 100
MultiContractDeployed.grant(address, 'role');
MultiContractDeployed.getOwner(txReceipt);
MultiContractDeployed.getSupply(); // 99
