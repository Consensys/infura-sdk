const Chains = {
  mainnet: 1,
  goerli: 5,
  rinkeby: 4,
  ropsten: 3,
};

const chainsName = {
  1: 'mainnet',
  5: 'goerli',
  4: 'rinkeby',
  3: 'ropsten',
};

const availableChains = [Chains.mainnet, Chains.goerli, Chains.rinkeby, Chains.ropsten];

const getChainName = chainId => chainsName[chainId];

export { availableChains, Chains, getChainName };
