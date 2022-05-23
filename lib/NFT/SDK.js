import Auth from '../Auth';
import { HttpService } from '../../services/httpService';
import NFT_API_URL from './constants';

export default class SDK {
  /* Private property */
  #auth = null;

  #apiPath = null;

  #httpClient = null;

  constructor(auth) {
    if (!(auth instanceof Auth)) {
      throw new Error('[SDK.constructor] You need to pass a valid instance of Auth class!');
    }
    this.#auth = auth;

    this.#apiPath = `/api/v1/networks/${this.#auth.getChainId()}/`;
    this.#httpClient = new HttpService(NFT_API_URL, this.#auth.getApiAuth());
  }

  /**
   * Get contract metadata by contract address
   * @param {string} contractAddress
   * @returns {{string, string, string}} Contract metadata
   */
  async getContractMetadata(contractAddress) {
    if (!contractAddress) {
      throw new Error(
        '[SDK.getContractMetadata] You need to pass the contract address as parameter',
      );
    }

    const apiUrl = `${this.#apiPath}nfts/collection/metadata/${contractAddress}`;
    try {
      const {
        data: { name, symbol, tokenType },
      } = await this.#httpClient.get(apiUrl);
      return { name, symbol, tokenType };
    } catch (error) {
      throw new Error(error).stack;
    }
  }

  /**
   * Get NFTs by an account address
   * @param  {string} address Account address
   * @param  {string} [includeMetadata=false]
   * @returns {[]} List of NFTs with metadata if includeMetadata flag is true
   */
  async getNFTs(address, includeMetadata = false) {
    if (!address) {
      throw new Error('[SDK.getNFTs] You need to pass the account address as parameter');
    }

    const apiUrl = `${this.#apiPath}nfts/${address}`;
    try {
      const { data } = await this.#httpClient.get(apiUrl);

      if (!includeMetadata) {
        return {
          ...data,
          assets: data.assets.map(asset => {
            const { metadata, ...rest } = asset;
            return rest;
          }),
        };
      }

      return data;
    } catch (error) {
      throw new Error(error).stack;
    }
  }

  /** Get NFTs by an contract address
   * @param {string} contractAddress
   * @returns {[]} List of NFTs with metadata
   */
  async getNFTsForCollection(contractAddress) {
    if (!contractAddress) {
      throw new Error(
        '[SDK.getNFTsForCollection] You need to pass the contract address as parameter',
      );
    }
    const apiUrl = `${this.#apiPath}nfts/collection/${contractAddress}`;

    try {
      const { data } = await this.#httpClient.get(apiUrl);
      return data;
    } catch (error) {
      throw new Error(error).stack;
    }
  }

  /** Get token metadata
   * @param {string} contractAddress
   * @param {number} tokenId
   * @returns {[]} Token metadata
   */
  async getTokenMetadata(contractAddress, tokenId) {
    if (!contractAddress) {
      throw new Error(
        '[SDK.getTokenMetadata] You need to pass the contract address as first parameter',
      );
    }

    if (!Number.isFinite(tokenId)) {
      throw new Error('[SDK.getTokenMetadata] You need to pass the tokenId as second parameter');
    }

    const apiUrl = `${this.#apiPath}nfts/${contractAddress}/${tokenId}`;
    try {
      const { data } = await this.#httpClient.get(apiUrl);
      return data;
    } catch (error) {
      throw new Error(error).stack;
    }
  }

  /** Get ETH balance
   * @param  {string} address Account address
   * @returns {[]} Account balance
   */
  async getEthBalance(address) {
    if (!address) {
      throw new Error('[SDK.getEthBalance] You need to pass the account address as parameter');
    }

    const apiUrl = `${this.#apiPath}assets/eth/accounts/${address}`;
    try {
      const {
        data: { balance },
      } = await this.#httpClient.get(apiUrl);
      return balance;
    } catch (error) {
      throw new Error(error).stack;
    }
  }

  /** Get ERC20 balance
   * @param  {string} address Account address
   * @returns {[]} ERC20 balance
   */
  async getERC20Balance(address) {
    if (!address) {
      throw new Error('[SDK.getERC20Balance] You need to pass the account address as parameter');
    }

    const apiUrl = `${this.#apiPath}assets/erc20/accounts/${address}`;
    try {
      const { data } = await this.#httpClient.get(apiUrl);
      return data;
    } catch (error) {
      throw new Error(error).stack;
    }
  }
}
