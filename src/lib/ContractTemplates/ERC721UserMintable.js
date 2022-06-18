import { ethers, utils } from 'ethers';
import { TEMPLATES } from '../NFT/constants.js';
import smartContractArtifact from './artifacts/ERC721UserMintable.js';
import { isBoolean, isDefined } from '../utils.js';

export default class ERC721UserMintable {
  #gasLimit = 6000000;

  contractAddress;

  #contractDeployed;

  #signer;

  #template = TEMPLATES.ERC721UserMintable;

  constructor(signer) {
    this.#signer = signer;
  }

  getTemplate() {
    return this.#template;
  }

  /**
   * Deploy ERC721UserMintable Contract. Used by the SDK class
   * @param {string} name Name of the contract
   * @param {string} symbol Symbol of the contract
   * @param {string} baseURI baseURI for the contract
   * @param {string} maxSupply Maximum supply of tokens for the contract
   * @param {string} maxSupply Price to mint one token
   * (link to a JSON file describing the contract's metadata)
   * @returns void
   */
  async deploy({ name, symbol, baseURI, maxSupply, price }) {
    if (this.contractAddress || this.#contractDeployed) {
      throw new Error('[ERC721UserMintable.deploy] The contract has already been deployed!');
    }

    if (!this.#signer) {
      throw new Error(
        '[ERC721UserMintable.deploy] Signer instance is required to interact with contract.',
      );
    }

    if (!name) {
      throw new Error('[ERC721UserMintable.deploy] Name cannot be empty');
    }

    if (symbol === undefined) {
      throw new Error('[ERC721UserMintable.deploy] symbol cannot be undefined');
    }

    if (baseURI === undefined) {
      throw new Error('[ERC721UserMintable.deploy] baseURI cannot be undefined');
    }

    if (maxSupply === undefined) {
      throw new Error('[ERC721UserMintable.deploy] maxSupply cannot be undefined');
    }

    if (price === undefined) {
      throw new Error('[ERC721UserMintable.deploy] price cannot be undefined');
    }

    try {
      const factory = new ethers.ContractFactory(
        smartContractArtifact.abi,
        smartContractArtifact.bytecode,
        this.#signer,
      );

      const priceInWei = utils.parseEther(price);

      // TODO remove rest parameter for destructuring (more secure)
      const contract = await factory.deploy(name, symbol, baseURI, maxSupply, priceInWei);

      this.#contractDeployed = await contract.deployed();

      this.contractAddress = contract.address;
    } catch (error) {
      throw new Error(`[ERC721UserMintable.deploy] An error occured: ${error}`);
    }
  }

