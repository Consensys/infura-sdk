const Chains = {
  mainnet: 1,
  ropsten: 3,
  rinkeby: 4,
  goerli: 5,
  polygon: 137,
  mumbai: 80001,
};

const chainsName = {
  1: 'mainnet',
  3: 'ropsten',
  4: 'rinkeby',
  5: 'goerli',
  137: 'polygon',
  80001: 'mumbai',
};

const chainUrls = {
  [Chains.mainnet]: 'https://mainnet.infura.io',
  [Chains.ropsten]: 'https://ropsten.infura.io',
  [Chains.rinkeby]: 'https://rinkeby.infura.io',
  [Chains.goerli]: 'https://goerli.infura.io',
  [Chains.polygon]: 'https://polygon-mainnet.infura.io',
  [Chains.mumbai]: 'https://polygon-mumbai.infura.io',
};

const availableChains = [
  Chains.mainnet,
  Chains.goerli,
  Chains.ropsten,
  Chains.rinkeby,
  Chains.polygon,
  Chains.mumbai,
];

const getChainName = chainId => chainsName[chainId];

export { availableChains, Chains, getChainName, chainUrls };


// Johann Daniel suggestion below:
import { config as loadEnv } from 'dotenv';
import { SDK, Auth, TEMPLATES, Metadata } from '@infura/sdk';

loadEnv();

const authETH = new Auth({
  projectId: process.env.INFURA_PROJECT_ID,
  secretId: process.env.INFURA_PROJECT_SECRET,
  privateKey: process.env.WALLET_PRIVATE_KEY,
  rpcUrl: process.env.EVM_RPC_URL,
  chainId: 5, // Goerli

  // IPFS is optional
  ipfs?: {
    projectId: process.env.IPFS_PROJECT_ID,
    secretId: process.env.IPFS_PROJECT_SECRET,
    ipfsUrl?: process.env.IPFS_GATEWAY, // default to ipfs.infura.io:5001
  },


});

// Initiate the contract sdk
const sdk = new SDK(authETH);

// Initiate the metadata sdk
const metadata = new Metadata(authETH); 
// A next step could be to allow to store metadata in an Infura centralized server and being able to upgrade it (to be kept in mind in the implementation)

// ContractURI method
// does following:
// 1. upload local file or url file to ipfs from "image" attribute
// 2. replace image attribute with ipfs link
// 3. upload that (metadata file) to ipfs
const collectionMetadata =  {
    "name": "OpenSea Creatures",
    "description": "OpenSea Creatures are adorable aquatic beings primarily for demonstrating what can be done using the OpenSea platform. Adopt one today to try out all the OpenSea buying, selling, and bidding feature set.",
    "image": "../0.jpg",
    "external_link": "external-link-url"
};
const contractURI = metadata.createContractURI(collectionMetadata || localJsonFileAsCollectionMetadata);
// returns QmeSjSinHpPnmDmspMjwiXyN6zS4E9zccariGR3jxcaWtq
// are we returning hash only, or full ipfs:// or https://infura.io:5001/hash

/**
 * TokenURI should be provided for each `mintWithTokenURI` of the `ERC721Mintable` contract
 * TokenURI is a link to a json file (e.g. ipfs://QmeSjSinHpPnmXmspMjwiXyN6xS4E9zccariGR3jxcaWtq/, https://myapp.io/0.json/)
 */

const tokenMetadataImage = {
    "description": "Friendly OpenSea Creature that enjoys long swims in the ocean.", 
    "external_url": "https://openseacreatures.io/3", 
    "image": "https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png", 
    "name": "Dave Starbelly",
    "attributes": [], 
  };
  const tokenMetadataAnimation = {
    "description": "Friendly OpenSea Creature that enjoys long swims in the ocean.", 
    "external_url": "https://openseacreatures.io/3", 
    "image": "https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png",
    "animation_url": "https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png", 
    "name": "Dave Starbelly",
    "attributes": [], 
  };

// token specific not for metadata collection
// does following:
// 1. upload local file or url file to ipfs from "image" attribute
// file can be animation_url, image
// 2. replace image attribute with ipfs link
// 3. upload that (metadata file) to ipfs
const tokenURI = metadata.createTokenURI((tokenMetadata || localJsonFileAsTokenMetadata));
// returns ipfs hash or ipfs:// or https://ipfs.infura.io:5001

/**
 * BaseURI should be provided for each deployment of the `ERC721UserMintable` contract
 * BaseURI is a link to a repository with a collection a json file (e.g. ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq, https://myapp.io/)
 * repository structure example ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/
 * @image can be either an image from the filesystem or a provided url
 */
const baseURI = metadata.createbaseURI([
    'ipfs/file_token',
    'ipfs/file_token',
]);


/**
 * Usage of metadata in the template ERC721Mintable
 */
const newContract1 = await sdk.deploy({
  template: TEMPLATES.ERC721Mintable,
  params: {
    name: 'NFT contract',
    symbol: 'CNSYS',
    contractURI: contractURI, // Notes: the user can directly provide its own links without using our metadata utility class
    // contractURI is ipfs url of the metadata file
  },
});

newContract1.mint("0x0...123", tokenURI);


/**
 * Usage of metadata in the template ERC721UserMintable
 */
const newContract2 = await sdk.deploy({
  template: TEMPLATES.ERC721UserMintable,
  params: {
    name: 'NFT contract',
    symbol: 'CNSYS',
    contractURI: contractURI, // this is ipfs url of the metadata file
    baseURI: baseURI, // this is ipfs url for collection (folder)
    maxSupply: 10000,
    price: 1,
    maxTokenRequest: 20
  },
});

newContract2.mint(1);

console.log(`Contract 1 address is: ${newContract1.contractAddress}`);
console.log(`Contract 2 address is: ${newContract2.contractAddress}`);

