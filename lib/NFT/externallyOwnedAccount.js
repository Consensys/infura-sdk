import { ethers } from 'ethers';
export class ExternallyOwnedAccount {
  constructor(privateKey, rpcUrl) {
    this.provider = ethers.providers.getDefaultProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  async createSmartContract(type, name, symbol, metadata) {
    // const options = {
    //   gasLimit: 100000,
    //   gasPrice: ethers.utils.parseUnits(price, 'gwei'),
    // };

    const factory = new ethers.ContractFactory(metadata.abi, metadata.bytecode, this.wallet);

    const contract = await factory.deploy(type, name, symbol);
    await contract.deployed();
    console.log(`Deployment successful! Contract Address: ${contract.address}`);
  }
}
