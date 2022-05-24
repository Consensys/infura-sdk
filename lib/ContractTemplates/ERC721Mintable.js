import { ethers } from 'ethers';
import fs from 'fs';

const smartContractArtifact = JSON.parse(fs.readFileSync('ERC721.json'));

export default class ERC721Mintable {
  contractAddress;

  signer;

  constructor(signer) {
    this.signer = signer;
  }

  async deploy(params) {
    if (this.contractAddress) {
      throw new Error('[ERC721Mintable.deploy] The contract has already been deployed!');
    }

    if (!this.signer) {
      throw new Error('Signer instance needed to deploy a contract');
    }

    const arrayParams = Object.values(params);

    if (!params.name) {
      throw new Error('Name cannot be empty');
    }

    const factory = new ethers.ContractFactory(
      smartContractArtifact.abi,
      smartContractArtifact.bytecode,
      this.signer,
    );

    const contract = await factory.deploy(...arrayParams);

    await contract.deployed();

    this.contractAddress = contract.address;
  }
}
