import { config as loadEnv } from 'dotenv';
import { SDK, Auth } from './src/index';

loadEnv();

async () => {
  const acc = new Auth({
    privateKey: process.env.WALLET_PRIVATE_KEY,
    projectId: process.env.INFURA_PROJECT_ID,
    secretId: process.env.INFURA_PROJECT_SECRET,
    rpcUrl: process.env.EVM_RPC_URL,
    chainId: 5,
    ipfs: {
      projectId: process.env.INFURA_IPFS_PROJECT_ID,
      apiKeySecret: process.env.INFURA_IPFS_PROJECT_SECRET,
    },
  });

  const sdk = new SDK(acc, '1');
};
