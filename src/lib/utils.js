import { ethers } from 'ethers';
import { chainUrls } from './Auth/availableChains.js';
import { networkErrorHandler, errorLogger, ERROR_LOG } from './error/handler.js';

/* eslint-disable */
export const isBoolean = val =>
  typeof val === 'boolean' ||
  (typeof val === 'object' && val !== null && typeof val.valueOf() === 'boolean');

export const isValidString = variable =>
  variable !== undefined && variable !== null && variable !== '' && typeof variable === 'string';

export const isDefined = variable => variable !== undefined && variable !== null && variable !== '';

export const isURI = URI => !!URI.match(/^(ipfs|http|https):\/\//gi);

export const formatRpcUrl = ({ chainId, projectId }) => {
  return `${chainUrls[chainId]}/v3/${projectId}`;
};

export const toBase64 = ({ projectId, secretId }) => btoa(`${projectId}:${secretId}`);

export const addGasPriceToOptions = (options, gas) => {
  const newOptions = options;
  if (gas) {
    if (typeof parseFloat(gas) !== 'number') {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.ERC721Mintable_addGasPriceToOptions,
          message: ERROR_LOG.message.invalid_gas_price_supplied,
        }),
      );
    }
    try {
      const gasPrice = ethers.utils.parseUnits(gas, 'gwei');
      newOptions.gasPrice = gasPrice;
    } catch (error) {
      const { message, type } = networkErrorHandler(error);
      throw new Error(`${type}[ERC721Mintable.addGasPriceToOptions] An error occured: ${message}`);
    }
  }
  return newOptions;
};
