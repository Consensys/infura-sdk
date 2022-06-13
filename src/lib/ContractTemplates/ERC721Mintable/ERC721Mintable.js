import { ethers, utils } from 'ethers';
import * as smartContractArtifact from './ERC721.js';
import { isBoolean } from '../../utils.js';

export default class ERC721Mintable {
  #gasLimit = 6000000;

  ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';

  MINTER_ROLE = '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6';

  contractAddress;

  #contractDeployed;

  #signer;

  constructor(signer) {
    this.#signer = signer;
  }

  /**
   * Deploy ERC721Mintable Contract. Used by the SDK class
   * @param {string} name Name of the contract
   * @param {string} symbol Symbol of the contract
   * @param {string} contractURI ContractURI for the contract
   * (link to a JSON file describing the contract's metadata)
   * @returns void
   */
  async deploy({ name, symbol, contractURI }) {
    if (this.contractAddress || this.#contractDeployed) {
      throw new Error('[ERC721Mintable.deploy] The contract has already been deployed!');
    }

    if (!this.#signer) {
      throw new Error(
        '[ERC721Mintable.deploy] Signer instance is required to interact with contract.',
      );
    }

    if (!name) {
      throw new Error('[ERC721Mintable.deploy] Name cannot be empty');
    }

    if (symbol === undefined) {
      throw new Error('[ERC721Mintable.deploy] symbol cannot be undefined');
    }

    if (contractURI === undefined) {
      throw new Error('[ERC721Mintable.deploy] contractURI cannot be undefined');
    }

    try {
      const factory = new ethers.ContractFactory(
        smartContractArtifact.abi,
        smartContractArtifact.bytecode,
        this.#signer,
      );

      // TODO remove rest parameter for destructuring (more secure)
      const contract = await factory.deploy(name, symbol, contractURI);

      this.#contractDeployed = await contract.deployed();

      this.contractAddress = contract.address;
    } catch (error) {
      throw new Error(`[ERC721Mintable.deploy] An error occured: ${error}`);
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
      throw new Error('[ERC721Mintable.setRoyalties] Contract needs to be deployed');
    }

    if (!publicAddress || !utils.isAddress(publicAddress)) {
      throw new Error('[ERC721Mintable.setRoyalties] Address is required');
    }

    if (!fee || !Number.isInteger(fee) || !(fee > 0 && fee < 10000)) {
      throw new Error(
        '[ERC721Mintable.setRoyalties] Fee as numeric value between 0 and 10000 is required',
      );
    }

    try {
      return await this.#contractDeployed.setRoyalties(publicAddress, fee, {
        gasLimit: this.#gasLimit,
      });
    } catch (error) {
      throw new Error(`[ERC721Mintable.setRoyalties] An error occured: ${error}`);
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
    if (!this.#contractDeployed) {
      throw new Error('[ERC721Mintable.royaltyInfo] Contract needs to be deployed');
    }

    if (!tokenId && tokenId !== 0) {
      throw new Error('[ERC721Mintable.royaltyInfo] TokenId is required');
    }

    if (!sellPrice && tokenId !== 0) {
      throw new Error('[ERC721Mintable.royaltyInfo] Sell price is required');
    }

    try {
      return await this.#contractDeployed.royaltyInfo(tokenId, sellPrice);
    } catch (error) {
      throw new Error(`[ERC721Mintable. royaltyInfo] An error occured: ${error}`);
    }
  }

  /**
   * Mint function: Mint a token for publicAddress with the tokenURI provided
   * @param {string} publicAddress destination address of the minted token
   * @param {string} tokenURI link to the JSON object containing metadata about the token
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async mint({ publicAddress, tokenURI }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error('[ERC721Mintable.mint] A contract should be deployed or loaded first');
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error('[ERC721Mintable.mint] A valid address is required to mint.');
    }

    if (!tokenURI) {
      throw new Error('[ERC721Mintable.mint] A tokenURI is required to mint.');
    }
    try {
      return await this.#contractDeployed.mintWithTokenURI(publicAddress, tokenURI, {
        gasLimit: this.#gasLimit,
      });
    } catch (error) {
      throw new Error(`[ERC721Mintable.mint] An error occured: ${error}`);
    }
  }

  /**
   * Add minter function: Grant the 'minter' role to an address
   * @param {string} publicAddress the address to be elevated at 'minter' role
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async addMinter({ publicAddress }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error('[ERC721Mintable.addMinter] A contract should be deployed or loaded first');
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        '[ERC721Mintable.addMinter] A valid address is required to add the minter role.',
      );
    }

    try {
      return await this.#contractDeployed.grantRole(this.MINTER_ROLE, publicAddress);
    } catch (error) {
      throw new Error(`[ERC721Mintable.addMinter] An error occured: ${error}`);
    }
  }

  /**
   * Renounce minter function: Renounce the 'minter' role
   * @param {string} publicAddress the address that will renounce its 'minter' role
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async renounceMinter({ publicAddress }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        '[ERC721Mintable.renounceMinter] A contract should be deployed or loaded first',
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        '[ERC721Mintable.renounceMinter] A valid address is required to renounce the minter role.',
      );
    }

    try {
      return await this.#contractDeployed.renounceRole(this.MINTER_ROLE, publicAddress);
    } catch (error) {
      throw new Error(`[ERC721Mintable.renounceMinter] An error occured: ${error}`);
    }
  }

  /**
   * Remove minter function: Remove the 'minter' role to an address
   * @param {string} publicAddress the address that will loose the 'minter' role
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async removeMinter({ publicAddress }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        '[ERC721Mintable.removeMinter] A contract should be deployed or loaded first',
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        '[ERC721Mintable.removeMinter] A valid address is required to remove the minter role.',
      );
    }

    try {
      return await this.#contractDeployed.revokeRole(this.MINTER_ROLE, publicAddress);
    } catch (error) {
      throw new Error(`[ERC721Mintable.removeMinter] An error occured: ${error}`);
    }
  }

  /**
   * Is minter function: Check if an address has the 'minter' role or not
   * @param {string} publicAddress the address to check
   * @returns {Promise<boolean>} Promise that will return a boolean
   */
  async isMinter({ publicAddress }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error('[ERC721Mintable.isMinter] A contract should be deployed or loaded first');
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        '[ERC721Mintable.isMinter] A valid address is required to check the minter role.',
      );
    }

    try {
      return await this.#contractDeployed.hasRole(this.MINTER_ROLE, publicAddress);
    } catch (error) {
      throw new Error(`[ERC721Mintable.isMinter] An error occured: ${error}`);
    }
  }

  /**
   * Load an ERC721Mintable contract from an existing contract address. Used by the SDK class
   * @param {string} contractAddress Address of the ERC721Mintable contract to load
   * @returns void
   */
  async loadContract({ contractAddress }) {
    if (this.contractAddress || this.#contractDeployed) {
      throw new Error('[ERC721Mintable.loadContract] The contract has already been loaded!');
    }

    if (!contractAddress || !ethers.utils.isAddress(contractAddress)) {
      throw new Error(
        '[ERC721Mintable.loadContract] A valid contract address is required to load a contract.',
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
      throw new Error(`[ERC721Mintable.loadContract] An error occured: ${error}`);
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
      throw new Error('[ERC721Mintable.transfer] A contract should be deployed or loaded first');
    }

    if (!from || !ethers.utils.isAddress(from)) {
      throw new Error('[ERC721Mintable.transfer] A valid address "from" is required to transfer.');
    }

    if (!to || !ethers.utils.isAddress(to)) {
      throw new Error('[ERC721Mintable.transfer] A valid address "to" is required to transfer.');
    }

    if (!Number.isInteger(tokenId)) {
      throw new Error('[ERC721Mintable.transfer] TokenId should be an integer.');
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
      throw new Error(`[ERC721Mintable.transfer] An error occured: ${error}`);
    }
  }

  /**
   * setContractURI function: Set the "contractURI" metadata for the specified contract
   * @param {string} contractURI ContractURI for the contract
   * (URI to a JSON file describing the contract's metadata)
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async setContractURI({ contractURI }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        '[ERC721Mintable.setContractURI] A contract should be deployed or loaded first!',
      );
    }

    if (!contractURI) {
      throw new Error('[ERC721Mintable.setContractURI] A valid contract uri is required!');
    }

    try {
      return await this.#contractDeployed.setContractURI(contractURI);
    } catch (error) {
      throw new Error(`[ERC721Mintable.setContractURI] An error occured: ${error}`);
    }
  }

  /**
   * Add Admin function: Add the 'admin' role to an address. Only callable by
   * addresses with the admin role.
   * @param {string} publicAddress the address that will loose the 'minter' role
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async addAdmin({ publicAddress }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error('[ERC721Mintable.addAdmin] A contract should be deployed or loaded first!');
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        '[ERC721Mintable.addAdmin] A valid address is required to add the admin role.',
      );
    }

    try {
      return await this.#contractDeployed.grantRole(this.ADMIN_ROLE, publicAddress);
    } catch (error) {
      throw new Error(`[ERC721Mintable.addAdmin] An error occured: ${error}`);
    }
  }

  /**
   * Remove Admin function: Remove the 'admin' role to an address. Only callable by
   * addresses with the admin role.
   * @param {string} publicAddress the address that will loose the 'minter' role
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async removeAdmin({ publicAddress }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        '[ERC721Mintable.removeAdmin] A contract should be deployed or loaded first!',
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        '[ERC721Mintable.removeAdmin] A valid address is required to remove the admin role.',
      );
    }

    try {
      return await this.#contractDeployed.revokeRole(this.ADMIN_ROLE, publicAddress);
    } catch (error) {
      throw new Error(`[ERC721Mintable.removeAdmin] An error occured: ${error}`);
    }
  }

  /**
   * Renounce Admin function: Remove the 'admin' role to an address. Only callable by
   * address invoking the request.
   * @param {string} publicAddress the address that will loose the 'minter' role
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async renounceAdmin({ publicAddress }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        '[ERC721Mintable.renounceAdmin] A contract should be deployed or loaded first!',
      );
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        '[ERC721Mintable.renounceAdmin] A valid address is required to renounce the admin role.',
      );
    }

    try {
      return await this.#contractDeployed.renounceRole(this.ADMIN_ROLE, publicAddress);
    } catch (error) {
      throw new Error(`[ERC721Mintable.renounceAdmin] An error occured: ${error}`);
    }
  }

  /**
   * Is Admin function: Check whether an address has the 'admin' role
   * @param {string} publicAddress the address to check
   * @returns {Promise<boolean>} Promise that will return a boolean
   */
  async isAdmin({ publicAddress }) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error('[ERC721Mintable.isAdmin] A contract should be deployed or loaded first!');
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        '[ERC721Mintable.isAdmin] A valid address is required to check the admin role.',
      );
    }

    try {
      return await this.#contractDeployed.hasRole(this.ADMIN_ROLE, publicAddress);
    } catch (error) {
      throw new Error(`[ERC721Mintable.isAdmin] An error occured: ${error}`);
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
        '[ERC721Mintable.setApprovalForAll] A contract should be deployed or loaded first.',
      );
    }

    if (!to || !ethers.utils.isAddress(to)) {
      throw new Error(
        '[ERC721Mintable.setApprovalForAll] An address is required to setApprovalForAll.',
      );
    }

    if (!isBoolean(approvalStatus)) {
      throw new Error(
        '[ERC721Mintable.setApprovalForAll] approvalStatus param should be a boolean.',
      );
    }

    try {
      return await this.#contractDeployed.setApprovalForAll(to, approvalStatus);
    } catch (error) {
      throw new Error(`[ERC721Mintable.setApprovalForAll] An error occured: ${error}`);
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
        '[ERC721Mintable.approveTransfer] A contract should be deployed or loaded first',
      );
    }

    if (!to || !ethers.utils.isAddress(to)) {
      throw new Error(
        '[ERC721Mintable.approveTransfer] A valid address "to" is required to transfer.',
      );
    }

    if (!Number.isInteger(tokenId)) {
      throw new Error('[ERC721Mintable.approveTransfer] TokenId should be an integer.');
    }

    try {
      return await this.#contractDeployed.approve(to, tokenId);
    } catch (error) {
      throw new Error(`[ERC721Mintable.approveTransfer] An error occured: ${error}`);
    }
  }

  /**
   * Renouncing ownership of the smart contract (will leave the contract without an owner).
   * @returns {Promise<ethers.providers.TransactionResponse>} Transaction
   */
  async renounceOwnership() {
    if (!this.contractAddress && !this.#contractDeployed) {
      throw new Error('[ERC721Mintable.renounceOwnership] Contract needs to be deployed');
    }

    try {
      return await this.#contractDeployed.renounceOwnership();
    } catch (error) {
      throw new Error(`[ERC721Mintable.renounceOwnership] An error occured: ${error}`);
    }
  }
}
