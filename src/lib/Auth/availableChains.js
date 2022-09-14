const Chains = {
  mainnet: 1,
  goerli: 5,
  polygon: 137,
  mumbai: 80001,
};

const chainsName = {
  1: 'mainnet',
  5: 'goerli',
  137: 'polygon',
  80001: 'mumbai',
};

const chainUrls = {
  [Chains.mainnet]: 'https://mainnet.infura.io',
  [Chains.goerli]: 'https://goerli.infura.io',
  [Chains.polygon]: 'https://polygon-mainnet.infura.io',
  [Chains.mumbai]: 'https://polygon-mumbai.infura.io',
};

const availableChains = [Chains.mainnet, Chains.goerli, Chains.polygon, Chains.mumbai];

const getChainName = chainId => chainsName[chainId];

export { availableChains, Chains, getChainName, chainUrls };
