import { ethers } from 'ethers';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);

const smartContractArtifact = JSON.parse(
  fs.readFileSync(path.join(dirname(filename), 'ERC721.json')),
);

export default class ERC721Mintable {
  ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';

  MINTER_ROLE = '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6';

  contractAddress;

  #contractDeployed;

  #signer;

  constructor(signer) {
    this.#signer = signer;
  }

  async deploy(params) {
    if (this.contractAddress || this.#contractDeployed) {
      throw new Error('[ERC721Mintable.deploy] The contract has already been deployed!');
    }

    if (!this.#signer) {
      throw new Error(
        '[ERC721Mintable.deploy] Signer instance is required to interact with contract.',
      );
    }

    if (!params.name) {
      throw new Error('[ERC721Mintable.deploy] Name cannot be empty');
    }

    if (params.symbol === undefined) {
      throw new Error('[ERC721Mintable.deploy] symbol cannot be undefined');
    }

    if (params.contractURI === undefined) {
      throw new Error('[ERC721Mintable.deploy] contractURI cannot be undefined');
    }

    try {
      const factory = new ethers.ContractFactory(
        smartContractArtifact.abi,
        smartContractArtifact.bytecode,
        this.#signer,
      );

      // TODO remove rest parameter for destructuring (more secure)
      const contract = await factory.deploy(...Object.values(params));

      this.#contractDeployed = await contract.deployed();

      this.contractAddress = contract.address;
    } catch (error) {
      throw new Error(`[ERC721Mintable.deploy] An error occured: ${error}`);
    }
  }

  async mint(publicAddress, tokenURI) {
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
        gasLimit: 6000000,
      });
    } catch (error) {
      throw new Error(`[ERC721Mintable.mint] An error occured: ${error}`);
    }
  }

  async loadContract(contractAddress) {
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
          gasLimit: 6000000,
        },
      );
    } catch (error) {
      throw new Error(`[ERC721Mintable.transfer] An error occured: ${error}`);
    }
  }

  async setContractURI(contractURI) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        '[ERC721Mintable.setContractURI] A contract should be deployed or loaded first!',
      );
    }

    if (!contractURI) {
      throw new Error('[ERC721Mintable.setContractURI] A valid contract uri is required!');
    }

    try {
      return this.#contractDeployed.setContractURI(contractURI);
    } catch (error) {
      throw new Error(`[ERC721Mintable.setContractURI] An error occured: ${error}`);
    }
  }

  /**
   * Add Admin function: Add the 'admin' role to an address. Only callable by
   * addresses with the admin role.
   * @param {address} address the address that will loose the 'minter' role
   * @returns promise<ethers.receipt> Promise that will return the tx receipt
   */
  async addAdmin(address) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error('[ERC721Mintable.addAdmin] A contract should be deployed or loaded first!');
    }

    if (!address || !ethers.utils.isAddress(address)) {
      throw new Error(
        '[ERC721Mintable.addAdmin] A valid address is required to add the admin role.',
      );
    }

    try {
      return this.#contractDeployed.grantRole(this.ADMIN_ROLE, address);
    } catch (error) {
      throw new Error(`[ERC721Mintable.addAdmin] An error occured: ${error}`);
    }
  }

  /**
   * Remove Admin function: Remove the 'admin' role to an address. Only callable by
   * addresses with the admin role.
   * @param {address} address the address that will loose the 'minter' role
   * @returns promise<ethers.receipt> Promise that will return the tx receipt
   */
  async removeAdmin(address) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        '[ERC721Mintable.removeAdmin] A contract should be deployed or loaded first!',
      );
    }

    if (!address || !ethers.utils.isAddress(address)) {
      throw new Error(
        '[ERC721Mintable.removeAdmin] A valid address is required to remove the admin role.',
      );
    }

    try {
      return this.#contractDeployed.revokeRole(this.ADMIN_ROLE, address);
    } catch (error) {
      throw new Error(`[ERC721Mintable.removeAdmin] An error occured: ${error}`);
    }
  }

  /**
   * Renounce Admin function: Remove the 'admin' role to an address. Only callable by
   * address invoking the request.
   * @param {address} address the address that will loose the 'minter' role
   * @returns promise<ethers.receipt> Promise that will return the tx receipt
   */
  async renounceAdmin(address) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error(
        '[ERC721Mintable.renounceAdmin] A contract should be deployed or loaded first!',
      );
    }

    if (!address || !ethers.utils.isAddress(address)) {
      throw new Error(
        '[ERC721Mintable.renounceAdmin] A valid address is required to renounce the admin role.',
      );
    }

    try {
      return this.#contractDeployed.renounceRole(this.ADMIN_ROLE, address);
    } catch (error) {
      throw new Error(`[ERC721Mintable.renounceAdmin] An error occured: ${error}`);
    }
  }

  /**
   * Is Admin function: Check whether an address has the 'admin' role
   * @param {address} address the address to check
   * @returns promise<boolean> Promise that will return a boolean
   */
  async isAdmin(address) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error('[ERC721Mintable.isAdmin] A contract should be deployed or loaded first!');
    }

    if (!address || !ethers.utils.isAddress(address)) {
      throw new Error(
        '[ERC721Mintable.isAdmin] A valid address is required to check the admin role.',
      );
    }

    try {
      return await this.#contractDeployed.hasRole(this.ADMIN_ROLE, address);
    } catch (error) {
      throw new Error(`[ERC721Mintable.isAdmin] An error occured: ${error}`);
    }
  }
}
