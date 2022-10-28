import { config as loadEnv } from 'dotenv';
import { wait } from './test/utils.js';
import { SDK, Auth, TEMPLATES } from './index.js';
import NFTApiClient from './nftClient.js';

loadEnv();
const ownerAddress = process.env.WALLET_PUBLIC_ADDRESS;
/* const API_KEY = Buffer.from(
  `${process.env.INFURA_PROJECT_ID}:${process.env.INFURA_PROJECT_SECRET}`,
).toString('base64'); */

describe('Auth', () => {
  jest.setTimeout(120 * 1000);
  const nftApiClient = new NFTApiClient();
  it('NFT Api - Get all nfts by owner address', async () => {
    const response = await nftApiClient.getAllNftsByOwner(ownerAddress);
    expect(response.status).toBe(200);
    expect(response.data.type).toEqual('NFT');
    const authInfo = {
      privateKey: process.env.WALLET_PRIVATE_KEY,
      projectId: process.env.INFURA_PROJECT_ID,
      secretId: process.env.INFURA_PROJECT_SECRET,
      rpcUrl: process.env.EVM_RPC_URL,
      chainId: 5,
    };
    const acc = new Auth(authInfo);
    const sdk = new SDK(acc);
    const contract = {
      template: TEMPLATES.ERC721Mintable,
      params: {
        name: 'get_all_nfts_contract',
        symbol: 'TOC',
        contractURI: 'https://test.io',
      },
    };
    console.log('Antes del deploy ', sdk);
    const newContract = await sdk.deploy(contract);
    console.log('aqui llega');
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
});
