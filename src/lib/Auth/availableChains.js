const Chains = {
  mainnet: 1,
  goerli: 5,
  polygon: 137,
  binance: 56,
};

const chainsName = {
  1: 'mainnet',
  5: 'goerli',
  56: 'binance',
  137: 'polygon',
};

const availableChains = [Chains.mainnet, Chains.goerli, Chains.polygon, Chains.binance];

const getChainName = chainId => chainsName[chainId];

export { availableChains, Chains, getChainName };
