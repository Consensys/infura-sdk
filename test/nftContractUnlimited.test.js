import { ContractFactory } from 'ethers';
import NFTContractUnlimited from '../lib/ContractTemplates/nftContractUnlimited.js';

let nftContractUnlimited;
let signer;
let contractAddress;

jest.mock('ethers');

describe('SDK', () => {
  beforeAll(() => {
    signer = 'signer';
    contractAddress = '';

    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementation(() => ({
      deployed: () => ({}),
    }));
  });
  it('should create "nftContractUnlimited" instance', () => {
    nftContractUnlimited = new NFTContractUnlimited(signer, contractAddress);

    expect(nftContractUnlimited.signer).toEqual('signer');
  });

  it('should return an Error if signer not defined ', () => {
    nftContractUnlimited = new NFTContractUnlimited(null, contractAddress);

    const contract = async () => nftContractUnlimited.deploy('name', 'symbol');

    expect(contract).rejects.toThrow('Signer needed to deploy a contract');
  });

  it('should return an Error if Name is empty', () => {
    nftContractUnlimited = new NFTContractUnlimited(signer, contractAddress);

    const contract = async () => nftContractUnlimited.deploy('', 'symbol');

    expect(contract).rejects.toThrow('Name cannot be empty');
  });

  it('should return a contract', async () => {
    nftContractUnlimited = new NFTContractUnlimited(signer, contractAddress);

    await nftContractUnlimited.deploy('name', 'symbol');

    expect(ContractFactory.prototype.deploy).toHaveBeenCalledTimes(1);
  });
});
