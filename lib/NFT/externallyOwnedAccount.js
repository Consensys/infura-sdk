/* eslint-disable */
import { ethers } from 'ethers';
import { HttpService } from '../../services/httpService.js';
import { UserService } from '../../services/userService.js';
import fs from 'fs';
import { NFT_API_URL } from './constants.js';

const smartContractArtifact = JSON.parse(fs.readFileSync('ERC721.json'));

export class ExternallyOwnedAccount {
  /* Private property */
  _httpClient = null;
  _user = null;
  _apiPath = null;

  constructor({ privateKey, apiKey, rpcUrl, chainId }) {
    if (!privateKey) throw new Error('[ExternallyOwnedAccount.constructor] privateKey is missing!');
    if (!apiKey) throw new Error('[ExternallyOwnedAccount.constructor] apiKey is missing!');
    if (!rpcUrl) throw new Error('[ExternallyOwnedAccount.constructor] rpcUrl is missing!');

    this._user = new UserService();

    this.provider = this._connectDefaultProvider(rpcUrl);

    this.wallet = this._connectWallet(privateKey, this.provider);

    this._apiPath = `/api/v1/networks/${chainId}/nfts/`;

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
   * @param  {string} type
   * @param  {string} name
   * @param  {abi: string, bytecode: string} metadata
   * @param  {string} symbol
   * @returns {string} Smart Contract
   */
  async createSmartContract(name, symbol) {
    const factory = new ethers.ContractFactory(
      smartContractArtifact.abi,
      smartContractArtifact.bytecode,
      this.wallet,
    );

    const contract = await factory.deploy(name, symbol);
    await contract.deployed();
    console.log(`Deployment successful! Contract Address: ${contract.address}`);
    return contract;
  }
  /**
   * Get NFTs by an account address
   * @param  string accountAddress
   * @param  string authorizationHeader
   * @returns {[]} List of NFTs with metadata
   */
  async getNFTs(accountAddress) {
    const apiUrl = `${this._apiPath}${accountAddress}`;
    try {
      const { data } = await this._httpClient.instance.get(apiUrl);
      return data;
    } catch (error) {
      throw new Error(error).stack;
    }
  }
}
