import { BaseContract } from './baseContract';
import NFTContractUnlimited from './abis/NFTContractUnlimited.json';

export class NFTContractUnlimited extends BaseContract {
    getFromAddress(address) {
        this._contractObject = new ethers.Contract(
            address,
            NFTContractUnlimited.abi,
            this._signer,
        );
        this._address = address;
    }

    async deploy(name, symbol) {
        if (name === '') {
            throw new Exception('Name cannot be empty');
        }

        const factory = new ethers.ContractFactory(
            NFTContractUnlimited.abi,
            NFTContractUnlimited.bytecode,
            this._signer,
          );
      
          const contract = await factory.deploy(name, symbol);
          this._address = await contract.deployed();
    }

    async mint(to, tokenURI) {
        if (!this._contractObject || !this._signer) {
            throw new Exception();
        }

        this._contractObject.mintWithTokenURI(to, tokenURI);
    }
}
