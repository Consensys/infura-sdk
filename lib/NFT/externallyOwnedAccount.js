/* eslint-disable */
import { HttpService } from '../../services/httpService.js';
import NFT_API_URL from './constants.js';
import { BaseContract } from './contracts/base.contract.js';
import { Signer } from '../Signer/signer.js';

export class ExternallyOwnedAccount {
  /* Private property */
  _httpClient = null;
  _apiPath = null;

  constructor({ privateKey, auth, provider }) {
    if (!privateKey) throw new Error('[ExternallyOwnedAccount.constructor] privateKey is missing!');
    if (!auth) throw new Error('[ExternallyOwnedAccount.constructor] auth is missing!');
    if (!provider) throw new Error('[ExternallyOwnedAccount.constructor] provider is missing!');

    this.wallet = Signer.fromPrivateKeyAndProvider(privateKey, provider);
    // TODO: Conver the following to an API object that uses the credentials
    this._apiPath = `/api/v1/networks/${auth.getChainId()}`;

    // TBD: Base_URL! will go in .env or constants. Will users provide base url and api key?
    this._httpClient = new HttpService(NFT_API_URL, auth.getApiCredentials());
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
    const apiUrl = `${this._apiPath}/nfts/all/accounts/${this.wallet.address}`;
    try {
      const { data } = await this._httpClient.instance.get(apiUrl);
      return data;
    } catch (error) {
      throw new Error(error).stack;
    }
  }

  async getFungibleTokens() {
    // TODO: add headers X-Csi-Version: 1 (api version)
    const apiUrl = `${this._apiPath}/assets/erc20/accounts/${this.wallet.address}`;
    try {
      const { data } = await this._httpClient.instance.get(apiUrl);
      return data;
    } catch (error) {
      throw new Error(error).stack;
    }
  }
}
