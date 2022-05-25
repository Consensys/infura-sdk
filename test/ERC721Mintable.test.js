import { ContractFactory } from 'ethers';
import ERC721Mintable from '../lib/ContractTemplates/ERC721Mintable/ERC721Mintable';

let eRC721Mintable;
let signer;
let contractAddress;

jest.mock('ethers');

describe('SDK', () => {
  beforeAll(() => {
    signer = 'signer';

    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementation(() => ({
      deployed: () => ({}),
    }));
  });
  it('should create "ERC721Mintable" instance', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    expect(eRC721Mintable).not.toBe(null);
  });

  it('should return an Error if signer not defined ', () => {
    eRC721Mintable = new ERC721Mintable(null, contractAddress);

    const contract = async () => eRC721Mintable.deploy('name', 'symbol');

    expect(contract).rejects.toThrow('Signer instance is required to interact with contract.');
  });

  it('should return an Error if Name is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer, contractAddress);

    const contract = async () => eRC721Mintable.deploy({ name: '', symbol: 'sumbol' });

    expect(contract).rejects.toThrow('Name cannot be empty');
  });

  it('should return a contract', async () => {
    eRC721Mintable = new ERC721Mintable(signer, contractAddress);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'sumbol' });

    expect(ContractFactory.prototype.deploy).toHaveBeenCalledTimes(1);
  });
});
