import { ethers } from 'ethers';
import fs from 'fs';

const smartContractArtifact = JSON.parse(fs.readFileSync('./ERC721.json'));

export default class ERC721Mintable {
  #contractAddress;

  #contractDeployed;

  #signer;

  constructor(signer) {
    this.#signer = signer;
  }

  async deploy(params) {
    if (this.#contractAddress || this.#contractDeployed) {
      throw new Error('[ERC721Mintable.deploy] The contract has already been deployed!');
    }

    if (!this.#signer) {
      throw new Error('Signer instance is required to interact with contract.');
    }

    const arrayParams = Object.values(params);

    // TODO add check on params.symbol (cannot be undefined BUT can be empty)
    if (!params.name) {
      throw new Error('Name cannot be empty');
    }

    const factory = new ethers.ContractFactory(
      smartContractArtifact.abi,
      smartContractArtifact.bytecode,
      this.#signer,
    );

    // TODO remove rest parameter for destructuring (more secure)
    const contract = await factory.deploy(...arrayParams);

    this.#contractDeployed = await contract.deployed();

    this.#contractAddress = contract.address;
  }

  async mint(publicAddress, tokenURI) {
    if (!this.#contractDeployed && !this.#contractAddress) {
      throw new Error('[ERC721Mintable.mint] A contract should be deployed or loaded first');
    }

    if (!publicAddress || !ethers.utils.isAddress(publicAddress)) {
      throw new Error('[ERC721Mintable.mint] A valid address is required to mint.');
    }

    if (!tokenURI) {
      throw new Error('[ERC721Mintable.mint] A TokenURI is required to mint.');
    }

    await this.#contractDeployed.mintWithTokenURI(publicAddress, tokenURI);
  }

  async loadContract(contractAddress) {
    if (this.#contractAddress || this.#contractDeployed) {
      throw new Error('[ERC721Mintable.loadContract] The contract has already been loaded!');
    }

    if (!contractAddress || !ethers.utils.isAddress(contractAddress)) {
      throw new Error(
        '[ERC721Mintable.loadContract] A valid contract address is required to load a contract.',
      );
    }

    this.#contractDeployed = new ethers.Contract(
      contractAddress,
      smartContractArtifact.abi,
      this.#signer,
    );

    this.#contractAddress = contractAddress;
  }
}
