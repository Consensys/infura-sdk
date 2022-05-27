import { ContractFactory, ethers } from 'ethers';
import ERC721Mintable from '../lib/ContractTemplates/ERC721Mintable/ERC721Mintable';
import { ACCOUNT_ADDRESS, CONTRACT_ADDRESS } from './__mocks__/utils';

let eRC721Mintable;
let signer;
let contractAddress;

jest.mock('ethers');

describe('SDK', () => {
  beforeAll(() => {
    signer = 'signer';

    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementation(() => ({
      deployed: () => ({
        mintWithTokenURI: () => ({}),
      }),
    }));
    jest.spyOn(ethers.utils, 'isAddress').mockImplementation(() => true);
    jest.spyOn(ethers, 'Contract').mockImplementation(() => ({}));
  });

  it('should create "ERC721Mintable" instance', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    expect(eRC721Mintable).not.toBe(null);
  });

  it('[Deploy] - should return an Error if signer not defined ', () => {
    eRC721Mintable = new ERC721Mintable(null, contractAddress);

    const contract = async () => eRC721Mintable.deploy('name', 'symbol');

    expect(contract).rejects.toThrow('Signer instance is required to interact with contract.');
  });

  it('[Deploy] - should return an Error if Name is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer, contractAddress);

    const contract = async () => eRC721Mintable.deploy({ name: '', symbol: 'sumbol' });

    expect(contract).rejects.toThrow('Name cannot be empty');
  });

  it('[Deploy] - should return a contract', async () => {
    eRC721Mintable = new ERC721Mintable(signer, contractAddress);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'sumbol' });

    expect(ContractFactory.prototype.deploy).toHaveBeenCalledTimes(1);
  });

  it('[Mint] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const myNFT = async () =>
      eRC721Mintable.mint(ACCOUNT_ADDRESS, 'https://infura.io/images/404.png');
    expect(myNFT).rejects.toThrow(
      '[ERC721Mintable.mint] A contract should be deployed or loaded first',
    );
  });

  it('[Mint] - should return an Error if the address is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const myNFT = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'sumbol' });
      await eRC721Mintable.mint('', 'https://infura.io/images/404.png');
    };
    expect(myNFT).rejects.toThrow('[ERC721Mintable.mint] A valid address is required to mint.');
  });

  it('[Mint] - should return an Error if the tokenURI is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const myNFT = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'sumbol' });
      await eRC721Mintable.mint('0xE26a682fa90322eC48eB9F3FA66E8961D799177C', '');
    };
    expect(myNFT).rejects.toThrow('[ERC721Mintable.mint] A TokenURI is required to mint.');
  });

  it('[Mint] - should mint a token', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'sumbol' });
    await eRC721Mintable.mint(ACCOUNT_ADDRESS, 'https://infura.io/images/404.png');

    // TODO expect something
  });

  it('[LoadContract] - should return an Error if contract is already deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const contract = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'sumbol' });
      await eRC721Mintable.loadContract(CONTRACT_ADDRESS);
    };
    expect(contract).rejects.toThrow(
      '[ERC721Mintable.loadContract] The contract has already been loaded!',
    );
  });

  it('[LoadContract] - should return an Error if the address is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const contract = async () => {
      await eRC721Mintable.loadContract();
    };
    expect(contract).rejects.toThrow(
      '[ERC721Mintable.loadContract] A valid contract address is required to load a contract.',
    );
  });

  it('[LoadContract] - should load the contract', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    await eRC721Mintable.loadContract(CONTRACT_ADDRESS);

    expect(ethers.Contract).toHaveBeenCalledTimes(1);
  });
});
