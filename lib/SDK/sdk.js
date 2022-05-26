import { utils } from 'ethers';
import Auth from '../Auth/Auth.js';
import { HttpService } from '../../services/httpService.js';
import NFT_API_URL from '../NFT/constants.js';
import ContractFactory from '../NFT/contractFactory.js';

export default class SDK {
  /* Private property */
  #auth;

  #apiPath;

  #httpClient;

  constructor(auth) {
    if (!(auth instanceof Auth)) {
      throw new Error('[SDK.constructor] You need to pass a valid instance of Auth class!');
    }
    this.#auth = auth;

    this.#apiPath = `/api/v1/networks/${this.#auth.getChainId()}/`;
    this.#httpClient = new HttpService(NFT_API_URL, this.#auth.getApiAuth());
  }

  /**
   * Deploy Contract on the blockchain
   * @param {{string, string}} template and params
   * @returns Contract instance
   */
  async deploy({ template, params }) {
    if (!template) throw new Error('Template type is required to deploy a new contract.');
    if (!params.name) throw new Error('Name is required to deploy a new contract.');

    const contract = ContractFactory.factory(template, this.#auth.getSigner());

    await contract.deploy(params);
    return contract;
  }

  /**
   * Load a contract from an existing contract address and a template
   * @param {string, string} template and contractAddress
   * @returns Contract instance
   */
  async loadContract({ template, contractAddress }) {
    if (!template) throw new Error('Template type is required to load a contract.');
    if (!contractAddress) throw new Error('A Contract address is required to load a contract.');

    const contract = ContractFactory.factory(template, this.#auth.getSigner());

    await contract.loadContract(contractAddress);
    return contract;
  }

  /**
   * Get contract metadata by contract address
   * @param {string} contractAddress
   * @returns {{string, string, string}} Contract metadata
   */
  async getContractMetadata(contractAddress) {
    if (!contractAddress || !utils.isAddress(contractAddress)) {
      throw new Error(
        '[SDK.getContractMetadata] You need to pass a valid contract address as parameter',
      );
    }

    const apiUrl = `${this.#apiPath}nfts/collection/metadata/${contractAddress}`;
    const {
      data: { symbol, name, tokenType },
    } = await this.#httpClient.get(apiUrl);

    return { symbol, name, tokenType };
  }

  /**
   * Get NFTs by an account address
   * @param  {string} address Account address
   * @param  {string} [includeMetadata=false]
   * @returns {[]} List of NFTs with metadata if includeMetadata flag is true
   */
  async getNFTs(address, includeMetadata = false) {
    if (!address || !utils.isAddress(address)) {
      throw new Error('[SDK.getNFTs] You need to pass a valid account address as parameter');
    }

    const apiUrl = `${this.#apiPath}nfts/${address}`;

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
  }

  /** Get NFTs by an contract address
   * @param {string} contractAddress
   * @returns {[]} List of NFTs with metadata
   */
  async getNFTsForCollection(contractAddress) {
    if (!contractAddress || !utils.isAddress(contractAddress)) {
      throw new Error(
        '[SDK.getNFTsForCollection] You need to pass a valid contract address as parameter',
      );
    }
    const apiUrl = `${this.#apiPath}nfts/collection/${contractAddress}`;

    const { data } = await this.#httpClient.get(apiUrl);
    return data;
  }

  /** Get token metadata
   * @param {string} contractAddress
   * @param {number} tokenId
   * @returns {[]} Token metadata
   */
  async getTokenMetadata(contractAddress, tokenId) {
    if (!contractAddress || !utils.isAddress(contractAddress)) {
      throw new Error(
        '[SDK.getTokenMetadata] You need to pass a valid contract address as first parameter',
      );
    }

    if (!Number.isFinite(tokenId)) {
      throw new Error('[SDK.getTokenMetadata] You need to pass the tokenId as second parameter');
    }

    const apiUrl = `${this.#apiPath}nfts/${contractAddress}/${tokenId}`;

    const { data } = await this.#httpClient.get(apiUrl);
    return data;
  }

  /** Get ETH balance
   * @param  {string} address Account address
   * @returns {[]} Account balance
   */
  async getEthBalance(address) {
    if (!address || !utils.isAddress(address)) {
      throw new Error('[SDK.getEthBalance] You need to pass a valid account address as parameter');
    }

    const apiUrl = `${this.#apiPath}assets/eth/accounts/${address}`;

    const {
      data: { balance },
    } = await this.#httpClient.get(apiUrl);
    return balance;
  }

  /** Get ERC20 balances
   * @param  {string} address Account address
   * @returns {[]} ERC20 balance
   */
  async getERC20Balances(address) {
    if (!address || !utils.isAddress(address)) {
      throw new Error(
        '[SDK.getERC20Balances] You need to pass a valid account address as parameter',
      );
    }

    const apiUrl = `${this.#apiPath}assets/erc20/accounts/${address}`;

    const { data } = await this.#httpClient.get(apiUrl);
    return data;
  }
}
