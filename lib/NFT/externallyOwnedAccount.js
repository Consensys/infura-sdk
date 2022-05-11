/* eslint-disable */
import { ethers } from 'ethers';
import { HttpService } from '../../services/httpService.js';
import { UserService } from '../../services/userService.js';
import fs from 'fs';
import { NFT_API_URL, NFT_API_PATH } from './constants.js';
const smartContractArtifact = JSON.parse(fs.readFileSync('ERC721.json'));

export class ExternallyOwnedAccount {
  /* Private property */
  _httpClient = null;
  _user = null;

  constructor({ privateKey, apiKey, rpcUrl, chainId }) {
    this._user = new UserService();

    this.provider = this._connectDefaultProvider(rpcUrl);

    this.wallet = this._connectWallet(privateKey, this.provider);

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
    const apiUrl = `${NFT_API_PATH}${accountAddress}`;
    try {
      return this._httpClient.instance.get(apiUrl);
    } catch (error) {
      throw new Error(error).stack;
    }
  }
}
