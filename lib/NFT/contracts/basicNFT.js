import { BaseContract } from './baseContract';

const smartContractArtifact = JSON.parse(fs.readFileSync('ERC721.json'));

export class BasicNFT extends BaseContract {
    getFromAddress(address) {
        this._contractObject = new ethers.Contract(
            address,
            smartContractArtifact.bytecode,
            this.wallet,
          );
    }

    async deploy(name, symbol) {
        const factory = new ethers.ContractFactory(
            smartContractArtifact.abi,
            smartContractArtifact.bytecode,
            this.wallet,
          );
      
          const contract = await factory.deploy(name, symbol);
          this._address = await contract.deployed();
          console.log(`Deployment successful! Contract Address: ${contract.address}`);
    }

    async mint(to, tokenURI) {
        if (!this._contractObject) {
            throw new Exception();
        }

        this._contractObject.mintWithTokenURI(to, tokenURI);
    }
}
