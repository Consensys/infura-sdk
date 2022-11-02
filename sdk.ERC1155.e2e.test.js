import { config as loadEnv } from 'dotenv';
import { wait } from './test/utils.js';
import { SDK, Auth, TEMPLATES } from './index.js';
import NFTApiClient from './nftClient.js';
import { errorLogger, ERROR_LOG } from './src/lib/error/handler.js';

loadEnv();
const ownerAddress = process.env.WALLET_PUBLIC_ADDRESS;
const tokenURI = 'https://';
/* const API_KEY = Buffer.from(
  `${process.env.INFURA_PROJECT_ID}:${process.env.INFURA_PROJECT_SECRET}`,
).toString('base64'); */
const authInfo = {
  privateKey: process.env.WALLET_PRIVATE_KEY,
  projectId: process.env.INFURA_PROJECT_ID,
  secretId: process.env.INFURA_PROJECT_SECRET,
  rpcUrl: process.env.EVM_RPC_URL,
  chainId: 5,
};
const contractInfo = {
  template: TEMPLATES.ERC1155Mintable,
  params: {
    name: 'Contract for testing',
    symbol: 'TOC',
    contractURI: 'https://test.io',
  },
};
describe('SDK - ERC1155 - contract interaction (deploy, load and mint)', () => {
  jest.setTimeout(60 * 1000 * 10);
  const nftApiClient = new NFTApiClient();
  it.only('Deploy - Get all nfts by owner address', async () => {
    const response = await nftApiClient.getAllNftsByOwner(ownerAddress);
    expect(response.status).toBe(200);
    expect(response.data.type).toEqual('NFT');
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const newContract = await sdk.deploy(contractInfo);
    const mintHash = await newContract.mint({
      publicAddress: ownerAddress,
      tokenURI: 'https://ipfs.io/ipfs/QmRfModHffFedTkHSW1ZEn8f19MdPztn9WV3kY1yjaKvBy',
    });
    const receipt = await mintHash.wait();
    expect(receipt.status).toEqual(1);

    await wait(
      async () => {
        const resp = await nftApiClient.getAllNftsByOwner(ownerAddress);
        return resp.data.total > response.data.total;
      },
      120000,
      1000,
      'Waiting for NFT collection to be available',
    );
    const response2 = await nftApiClient.getAllNftsByOwner(ownerAddress);
    expect(response2.data.total).toBeGreaterThan(response.data.total);
  });
  it('Deploy - Get all nfts from a collection', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const contract = await sdk.deploy(contractInfo);
    const mintHash1 = await contract.mint({
      publicAddress: ownerAddress,
      tokenURI,
    });
    const receipt1 = await mintHash1.wait();
    expect(receipt1.status).toEqual(1);

    const mintHash2 = await contract.mint({
      publicAddress: ownerAddress,
      tokenURI,
    });
    const receipt2 = await mintHash2.wait();
    expect(receipt2.status).toEqual(1);
    const mintHash3 = await contract.mint({
      publicAddress: ownerAddress,
      tokenURI,
    });
    const receipt3 = await mintHash3.wait();
    expect(receipt3.status).toEqual(1);

    console.log(contract.contractAddress);

    let response;
    const startTime = Date.now();
    await wait(
      async () => {
        response = await nftApiClient.getAllNfsFromCollection(contract.contractAddress);
        return response.data.total === 3;
      },
      600000,
      1000,
      'Waiting for NFT collection to be available',
    );
    const finishTime = Date.now();
    console.log(finishTime - startTime);
    response.data.assets.forEach(asset => {
      expect(asset.contract.toLowerCase()).toEqual(contract.contractAddress.toLowerCase());
      expect(asset.type).toEqual('ERC721');
    });
  });

  it('Deploy - Get all collection metadata', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    console.log('hace deploy');
    const contract = await sdk.deploy(contractInfo);

    console.log('Minting');
    const mintHash1 = await contract.mint({
      publicAddress: ownerAddress,
      tokenURI,
    });
    const receipt1 = await mintHash1.wait();
    expect(receipt1.status).toEqual(1);
    let response;
    await wait(
      async () => {
        response = await nftApiClient.getNftCollectionMetadata(contract.contractAddress);
        return response.status === 200;
      },
      120000,
      1000,
      'Waiting for NFT collection to be available',
    );
    response = await nftApiClient.getNftCollectionMetadata(contract.contractAddress);
    expect(response.data.contract).not.toBeNull();
    expect(response.data.name).toEqual(contractInfo.params.name);
    expect(response.data.symbol).toEqual(contractInfo.params.symbol);
    expect(response.data.tokenType).toEqual('ERC721');
  }, 240000);
  it('Deploy - Get NFT metadata', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const newContract = await sdk.deploy(contractInfo);

    const mintHash1 = await newContract.mint({
      publicAddress: ownerAddress,
      tokenURI: 'https://ipfs.io/ipfs/QmRfModHffFedTkHSW1ZEn8f19MdPztn9WV3kY1yjaKvBy',
    });
    const receipt1 = await mintHash1.wait();
    expect(receipt1.status).toEqual(1);
    await wait(
      async () => {
        const response = await nftApiClient.getAllNfsFromCollection(newContract.contractAddress);
        return response.data.total === 1;
      },
      90000,
      1000,
      'Waiting for NFT collection to be available',
    );

    const response = await nftApiClient.getNftMetadeta(newContract.contractAddress, '0');
    expect(response.data.contract.toLowerCase()).toEqual(newContract.contractAddress.toLowerCase());
    expect(response.data.metadata.name).toEqual('Astro Soccer');
    expect(response.data.metadata.description).toEqual(
      "The world's most adorable and sensitive pup.",
    );
    expect(response.data.metadata.image).toContain('https://ipfs.io/ipfs/');
    expect(response.data.metadata.attributes).not.toBeNull();
  }, 240000);
  it('Load existing contract', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const newContract = await sdk.deploy(contractInfo);
    const loadedContract = await sdk.loadContract({
      template: TEMPLATES.ERC721Mintable,
      contractAddress: newContract.contractAddress,
    });
    expect(loadedContract.contractAddress).toEqual(newContract.contractAddress);
  });
  it('Load unexisting contract', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const cont = {
      template: TEMPLATES.ERC721Mintable,
      contractAddress: '',
    };
    const contract = async () => {
      await sdk.loadContract(cont);
    };
    expect(contract).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.SDK_loadContract,
        message: ERROR_LOG.message.no_address_supplied,
      }),
    );
  });
  it('Load old contract', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const cont = {
      template: TEMPLATES.ERC721Mintable,
      contractAddress: '0x80c9B1a1310d4f38fF1AD0450d2c242780F27259',
    };
    const contract = await sdk.loadContract(cont);
    expect(contract.contractAddress).toEqual(cont.contractAddress);
  });
  it('Load new contract and get Metadata', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const newContract = await sdk.deploy(contractInfo);
    const mintHash1 = await newContract.mint({
      publicAddress: ownerAddress,
      tokenURI: 'https://ipfs.io/ipfs/QmRfModHffFedTkHSW1ZEn8f19MdPztn9WV3kY1yjaKvBy',
    });
    const receipt1 = await mintHash1.wait();
    expect(receipt1.status).toEqual(1);
    const meta = await sdk.getContractMetadata({ contractAddress: newContract.contractAddress });
    expect(meta.symbol).toEqual(contractInfo.params.symbol);
    expect(meta.name).toEqual(contractInfo.params.name);
    expect(meta.tokenType).toEqual('ERC721');
  });
  /* Skipped for now as Moralis is not able to reply with metadata until a token is minted
  it('Deploy a contract and get Metadata', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const newContract = await sdk.deploy(contractInfo);
    console.log(newContract.contractAddress);
    const meta = await sdk.getContractMetadata({ contractAddress: newContract.contractAddress });
    expect(meta.symbol).toEqual(contractInfo.params.symbol);
    expect(meta.name).toEqual(contractInfo.params.name);
    expect(meta.tokenType).toEqual('ERC721');
  }); */
});
