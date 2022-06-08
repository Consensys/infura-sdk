import ERC721Mintable from '../src/lib/ContractTemplates/ERC721Mintable/ERC721Mintable';
import { TEMPLATES } from '../src/lib/NFT/constants';
import ContractFactory from '../src/lib/NFT/contractFactory';

describe('ContractFactory', () => {
  it('should return "ERC721Mintable" instance', async () => {
    const template = TEMPLATES.ERC721Mintable;
    const signer = '';

    const contract = ContractFactory.factory(template, signer);

    expect(contract instanceof ERC721Mintable).toBe(true);
  });

  it('should return an Error', async () => {
    const template = null;
    const signer = null;

    const contract = () => ContractFactory.factory(template, signer);

    expect(contract).toThrow('Invalid template provided');
  });
});
