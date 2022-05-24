// import { config as loadEnv } from 'dotenv';

import NFTContractUnlimited from '../lib/ContractTemplates/nftContractUnlimited.js';
import { TEMPLATES } from '../lib/NFT/constants.js';
import ContractFactory from '../lib/NFT/contractFactory.js';

describe('ContractFactory', () => {
  it('should return "nftContractUnlimited" instance', async () => {
    const template = TEMPLATES.NFTContractCollection;
    const signer = '';

    const contract = ContractFactory.factory(template, signer);

    expect(contract instanceof NFTContractUnlimited).toBe(true);
  });

  it('should return an Error', async () => {
    const template = null;
    const signer = null;

    const contract = () => ContractFactory.factory(template, signer);

    expect(contract).toThrow('Invalid template provided');
  });
});
