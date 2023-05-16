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
  sepolia: 11155111,
  bsc: 56,
  bsctest: 97,
  avalanche: 43114,
  fantom: 250,
  cronos: 25,
  arbitrum: 42161,
  palm: 11297108109,
};

const chainsName: ChainInfo = {
  1: 'mainnet',
  3: 'ropsten',
  4: 'rinkeby',
  5: 'goerli',
  137: 'polygon',
  80001: 'mumbai',
  11155111: 'sepolia',
  56: 'bsc',
  97: 'bsc test',
  43114: 'avalanche',
  250: 'fantom',
  25: 'cronos',
  11297108109: 'palm',
  42161: 'arbitrum',
};

const chainUrls = {
  [Chains.mainnet]: 'https://mainnet.infura.io',
  [Chains.ropsten]: 'https://ropsten.infura.io',
  [Chains.rinkeby]: 'https://rinkeby.infura.io',
  [Chains.goerli]: 'https://goerli.infura.io',
  [Chains.polygon]: 'https://polygon-mainnet.infura.io',
  [Chains.mumbai]: 'https://polygon-mumbai.infura.io',
  [Chains.sepolia]: 'https://sepolia.infura.io',
  [Chains.avalanche]: 'https://avalanche-mainnet.infura.io',
  [Chains.palm]: 'https://palm-mainnet.infura.io',
  [Chains.arbitrum]: 'https://arbitrum-mainnet.infura.io',
};

const availableChains = [
  Chains.mainnet,
  Chains.goerli,
  Chains.ropsten,
  Chains.rinkeby,
  Chains.polygon,
  Chains.mumbai,
  Chains.sepolia,
  Chains.arbitrum,
  Chains.avalanche,
  Chains.bsc,
  Chains.bsctest,
  Chains.cronos,
  Chains.fantom,
  Chains.palm,
];

const getChainName = (chainId: number) => chainsName[chainId];

export { availableChains, Chains, getChainName, chainUrls };
