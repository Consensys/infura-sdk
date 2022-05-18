/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

// TODO: remove this test file
import { ExternallyOwnedAccount } from './lib/NFT/externallyOwnedAccount.js';
import { Provider } from './lib/Provider/provider.js';
import { TEMPLATES } from './lib/NFT/contracts/templates.js';
import Auth from './lib/Auth/index.js';

const auth = new Auth();
const provider = Provider.fromJsonRPCProvider(
  'https://rinkeby.infura.io/v3/86d4a35c8d7b4509983f9f6d0623656f',
);
const account = new ExternallyOwnedAccount(process.env.RANDOM_PRIVATE_KEY, auth, provider);
const contract = account.getContractFromAddress(
  TEMPLATES.NFTContractUnlimited,
  '0xbafDB2980eA7A82df1a7ef834B210aB4C4F06bE3',
);
contract.name();
