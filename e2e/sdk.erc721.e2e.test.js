import { config as loadEnv } from 'dotenv';
import { existingContractAddress, wait } from './utils/utils.js';
import { SDK, Auth, TEMPLATES } from '../index.js';
import { errorLogger, ERROR_LOG } from '../src/lib/error/handler.js';

loadEnv();
const ownerAddress = process.env.WALLET_PUBLIC_ADDRESS;
const tokenURI = 'https://';
const authInfo = {
  privateKey: process.env.WALLET_PRIVATE_KEY,
  projectId: process.env.INFURA_PROJECT_ID,
  secretId: process.env.INFURA_PROJECT_SECRET,
  rpcUrl: process.env.EVM_RPC_URL,
  chainId: 5,
};
const contractInfo = {
  template: TEMPLATES.ERC721Mintable,
  params: {
    name: 'Contract for testing',
    symbol: 'TOC',
    contractURI: 'https://test.io',
  },
};
describe('SDK - contract interaction (deploy, load and mint)', () => {
  jest.setTimeout(60 * 1000 * 10);
  it('Deploy - Get all nfts by owner address', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const response = await sdk.getNFTs({ publicAddress: ownerAddress, includeMetadata: false });
    expect(response.type).toEqual('NFT');
    const newContract = await sdk.deploy(contractInfo);
    const mintHash = await newContract.mint({
      publicAddress: ownerAddress,
      // eslint-disable-next-line sonarjs/no-duplicate-string
      tokenURI: 'https://ipfs.io/ipfs/QmRfModHffFedTkHSW1ZEn8f19MdPztn9WV3kY1yjaKvBy',
    });
    const receipt = await mintHash.wait();
    expect(receipt.status).toEqual(1);

    await wait(
      async () => {
        const resp = await sdk.getNFTs({ publicAddress: ownerAddress, includeMetadata: false });
        return resp.total > response.total;
      },
      120000,
      1000,
      'Waiting for NFT collection to be available for an user',
    );
    const response2 = await sdk.getNFTs({ publicAddress: ownerAddress, includeMetadata: false });
    expect(response2.total).toBeGreaterThan(response.total);
    expect(response2.assets[0].metadata).toEqual(undefined);
    const response3 = await sdk.getNFTs({ publicAddress: ownerAddress, includeMetadata: true });
    const createdToken = await response3.assets.filter(
      asset => asset.contract.toLowerCase() === newContract.contractAddress.toLowerCase(),
    );
    expect(createdToken.metadata).not.toBeNull();
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

    let response;
    await wait(
      async () => {
        response = await sdk.getNFTsForCollection({ contractAddress: contract.contractAddress });
        return response.total === 3;
      },
      600000,
      1000,
      'Waiting for NFT collection to be available',
    );
    response.assets.forEach(asset => {
      expect(asset.contract.toLowerCase()).toEqual(contract.contractAddress.toLowerCase());
      expect(asset.type).toEqual('ERC721');
    });
  });

  it('Deploy - Get all collection metadata', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const contract = await sdk.deploy(contractInfo);

    const mintHash1 = await contract.mint({
      publicAddress: ownerAddress,
      tokenURI,
    });
    const receipt1 = await mintHash1.wait();
    expect(receipt1.status).toEqual(1);
    let response;
    await wait(
      async () => {
        response = await sdk.getContractMetadata({ contractAddress: contract.contractAddress });
        return response !== null;
      },
      300000,
      1000,
      'Waiting for NFT collection metadata to be available',
    );
    response = await sdk.getContractMetadata({ contractAddress: contract.contractAddress });
    expect(response.name).toEqual(contractInfo.params.name);
    expect(response.symbol).toEqual(contractInfo.params.symbol);
    expect(response.tokenType).toEqual('ERC721');
  }, 240000);
  it('Deploy - Get NFT metadata', async () => {
    // and NFT api is returning null
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
        const response = await sdk.getTokenMetadata({
          contractAddress: newContract.contractAddress,
          tokenId: 0,
        });
        return response.metadata !== null;
      },
      600000,
      1000,
      'Waiting for NFT metadata to be available',
    );

    const response = await sdk.getTokenMetadata({
      contractAddress: newContract.contractAddress,
      tokenId: 0,
    });
    expect(response.contract.toLowerCase()).toEqual(newContract.contractAddress.toLowerCase());
    expect(response.metadata.name).toEqual('Astro Soccer');
    expect(response.metadata.description).toEqual("The world's most adorable and sensitive pup.");
    expect(response.metadata.image).toContain('https://ipfs.io/ipfs/');
    expect(response.metadata.attributes).not.toBeNull();
  }, 600000);

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
      contractAddress: existingContractAddress,
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
    await wait(
      async () => {
        const response = await sdk.getContractMetadata({
          contractAddress: newContract.contractAddress,
        });

        return response !== null;
      },
      300000,
      1000,
      'Waiting for NFT metadata to be available',
    );
    const meta = await sdk.getContractMetadata({ contractAddress: newContract.contractAddress });
    expect(meta.symbol).toEqual(contractInfo.params.symbol);
    expect(meta.name).toEqual(contractInfo.params.name);
    expect(meta.tokenType).toEqual('ERC721');
  });
});
