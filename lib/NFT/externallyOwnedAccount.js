/* eslint-disable */
import { ethers } from 'ethers';
import { HttpService } from '../../services/httpService.js';
import fs from 'fs';
import NFT_API_URL from './constants.js';

const smartContractArtifact = JSON.parse(fs.readFileSync('ERC721.json'));

export class ExternallyOwnedAccount {
  /* Private property */
  _httpClient = null;
  _apiPath = null;
  _contractAddress = null;

  constructor({ privateKey, apiKey, rpcUrl, chainId }) {
    if (!privateKey) throw new Error('[ExternallyOwnedAccount.constructor] privateKey is missing!');
    if (!apiKey) throw new Error('[ExternallyOwnedAccount.constructor] apiKey is missing!');
    if (!rpcUrl) throw new Error('[ExternallyOwnedAccount.constructor] rpcUrl is missing!');

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
   * Deploy smart contract in the blockchain.
   * @param  {string} type
   * @param  {string} name
   * @param  {abi: string, bytecode: string} metadata
   * @param  {string} symbol
   * @returns {string} Deploy smart contract Smart Contract
   */
  async _deploy(factory) {
    const contract = await factory.deploy(this._name, this._symbol);
    await contract.deployed();
    console.log(`Deployment successful! Contract Address: ${contract.address}`);
    this._contractAddress = contract.address;
    return contract;
  }

  /**
   * Deploy smart contract in the blockchain.
   * @param  {string} type
   * @param  {string} name
   * @param  {abi: string, bytecode: string} metadata
   * @param  {string} symbol
   * @returns {string} Deploy smart contract Smart Contract
   */
  async _mint(publicAddress, NFTImage) {
    if (this._contractAddress === null)
      throw new Error('[ExternallyOwnedAccount.mint] You have to deploy the contract!');
    const contract = await this.getContract(this._contractAddress);
    return await contract.mintWithTokenURI(publicAddress, NFTImage);
  }

  /**
   * Create Smart Contract and Deploy on the Blockchain.
   * @param  {string} type
   * @param  {string} name
   * @param  {abi: string, bytecode: string} metadata
   * @param  {string} symbol
   * @returns {string} Smart Contract Abstraction
   */
  async createSmartContract(name, symbol) {
    const factory = new ethers.ContractFactory(
      smartContractArtifact.abi,
      smartContractArtifact.bytecode,
      this.wallet,
    );

    this._name = name;
    this._symbol = symbol;

    return {
      deploy: () => this._deploy(factory),
      mint: (publicAddress, NFTImage) => this._mint(publicAddress, NFTImage),
    };
  }

  /**
   * Get existing contract.
   * @param  {object {}} contractAddress
   * @returns {object} Contract instance
   */
  async getContract(contractAddress) {
    return new ethers.Contract(contractAddress, smartContractArtifact.abi, this.provider).connect(
      this.wallet,
    );
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
