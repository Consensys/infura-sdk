import { TEMPLATES } from './constants.js';
import ERC721Mintable from '../ContractTemplates/ERC721Mintable.js';
import { errorLogger, ERROR_LOG } from '../error/handler.js';

export default class ContractFactory {
  static factory(template, signer) {
    if (template === TEMPLATES.ERC721Mintable) {
      return new ERC721Mintable(signer);
    }

    throw new Error(
      errorLogger({
        location: ERROR_LOG.location.ContractFactory_factory,
        message: ERROR_LOG.message.invalid_template,
      }),
    );
  }
}
