import { utils, ethers } from 'ethers';
import Auth from '../Auth/Auth';
import { HttpService } from '../../services/httpService';
import NFT_API_URL from '../NFT/constants';
import ContractFactory from '../NFT/contractFactory';

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

    this.#apiPath = `/networks/${this.#auth.getChainId()}`;
    this.#httpClient = new HttpService(NFT_API_URL, this.#auth.getApiAuth());
  }

  /**
   * Deploy Contract on the blockchain
   * @param {string} template name of the template to use (ERC721Mintable, ...)
   * @param {object} params template parameters (name, symbol, contractURI, ...)
   * @returns Contract instance
   */
  async deploy({ template, params }) {
    if (!template) throw new Error('Template type is required to deploy a new contract.');
    if (Object.keys(params).length === 0) {
      throw new Error('A set of parameters are required to deploy a new contract.');
    }

    const contract = ContractFactory.factory(template, this.#auth.getSigner());

    await contract.deploy(params);
    return contract;
  }

  /**
   * Load a contract from an existing contract address and a template
   * @param {string} template name of the template to use (ERC721Mintable, ...)
   * @param {string} contractAddress address of the contract to load
   * @returns Contract instance
   */
  async loadContract({ template, contractAddress }) {
    if (!template) throw new Error('Template type is required to load a contract.');
    if (!contractAddress) throw new Error('A Contract address is required to load a contract.');

    const contract = ContractFactory.factory(template, this.#auth.getSigner());

    await contract.loadContract({ contractAddress });
    return contract;
  }

  /**
   * Get contract metadata by contract address
   * @param {string} contractAddress
   * @returns {object} Contract metadata object
   */
  async getContractMetadata({ contractAddress }) {
    if (!contractAddress || !utils.isAddress(contractAddress)) {
      throw new Error(
        '[SDK.getContractMetadata] You need to pass a valid contract address as parameter',
      );
    }

    const apiUrl = `${this.#apiPath}/nfts/${contractAddress}`;
    const {
      data: { symbol, name, tokenType },
    } = await this.#httpClient.get(apiUrl);

    return { symbol, name, tokenType };
  }

  /**
   * Get NFTs by an account address
   * @param  {string} address Account address
   * @param  {string} [includeMetadata=false] flag to include the metadata object in the results
   * @returns {[]} List of NFTs with metadata if 'includeMetadata' flag is true
   */
  async getNFTs({ publicAddress, includeMetadata = false }) {
    if (!publicAddress || !utils.isAddress(publicAddress)) {
      throw new Error('[SDK.getNFTs] You need to pass a valid account address as parameter');
    }

    const apiUrl = `${this.#apiPath}/accounts/${publicAddress}/assets/nfts`;

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

  /** Get list of NFTs for the specified contract address
   * @param {string} contractAddress address of the contract to get the list of NFTs
   * @returns {[]} List of NFTs with metadata
   */
  async getNFTsForCollection({ contractAddress }) {
    if (!contractAddress || !utils.isAddress(contractAddress)) {
      throw new Error(
        '[SDK.getNFTsForCollection] You need to pass a valid contract address as parameter',
      );
    }
    const apiUrl = `${this.#apiPath}/nfts/${contractAddress}/tokens`;

    const { data } = await this.#httpClient.get(apiUrl);
    return data;
  }

  /** Get a token metadata
   * @param {string} contractAddress address of the contract which holds the token
   * @param {number} tokenId ID of the token
   * @returns {[]} Token metadata
   */
  async getTokenMetadata({ contractAddress, tokenId }) {
    if (!contractAddress || !utils.isAddress(contractAddress)) {
      throw new Error(
        '[SDK.getTokenMetadata] You need to pass a valid contract address as first parameter',
      );
    }

    if (!Number.isFinite(tokenId)) {
      throw new Error('[SDK.getTokenMetadata] You need to pass the tokenId as second parameter');
    }

    const apiUrl = `${this.#apiPath}/nfts/${contractAddress}/tokens/${tokenId}`;

    const { data } = await this.#httpClient.get(apiUrl);
    return data;
  }

  /** Get ETH balance
   * @param  {string} publicAddress Account address
   * @returns {number} Account balance object
   */
  async getEthBalance({ publicAddress }) {
    if (!publicAddress || !utils.isAddress(publicAddress)) {
      throw new Error('[SDK.getEthBalance] You need to pass a valid account address as parameter');
    }

    const apiUrl = `${this.#apiPath}/accounts/${publicAddress}/assets/eth`;

    const {
      data: { balance },
    } = await this.#httpClient.get(apiUrl);
    return balance;
  }

  /** Get ERC20 balances
   * @param  {string} publicAddress Account address
   * @returns {object} ERC20 balance object
   */
  async getERC20Balances({ publicAddress }) {
    if (!publicAddress || !utils.isAddress(publicAddress)) {
      throw new Error(
        '[SDK.getERC20Balances] You need to pass a valid account address as parameter',
      );
    }

    const apiUrl = `${this.#apiPath}/accounts/${publicAddress}/assets/erc20`;

    const { data } = await this.#httpClient.get(apiUrl);
    return data;
  }

  /** Get Royalties
   * @param {Object} Object - Object: { template, contractAddress, tokenId, sellPrice }
   * @param {string} Object.template - Smart contract template (e.g. ERC721Mintable).
   * @param {string} Object.contractAddress - Valid Smart contract address (e.g. 0x...).
   * @param {string} Object.token - Valid Token ID.
   * @param {string} Object.sellPrice - Valid Sell price.
   * @returns {[]} Returns how much royalty is owed and to whom.
   */
  async getRoyalties({ template, contractAddress, tokenId, sellPrice }) {
    if (!template) {
      throw new Error('[SDK.getRoyalties] Please choose the template');
    }

    if (!contractAddress || !utils.isAddress(contractAddress)) {
      throw new Error('[SDK.getRoyalties] Please use valid Contract address');
    }

    if (!tokenId) {
      throw new Error('[SDK.getRoyalties] Please add tokenId');
    }

    if (!sellPrice) {
      throw new Error('[SDK.getRoyalties] Please add sellPrice');
    }

    try {
      const contractObject = await this.loadContract({ template, contractAddress });
      return contractObject.royaltyInfo(tokenId, sellPrice);
    } catch (error) {
      throw new Error(error).stack;
    }
  }
}
