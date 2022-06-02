import { ethers } from 'ethers';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);

const smartContractArtifact = JSON.parse(
  fs.readFileSync(path.join(dirname(filename), 'ERC721.json')),
);

export default class ERC721Mintable {
  contractAddress;

  minterRole;

  #contractDeployed;

  #signer;

  constructor(signer) {
    this.#signer = signer;
    this.minterRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINTER_ROLE'));
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

  /**
   * Mint function: Mint a token for publicAddress with the tokenURI provided
   * @param {address} publicAddress destination address of the minted token
   * @param {string} tokenURI link to the JSON object containing metadata about the token
   * @returns promise<ethers.receipt> Promise that will return the tx receipt
   */
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

  /**
   * Add minter function: Grant the 'minter' role to an address
   * @param {address} publicAddress the address to be elevated at 'minter' role
   * @returns promise<ethers.receipt> Promise that will return the tx receipt
   */
  async addMinter(publicAddress) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error('[ERC721Mintable.addMinter] A contract should be deployed or loaded first');
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        '[ERC721Mintable.addMinter] A valid address is required to add the minter role.',
      );
    }

    try {
      return await this.#contractDeployed.grantRole(this.minterRole, publicAddress, {
        gasLimit: 6000000,
      });
    } catch (error) {
      throw new Error(`[ERC721Mintable.addMinter] An error occured: ${error}`);
    }
  }

  /**
   * Renounce minter function: Renounce the 'minter' role
   * @param {address} publicAddress the address that will renounce its 'minter' role
   * @returns promise<ethers.receipt> Promise that will return the tx receipt
   */
  async renounceMinter(publicAddress) {
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
      return await this.#contractDeployed.renounceRole(this.minterRole, publicAddress, {
        gasLimit: 6000000,
      });
    } catch (error) {
      throw new Error(`[ERC721Mintable.renounceMinter] An error occured: ${error}`);
    }
  }

  /**
   * Remove minter function: Remove the 'minter' role to an address
   * @param {address} publicAddress the address that will loose the 'minter' role
   * @returns promise<ethers.receipt> Promise that will return the tx receipt
   */
  async removeMinter(publicAddress) {
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
      return await this.#contractDeployed.revokeRole(this.minterRole, publicAddress, {
        gasLimit: 6000000,
      });
    } catch (error) {
      throw new Error(`[ERC721Mintable.removeMinter] An error occured: ${error}`);
    }
  }

  /**
   * Is minter function: Check if an address has the 'minter' role or not
   * @param {address} publicAddress the address to check
   * @returns promise<boolean> Promise that will return a boolean
   */
  async isMinter(publicAddress) {
    if (!this.#contractDeployed && !this.contractAddress) {
      throw new Error('[ERC721Mintable.isMinter] A contract should be deployed or loaded first');
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error(
        '[ERC721Mintable.isMinter] A valid address is required to check the minter role.',
      );
    }

    try {
      return await this.#contractDeployed.hasRole(this.minterRole, publicAddress, {
        gasLimit: 6000000,
      });
    } catch (error) {
      throw new Error(`[ERC721Mintable.isMinter] An error occured: ${error}`);
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
}
