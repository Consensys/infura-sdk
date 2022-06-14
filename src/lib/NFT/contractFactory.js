import { TEMPLATES } from './constants.js';
import ERC721Mintable from '../ContractTemplates/ERC721Mintable.js';

export default class ContractFactory {
  static factory(template, signer) {
    switch (template) {
      case TEMPLATES.ERC721Mintable:
        return new ERC721Mintable(signer);
      default:
        throw new Error('Invalid template provided');
    }
  }
}
