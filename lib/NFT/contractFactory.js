import { TEMPLATES } from './constants';
import NFTContractUnlimited from '../ContractTemplates/nftContractUnlimited';

export default class ContractFactory {
  static factory(template, signer) {
    switch (template) {
      case TEMPLATES.NFTContractCollection:
        return new NFTContractUnlimited(signer);
      default:
        throw new Error('Invalid template provided');
    }
  }
}
