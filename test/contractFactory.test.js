import ERC721Mintable from '../src/lib/ContractTemplates/ERC721Mintable';
import ERC721UserMintable from '../src/lib/ContractTemplates/ERC721UserMintable';
import ERC1155Mintable from '../src/lib/ContractTemplates/ERC1155Mintable';
import { TEMPLATES } from '../src/lib/NFT/constants';
import ContractFactory from '../src/lib/NFT/contractFactory';
import { errorLogger, ERROR_LOG } from '../src/lib/error/handler.js';

describe('ContractFactory', () => {
  it('should return "ERC721Mintable" instance', async () => {
    const template = TEMPLATES.ERC721Mintable;
    const signer = '';

    const contract = ContractFactory.factory(template, signer);

    expect(contract instanceof ERC721Mintable).toBe(true);
  });

  it('should return "ERC721UserMintable" instance', async () => {
    const template = TEMPLATES.ERC721UserMintable;
    const signer = '';

    const contract = ContractFactory.factory(template, signer);

    expect(contract instanceof ERC721UserMintable).toBe(true);
  });

  it('should return "ERC1155Mintable" instance', async () => {
    const template = TEMPLATES.ERC1155Mintable;
    const signer = '';

    const contract = ContractFactory.factory(template, signer);

    expect(contract instanceof ERC1155Mintable).toBe(true);
  });

  it('should return an Error', async () => {
    const template = null;
    const signer = null;

    const contract = () => ContractFactory.factory(template, signer);

    expect(contract).toThrow(
      errorLogger({
        location: ERROR_LOG.location.ContractFactory_factory,
        message: ERROR_LOG.message.invalid_template,
      }),
    );
  });

  it('should return an Error because of non-existent template', async () => {
    const template = 'ERC721SuperFakeTemplate';
    const signer = null;

    const contract = () => ContractFactory.factory(template, signer);

    expect(contract).toThrow('[ContractFactory.factory] Invalid template.');
  });
});
