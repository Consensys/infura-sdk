import ERC721Mintable from '../ContractTemplates/ERC721Mintable.js';
import ERC721UserMintable from '../ContractTemplates/ERC721UserMintable.js';
import { TEMPLATES } from './constants.js';

export default class ContractFactory {
  static factory(template, signer) {
    switch (template) {
      case TEMPLATES.ERC721Mintable:
        return new ERC721Mintable(signer);
      case TEMPLATES.ERC721UserMintable:
        return new ERC721UserMintable(signer);
      default:
        throw new Error('Invalid template provided');
    }
  }
}
