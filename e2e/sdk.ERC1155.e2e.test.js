import { config as loadEnv } from 'dotenv';
import { wait } from './utils/utils.js';
import { SDK, Auth, TEMPLATES } from '../index.js';
import NFTApiClient from './utils/nftClient.js';
import { errorLogger, ERROR_LOG } from '../src/lib/error/handler.js';

loadEnv();
const ownerAddress = process.env.WALLET_PUBLIC_ADDRESS;
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
    baseURI: 'https://test.io',
    contractURI: 'https://test.io',
    ids: [],
  },
};
describe('SDK - ERC1155 - contract interaction (deploy, load and mint)', () => {
  jest.setTimeout(60 * 1000 * 10);
  const nftApiClient = new NFTApiClient();
  it('Deploy - Get all nfts by owner address', async () => {
    const response = await nftApiClient.getAllNftsByOwner(ownerAddress);
    expect(response.status).toBe(200);
    expect(response.data.type).toEqual('NFT');
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const newContract = await sdk.deploy(contractInfo);
    const mintHash = await newContract.mint({
      to: ownerAddress,
      id: 0,
      quantity: 3,
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
      'Waiting for new nft to be available',
    );
    const response2 = await nftApiClient.getAllNftsByOwner(ownerAddress);
    expect(response2.data.total).toBeGreaterThan(response.data.total);
  });
  it('Deploy - Get all nfts from a collection', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const contract = await sdk.deploy(contractInfo);
    const mintHash1 = await contract.mint({
      to: ownerAddress,
      id: 0,
      quantity: 3,
    });
    const receipt1 = await mintHash1.wait();
    expect(receipt1.status).toEqual(1);

    const mintHash2 = await contract.mint({
      to: ownerAddress,
      id: 2,
      quantity: 3,
    });
    const receipt2 = await mintHash2.wait();
    expect(receipt2.status).toEqual(1);
    const mintHash3 = await contract.mint({
      to: ownerAddress,
      id: 3,
      quantity: 3,
    });
    const receipt3 = await mintHash3.wait();
    expect(receipt3.status).toEqual(1);

    let response;
    const startTime = Date.now();
    await wait(
      async () => {
        response = await nftApiClient.getAllNfsFromCollection(contract.contractAddress);
        return response.data.total === 3;
      },
      600000,
      1000,
      'Waiting for NFT collection to be available from api',
    );
    const finishTime = Date.now();
    console.log(finishTime - startTime);
    response.data.assets.forEach(asset => {
      expect(asset.contract.toLowerCase()).toEqual(contract.contractAddress.toLowerCase());
      expect(asset.type).toEqual('ERC1155');
      expect(asset.supply).toEqual('3');
    });
  });

  it('Deploy - Get all collection metadata', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const contract = await sdk.deploy(contractInfo);

    const mintHash1 = await contract.mint({
      to: ownerAddress,
      id: 0,
      quantity: 3,
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
      // eslint-disable-next-line sonarjs/no-duplicate-string
      'Waiting for NFT collection to be available',
    );
    response = await nftApiClient.getNftCollectionMetadata(contract.contractAddress);
    expect(response.data.contract).not.toBeNull();
    expect(response.data.name).toEqual(null);
    expect(response.data.symbol).toEqual(null);
    expect(response.data.tokenType).toEqual('ERC1155');
  }, 240000);
  it('Mint batch', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const newContract = await sdk.deploy(contractInfo);

    const mintHash1 = await newContract.mintBatch({
      to: ownerAddress,
      ids: [0, 1, 2],
      quantities: [1, 2, 3],
    });
    const receipt1 = await mintHash1.wait();
    expect(receipt1.status).toEqual(1);
    await wait(
      async () => {
        const response = await nftApiClient.getAllNfsFromCollection(newContract.contractAddress);
        return response.data.total === 3 && response.data.assets.length === 3;
      },
      90000,
      1000,
      'Waiting for NFT collection to be available',
    );

    const response = await nftApiClient.getAllNfsFromCollection(newContract.contractAddress);
    expect(response.data.assets.length).toEqual(3);
    const token0 = response.data.assets.filter(ele => ele.tokenId === '0')[0];
    expect(token0.contract.toLowerCase()).toEqual(newContract.contractAddress.toLowerCase());
    expect(token0.tokenId).toEqual('0');
    expect(token0.supply).toEqual('1');
    expect(token0.type).toEqual('ERC1155');
    const token1 = response.data.assets.filter(ele => ele.tokenId === '1')[0];
    expect(token1.contract.toLowerCase()).toEqual(newContract.contractAddress.toLowerCase());
    expect(token1.tokenId).toEqual('1');
    expect(token1.supply).toEqual('2');
    expect(token1.type).toEqual('ERC1155');
    const token2 = response.data.assets.filter(ele => ele.tokenId === '2')[0];
    expect(token2.contract.toLowerCase()).toEqual(newContract.contractAddress.toLowerCase());
    expect(token2.tokenId).toEqual('2');
    expect(token2.supply).toEqual('3');
    expect(token2.type).toEqual('ERC1155');
  }, 240000);
  it('Load existing contract', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const newContract = await sdk.deploy(contractInfo);
    const loadedContract = await sdk.loadContract({
      template: TEMPLATES.ERC1155Mintable,
      contractAddress: newContract.contractAddress,
    });
    expect(loadedContract.contractAddress).toEqual(newContract.contractAddress);
  });
  it('Load unexisting contract', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const cont = {
      template: TEMPLATES.ERC1155Mintable,
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
      template: TEMPLATES.ERC1155Mintable,
      contractAddress: '0x9F2001302362c94DEaE3a08295a6a957f271F470',
    };
    const contract = await sdk.loadContract(cont);
    expect(contract.contractAddress).toEqual(cont.contractAddress);
  });
  it.only('Load new contract and get Metadata', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const newContract = await sdk.deploy(contractInfo);
    const mintHash1 = await newContract.mint({
      to: ownerAddress,
      id: 0,
      quantity: 1,
    });
    const receipt1 = await mintHash1.wait();
    expect(receipt1.status).toEqual(1);
    const meta = await sdk.getContractMetadata({ contractAddress: newContract.contractAddress });
    expect(meta.tokenType).toEqual('ERC1155');
  });

  it('deploy a contract and addIds', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const newContract = await sdk.deploy(contractInfo);
    const hash = await newContract.addIds({ ids: [0] });
    const receipt1 = await hash.wait();
    expect(receipt1.status).toEqual(1);
    const mintHash = await newContract.mint({
      to: ownerAddress,
      id: 0,
      quantity: 1,
    });
    await mintHash.wait();
    await wait(
      async () => {
        const response = await nftApiClient.getAllNfsFromCollection(newContract.contractAddress);
        return response.data.total === 1;
      },
      90000,
      1000,
      'Waiting for NFT collection to be available',
    );
    const collection = await nftApiClient.getAllNfsFromCollection(newContract.contractAddress);
    expect(collection.data.total).toEqual(1);
  });
  it.skip('deploy a contract and setBaseURI', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const newContract = await sdk.deploy(contractInfo);
    const hash = await newContract.setBaseURI({
      baseURI: 'https://ipfs.io/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq',
    });
    const receipt1 = await hash.wait();
    expect(receipt1.status).toEqual(1);
    const mintHash = await newContract.mint({
      to: ownerAddress,
      id: 0,
      quantity: 1,
    });
    await mintHash.wait();
    await wait(
      async () => {
        const response = await nftApiClient.getAllNfsFromCollection(newContract.contractAddress);
        console.log(response.data);
        return (
          // eslint-disable-next-line operator-linebreak
          response.status === 200 &&
          // eslint-disable-next-line operator-linebreak
          response.data.total === 1 &&
          response.data.assets[0].metadata !== null
        );
      },
      120000,
      1000,
      'Waiting for NFT collection to be available',
    );
    const collection = await nftApiClient.getAllNfsFromCollection(newContract.contractAddress);
    console.log(collection.data);
    expect(collection.data.total).toEqual(1);
  });
  it.skip('deploy a contract and transfer', async () => {
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const newContract = await sdk.deploy(contractInfo);
    const hash = await newContract.tran({
      baseURI: 'https://ipfs.io/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq',
    });
    const receipt1 = await hash.wait();
    expect(receipt1.status).toEqual(1);
    const mintHash = await newContract.mint({
      to: ownerAddress,
      id: 0,
      quantity: 1,
    });
    await mintHash.wait();
    await wait(
      // eslint-disable-next-line sonarjs/no-identical-functions
      async () => {
        const response = await nftApiClient.getAllNfsFromCollection(newContract.contractAddress);
        console.log(response.data);
        return (
          // eslint-disable-next-line operator-linebreak
          response.status === 200 &&
          // eslint-disable-next-line operator-linebreak
          response.data.total === 1 &&
          response.data.assets[0].metadata !== null
        );
      },
      120000,
      1000,
      'Waiting for NFT collection to be available',
    );
    const collection = await nftApiClient.getAllNfsFromCollection(newContract.contractAddress);
    console.log(collection.data);
    expect(collection.data.total).toEqual(1);
  });
});
