import ERC721Mintable from '../ContractTemplates/ERC721Mintable.js';
import ERC721UserMintable from '../ContractTemplates/ERC721UserMintable.js';
import { TEMPLATES } from './constants.js';
import { errorLogger, ERROR_LOG } from '../error/handler.js';

export default class ContractFactory {
  static factory(template, signer) {
    switch (template) {
      case TEMPLATES.ERC721Mintable:
        return new ERC721Mintable(signer);
      case TEMPLATES.ERC721UserMintable:
        return new ERC721UserMintable(signer);
      default:
        throw new Error(
          errorLogger({
            location: ERROR_LOG.location.ContractFactory_factory,
            message: ERROR_LOG.message.invalid_template,
          }),
        );
    }
  }
}
