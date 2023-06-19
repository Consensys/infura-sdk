import { ethers } from 'ethers';
import { chainUrls } from './Auth/availableChains';
import { Logger, log } from './Logger';

type FormatRpcUrlOptions = {
  chainId: number;
  projectId: string;
};

export enum ApiVersion {
  V1 = '1',
}

export const isBoolean = (val: boolean | object): boolean =>
  typeof val === 'boolean' ||
  (typeof val === 'object' && val !== null && typeof val.valueOf() === 'boolean');

export const isValidString = (variable: string | undefined): boolean =>
  variable !== undefined && variable !== null && variable !== '' && typeof variable === 'string';

export const isDefined = (variable: string | number | undefined): boolean =>
  variable !== undefined && variable !== null && variable !== '';

export const isURI = (URI: string): boolean => !!URI.match(/^(ipfs|http|https):\/\//gi);

export const formatRpcUrl = ({ chainId, projectId }: FormatRpcUrlOptions) =>
  `${chainUrls[chainId]}/v3/${projectId}`;

export const isJson = (param: string) => {
  if (typeof param !== 'string') return false;
  try {
    JSON.parse(param);
  } catch (err) {
    return false;
  }
  return true;
};

// eslint-disable-next-line no-promise-executor-return
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const addGasPriceToOptions = (
  options: any,
  gas: string | undefined,
  maxFeePerGas?: string | undefined,
  maxPriorityFeePerGas?: string | undefined,
) => {
  const newOptions = options;

  try {
    if (gas) {
      if (typeof parseFloat(gas) !== 'number') {
        log.throwArgumentError(Logger.message.invalid_gas_price_supplied, 'gas', gas, {
          // TODO: update location
          location: Logger.location.ERC721MINTABLE_ADDGASPRICETOOPTIONS,
        });
      }
      newOptions.gasPrice = ethers.utils.parseUnits(gas, 'gwei');
    } else if (maxFeePerGas || maxPriorityFeePerGas) {
      newOptions.maxFeePerGas = maxFeePerGas;
      newOptions.maxPriorityFeePerGas = maxPriorityFeePerGas;
    }
  } catch (error) {
    return log.throwError(Logger.message.ethers_error, Logger.code.NETWORK, {
      // TODO: update location
      location: Logger.location.ERC721MINTABLE_ADDGASPRICETOOPTIONS,
      error,
    });
  }

  return newOptions;
};

export const isValidPrice = (str: string) => {
  if (typeof str !== 'string') return false;
  if (parseFloat(str) < 0) return false;
  return !Number.isNaN(str) && !Number.isNaN(parseFloat(str));
};

export const isValidPositiveNumber = (n: number) => {
  if (n < 0) return false;
  return !Number.isNaN(n);
};
