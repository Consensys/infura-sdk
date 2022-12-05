import { ethers } from 'ethers';
import { TEMPLATES } from './constants';
import ERC721Mintable from '../ContractTemplates/ERC721Mintable';
import { Logger, log } from '../Logger';

export default class ContractFactory {
  static factory(template: string, signer: ethers.Wallet | ethers.providers.JsonRpcSigner) {
    if (template === TEMPLATES.ERC721Mintable) {
      return new ERC721Mintable(signer);
    }

    return log.throwError(Logger.message.invalid_template, Logger.code.INVALID_ARGUMENT, {
      location: Logger.location.CONTRACTFACTORY_FACTORY,
    });
  }
}
