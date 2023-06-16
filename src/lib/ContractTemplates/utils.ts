/* istanbul ignore file */
import axios from 'axios';
import { GAS_LIMIT } from '../constants';

export default async function preparePolygonTransaction(nonce: number) {
  try {
    const { data } = await axios({
      method: 'get',
      url: 'https://gasstation.polygon.technology/v2',
    });
    const gas = data.fast;

    // convert priority fee and max fee from GWEI to WEI
    const priority = Math.trunc(gas.maxPriorityFee * 10 ** 9);
    const max = Math.trunc(gas.maxFee * 10 ** 9);
    const maxFeePerGas = max.toString();
    const maxPriorityFeePerGas = priority.toString();
    return {
      nonce,
      maxFeePerGas,
      maxPriorityFeePerGas,
      gasLimit: GAS_LIMIT,
    };
  } catch (err) {
    return {
      gas: GAS_LIMIT,
    };
  }
}
