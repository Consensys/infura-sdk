type ChainInfo = {
  [key: number]: string;
};

const Chains = {
  mainnet: 1,
  ropsten: 3,
  rinkeby: 4,
  goerli: 5,
  polygon: 137,
  mumbai: 80001,
};

const chainsName: ChainInfo = {
  1: 'mainnet',
  3: 'ropsten',
  4: 'rinkeby',
  5: 'goerli',
  137: 'polygon',
  80001: 'mumbai',
};

const chainUrls = {
  [Chains.mainnet]: 'https://mainnet.infura.io',
  [Chains.ropsten]: 'https://ropsten.infura.io',
  [Chains.rinkeby]: 'https://rinkeby.infura.io',
  [Chains.goerli]: 'https://goerli.infura.io',
  [Chains.polygon]: 'https://polygon-mainnet.infura.io',
  [Chains.mumbai]: 'https://polygon-mumbai.infura.io',
};

const availableChains = [
  Chains.mainnet,
  Chains.goerli,
  Chains.ropsten,
  Chains.rinkeby,
  Chains.polygon,
  Chains.mumbai,
];

const getChainName = (chainId: number) => chainsName[chainId];

export { availableChains, Chains, getChainName, chainUrls };
