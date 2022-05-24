import ContractFactory from '../NFT/contractFactory.js';

export default class SDK {
  #account;

  constructor(account) {
    this.#account = account;
  }

  async deploy({ template, params }) {
    const { name, symbol } = params;
    if (!template) throw new Error('The template type is mandatory.');
    if (!name) throw new Error('Name is mandatory.');

    const contract = ContractFactory.factory(template, this.#account.getSigner());

    await contract.deploy(name, symbol);

    return contract;
  }
}
