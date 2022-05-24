import ContractFactory from '../NFT/contractFactory';

export default class SDK {
  #auth;

  constructor(auth) {
    this.#auth = auth;
  }

  async deploy({ template, params }) {
    if (!template) throw new Error('The template type is mandatory.');
    if (!params.name) throw new Error('Name is mandatory.');

    const contract = ContractFactory.factory(template, this.#auth.getSigner());

    await contract.deploy(params);

    return contract;
  }
}
