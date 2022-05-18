import { BaseContract } from './base.contract.js';
import NFTContractUnlimitedSpec from './abis/NFTContractUnlimited.json' assert { type: 'json' };

export class NFTContractUnlimited extends BaseContract {
  getFromAddress(address) {
    this._contractObject = new ethers.Contract(address, NFTContractUnlimitedSpec.abi, this._signer);
    this._address = address;
  }

  async deploy(name, symbol) {
    if (this._address) throw new Error('This is a deployed contract already.');
    if (!this._signer) throw new Error('Signer needed to deploy a contract');
    if (name === '') throw new Error('Name cannot be empty');

    const factory = new ethers.ContractFactory(
      NFTContractUnlimitedSpec.abi,
      NFTContractUnlimitedSpec.bytecode,
      this._signer,
    );

    const contract = await factory.deploy(name, symbol);
    this._address = await contract.deployed();
  }

  async mint(to, tokenURI) {
    if (!this._contractObject || !this._signer) {
      throw new Error();
    }
    this._contractObject.mintWithTokenURI(to, tokenURI);
  }

  async name() {
    if (!this._contractObject) {
      throw new Error();
    }
    return await this._contractObject.name();
  }

  async symbol() {
    if (!this._contractObject) {
      throw new Error();
    }
    return await this._contractObject.symbol();
  }
}
