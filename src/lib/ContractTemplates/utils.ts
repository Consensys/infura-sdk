import { ethers, providers } from 'ethers';
import axios from 'axios';
import { GAS_LIMIT } from '../constants';

export default async function preparePolygonTransaction(signerAddress: string) {
  const provider = new providers.InfuraProvider('matic', process.env.INFURA_API_KEY);
  const testSigner = new ethers.Wallet(signerAddress, provider);
  const nonce = await provider.getTransactionCount(testSigner.address);

  const { data } = await axios({
    method: 'get',
    url: 'https://gasstation-mainnet.matic.network/v2',
  });

  const gas = data.fast;

  // convert priority fee and max fee from GWEI to WEI
  const priority = Math.trunc(gas.maxPriorityFee * 10 ** 9);
  const max = Math.trunc(gas.maxFee * 10 ** 9);
  const maxFeePerGas = max.toString();
  const maxPriorityFeePerGas = priority.toString();
  console.log('maxFeePerGas: ', maxFeePerGas);
  console.log('maxPriorityFeePerGas: ', maxPriorityFeePerGas);

  return {
    nonce,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasLimit: GAS_LIMIT,
  };
}
