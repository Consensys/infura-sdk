/* eslint-disable */
import { ethers } from 'ethers';
import { HttpService } from '../../services/httpService.js';
import { NFT_API_URL } from './constants.js';
import { BaseContract } from './contracts/baseContract.js';

export class ExternallyOwnedAccount {
  /* Private property */
  _httpClient = null;
  _apiPath = null;

  constructor({ privateKey, apiKey, rpcUrl, chainId }) {
    if (!privateKey) throw new Error('[ExternallyOwnedAccount.constructor] privateKey is missing!');
    if (!apiKey) throw new Error('[ExternallyOwnedAccount.constructor] apiKey is missing!');
    if (!rpcUrl) throw new Error('[ExternallyOwnedAccount.constructor] rpcUrl is missing!');

    this.provider = this._connectDefaultProvider(rpcUrl);
    this.wallet = this._connectWallet(privateKey, this.provider);
    this._apiPath = `/api/v1/networks/${chainId}`;

    // TBD: Base_URL! will go in .env or constants. Will users provide base url and api key?
    this._httpClient = new HttpService(NFT_API_URL, apiKey);
  }

  /**
   * Private method!
   * Connect Default RPC Provider
   * @param  {string} rpcUrl
   * @return  {object} Provider
   */
  _connectDefaultProvider(rpcUrl) {
    return ethers.providers.getDefaultProvider(rpcUrl);
  }

  /**
   * Private method!
   * Connect User Wallet
   * @param  {string} privateKey
   * @param  {object} provider
   * @return  {object} Wallet
   */
  _connectWallet(privateKey, provider) {
    return new ethers.Wallet(privateKey, provider);
  }

  /**
   * Create Smart Contract and Deploy on the Blockchain.
   * @param  {string} template
   * @returns {string} Smart Contract Abstraction
   */
  async createSmartContract(template) {
    return BaseContract.factory(template, this.wallet);
  }

  /**
   * Get existing contract.
   * @param  {string} template
   * @param  {string} contract address
   * @returns {string} contract instance
   */
  async getContractFromAddress(template, contractAddress) {
    return BaseContract.getFromAddress(template, this.wallet, contractAddress);
  }

  /**
   * Get NFTs by an account address
   * @returns {[]} List of NFTs with metadata
   */
  async getNFTs(includeMetadata = false) {
    // TODO: add headers X-Csi-Version: 1 (api version)
    // TODO: get address from wallet
    const apiUrl = `${this._apiPath}${accountAddress}`;
    try {
      const { data } = await this._httpClient.instance.get(apiUrl);
      return data;
    } catch (error) {
      throw new Error(error).stack;
    }
  }
}
