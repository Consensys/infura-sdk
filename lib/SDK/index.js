/* eslint-disable */
import { ContractFactory } from '../NFT/contractFactory';

export default class SDK {
  #account;

  constructor(account) {
    this.#account = account;
  }

  async deploy({ template, params: { name, symbol = '', contractURI = '' } }) {
    if (!template) throw new Error('The template type is mandatory.');
    if (!name) throw new Error('Name is mandatory');

    const contract = await ContractFactory.factory(template, this.#account.getSigner());

    return contract.deploy(...params);
  }
}
