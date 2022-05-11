import { ethers } from 'ethers';
import { HttpService } from '../../services/httpService.js';
export class ExternallyOwnedAccount {
  _httpClient = null;

  constructor(privateKey, rpcUrl) {
    this.provider = ethers.providers.getDefaultProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);

    // TBD: Base_URL! will go in .env
    // will users provide base url and api key?
    this._httpClient = new HttpService(
      'https://staging.nft.consensys-solutions.net/',
    );
  }

  async createSmartContract(type, name, metadata, symbol) {
    // const options = {
    //   gasLimit: 100000,
    //   gasPrice: 0,
    // };

    console.log('bytecode: ', metadata);

    const factory = new ethers.ContractFactory(
      metadata.abi,
      metadata.bytecode,
      this.wallet,
    );

    const contract = await factory.deploy(type, name, symbol);
    await contract.deployed();
    console.log(`Deployment successful! Contract Address: ${contract.address}`);
    return contract;
  }

  async getNFTs(accountAddress, authorizationHeader) {
    try {
      return this._httpClient.instance.get(
        `/api/v1/networks/1/nfts/${accountAddress}`,
        { headers: authorizationHeader },
      );
    } catch (error) {
      //throw new Error(error).stack;
    }
  }
}