  /**
   * Load an ERC721UserMintable contract from an existing contract address. Used by the SDK class
   * @param {string} contractAddress Address of the ERC721UserMintable contract to load
   * @returns void
   */
  async loadContract({ contractAddress }) {
    if (this.contractAddress || this.#contractDeployed) {
      throw new Error('[ERC721UserMintable.loadContract] The contract has already been loaded!');
    }

    if (!contractAddress || !ethers.utils.isAddress(contractAddress)) {
      throw new Error(
        '[ERC721UserMintable.loadContract] A valid contract address is required to load a contract.',
      );
    }

    try {
      this.#contractDeployed = new ethers.Contract(
        contractAddress,
        smartContractArtifact.abi,
        this.#signer,
      );

      this.contractAddress = contractAddress;
    } catch (error) {
      throw new Error(`[ERC721UserMintable.loadContract] An error occured: ${error}`);
    }
  }

  async mint({ quantity, cost }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error('[ERC721UserMintable.mint] A contract should be deployed or loaded first');
    }

    if (!quantity || !Number.isInteger(quantity) || !(quantity > 0 && quantity <= 20)) {
      throw new Error(
        '[ERC721UserMintable.mint] Quantity as integer value between 1 and 20 is required',
      );
    }

    try {
      return await this.#contractDeployed.mint(quantity, { value: cost, gasLimit: this.#gasLimit });
    } catch (error) {
      throw new Error(`[ERC721UserMintable.mint] An error occured: ${error}`);
    }
  }

  /**
   * Returns the value of the mint per token (in Ether)
   * @returns {Number} value in Ether of the mint per token
   */
  async price() {
    try {
      const price = await this.#contractDeployed.price();
      return utils.formatEther(price);
    } catch (error) {
      throw new Error(`[ERC721UserMintable.price] An error occured: ${error}`);
    }
  }

  /**
   * Reserves (mints) an amount of tokens to the owner of the contract
   * @param quantity The quantity of tokens to mint to the owner (1-20)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async reserve({ quantity }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error('[ERC721UserMintable.reserve] A contract should be deployed or loaded first');
    }

    if (!quantity || !Number.isInteger(quantity) || !(quantity > 0 && quantity <= 20)) {
      throw new Error(
        '[ERC721UserMintable.reserve] Quantity as integer value between 1 and 20 is required',
      );
    }

    try {
      return await this.#contractDeployed.reserve(quantity);
    } catch (error) {
      throw new Error(`[ERC721UserMintable.reserve] An error occured: ${error}`);
    }
  }

  /**
   * Sets the status of the contract to revealed and sets the baseURI
   * @param baseURI The baseURI of the contract
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async reveal({ baseURI }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error('[ERC721UserMintable.reveal] A contract should be deployed or loaded first!');
    }

    if (!baseURI) {
      throw new Error('[ERC721UserMintable.reveal] A valid base uri is required!');
    }

    try {
      return await this.#contractDeployed.reveal(baseURI);
    } catch (error) {
      throw new Error(`[ERC721UserMintable.reveal] An error occured: ${error}`);
    }
  }

  /**
   * Returns receiver address and royalty amount based on sell price
   * @param {number} - Token ID
   * @param {number} - Sell price
   * @returns {Promise<object>} - Returns receiver address and bigNumber
   * representing royalty amount based on sell price
   */
  async royaltyInfo({ tokenId, sellPrice }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error('[ERC721UserMintable.royaltyInfo] Contract needs to be deployed');
    }

    if (!isDefined(tokenId)) {
      throw new Error('[ERC721UserMintable.royaltyInfo] TokenId is required');
    }

    if (!sellPrice) {
      throw new Error('[ERC721UserMintable.royaltyInfo] Sell price is required');
    }

    try {
      return await this.#contractDeployed.royaltyInfo(tokenId, sellPrice);
    } catch (error) {
      throw new Error(`[ERC721UserMintable.royaltyInfo] An error occured: ${error}`);
    }
  }

  /**
   * setBaseURI function: Set the "baseURI" metadata for the specified contract
   * @param {string} baseURI baseURI for the contract
   * (URI to a JSON file describing the contract's metadata)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async setBaseURI({ baseURI }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        '[ERC721UserMintable.setBaseURI] A contract should be deployed or loaded first!',
      );
    }

    if (!baseURI) {
      throw new Error('[ERC721UserMintable.setBaseURI] A valid base uri is required!');
    }

    try {
      return await this.#contractDeployed.setBaseURI(baseURI);
    } catch (error) {
      throw new Error(`[ERC721UserMintable.setBaseURI] An error occured: ${error}`);
    }
  }

  /**
   * Sets the price (in Ether) of the mint
   * @param price Price of the mint (per token) in Ether as a string
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async setPrice({ price }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        '[ERC721UserMintable.setPrice] A contract should be deployed or loaded first',
      );
    }

    if (price === undefined) {
      throw new Error('[ERC721UserMintable.setPrice] price cannot be undefined');
    }

    try {
      const priceInWei = utils.parseEther(price);
      return await this.#contractDeployed.setPrice(priceInWei);
    } catch (error) {
      throw new Error(`[ERC721UserMintable.setPrice] An error occured: ${error}`);
    }
  }

  /**
   * Set royalties information for the receiver address with the provided fee
   * @param {string} - address
   * @param {number} - fee
   * @returns {Promise<ethers.providers.TransactionResponse>} - Transaction
   */
  async setRoyalties({ publicAddress, fee }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error('[ERC721UserMintable.setRoyalties] Contract needs to be deployed');
    }

    if (!publicAddress || !utils.isAddress(publicAddress)) {
      throw new Error('[ERC721UserMintable.setRoyalties] Address is required');
    }

    if (!fee || !Number.isInteger(fee) || !(fee > 0 && fee < 10000)) {
      throw new Error(
        '[ERC721UserMintable.setRoyalties] Fee as numeric value between 0 and 10000 is required',
      );
    }

    try {
      return await this.#contractDeployed.setRoyalties(publicAddress, fee, {
        gasLimit: this.#gasLimit,
      });
    } catch (error) {
      throw new Error(`[ERC721UserMintable.setRoyalties] An error occured: ${error}`);
    }
  }

  /**
   * Toggles the sale status of the contract
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async toggleSale() {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        '[ERC721UserMintable.toggleSale] A contract should be deployed or loaded first',
      );
    }

    try {
      return await this.#contractDeployed.toggleSale();
    } catch (error) {
      throw new Error(`[ERC721UserMintable.toggleSale] An error occured: ${error}`);
    }
  }

  /**
   * Transfer function: Transfer the token 'tokenId' between 'from' and 'to addresses.
   * @param {string} from Address who will transfer the token
   * @param {string} to Address that will receive the token
   * @param {number} tokenId ID of the token that will be transfered
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async transfer({ from, to, tokenId }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        '[ERC721UserMintable.transfer] A contract should be deployed or loaded first',
      );
    }

    if (!from || !ethers.utils.isAddress(from)) {
      throw new Error(
        '[ERC721UserMintable.transfer] A valid address "from" is required to transfer.',
      );
    }

    if (!to || !ethers.utils.isAddress(to)) {
      throw new Error(
        '[ERC721UserMintable.transfer] A valid address "to" is required to transfer.',
      );
    }

    if (!Number.isInteger(tokenId)) {
      throw new Error('[ERC721UserMintable.transfer] TokenId should be an integer.');
    }

    try {
      return await this.#contractDeployed['safeTransferFrom(address,address,uint256)'](
        from,
        to,
        tokenId,
        {
          gasLimit: this.#gasLimit,
        },
      );
    } catch (error) {
      throw new Error(`[ERC721UserMintable.transfer] An error occured: ${error}`);
    }
  }

  /**
   * setApprovalForAll will give the full approval rights for a given address
   * @param {string} to Address which will receive the approval rights
   * @param {boolean} approvalStatus Boolean representing the approval to be given (true)
   *  or revoked (false)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async setApprovalForAll({ to, approvalStatus }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        '[ERC721UserMintable.setApprovalForAll] A contract should be deployed or loaded first.',
      );
    }

    if (!to || !ethers.utils.isAddress(to)) {
      throw new Error(
        '[ERC721UserMintable.setApprovalForAll] An address is required to setApprovalForAll.',
      );
    }

    if (!isBoolean(approvalStatus)) {
      throw new Error(
        '[ERC721UserMintable.setApprovalForAll] approvalStatus param should be a boolean.',
      );
    }

    try {
      return await this.#contractDeployed.setApprovalForAll(to, approvalStatus);
    } catch (error) {
      throw new Error(`[ERC721UserMintable.setApprovalForAll] An error occured: ${error}`);
    }
  }

  /**
   * Gives permission to to to transfer tokenId token to another address.
   * @param {string} to the address that will be approved to do the transfer.
   * @param {number} tokenId tokenId the nft id to transfer.
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async approveTransfer({ to, tokenId }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        '[ERC721UserMintable.approveTransfer] A contract should be deployed or loaded first',
      );
    }

    if (!to || !ethers.utils.isAddress(to)) {
      throw new Error(
        '[ERC721UserMintable.approveTransfer] A valid address "to" is required to transfer.',
      );
    }

    if (!Number.isInteger(tokenId)) {
      throw new Error('[ERC721UserMintable.approveTransfer] TokenId should be an integer.');
    }

    try {
      return await this.#contractDeployed.approve(to, tokenId);
    } catch (error) {
      throw new Error(`[ERC721UserMintable.approveTransfer] An error occured: ${error}`);
    }
  }

  /**
   * Renouncing ownership of the smart contract (will leave the contract without an owner).
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async renounceOwnership() {
    if (!this.contractAddress && !this.#contractDeployed) {
      throw new Error('[ERC721UserMintable.renounceOwnership] Contract needs to be deployed');
    }

    try {
      return await this.#contractDeployed.renounceOwnership();
    } catch (error) {
      throw new Error(`[ERC721UserMintable.renounceOwnership] An error occured: ${error}`);
    }
  }

  /**
   * Withdraws ether balance to owner address
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async withdraw() {
    if (!this.contractAddress && !this.#contractDeployed) {
      throw new Error(
        '[ERC721UserMintable.withdraw] A contract should be deployed or loaded first',
      );
    }

    try {
      return await this.#contractDeployed.withdraw();
    } catch (error) {
      throw new Error(`[ERC721UserMintable.withdraw] An error occured: ${error}`);
    }
  }
}
