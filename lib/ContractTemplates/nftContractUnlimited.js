import { ethers } from 'ethers';
import fs from 'fs';

const smartContractArtifact = JSON.parse(fs.readFileSync('ERC721.json'));

export default class NFTContractUnlimited {
  contractAddress;

  signer;

  constructor(signer) {
    this.signer = signer;
  }

  async deploy(name, symbol) {
    if (this.contractAddress) throw new Error('This is a deployed contract already.');
    if (!this.signer) throw new Error('Signer needed to deploy a contract');
    if (name === '') throw new Error('Name cannot be empty');

    const factory = new ethers.ContractFactory(
      smartContractArtifact.abi,
      smartContractArtifact.bytecode,
      this.signer,
    );

    const contract = await factory.deploy(name, symbol);
    this.contractAddress = await contract.deployed();
  }
}
