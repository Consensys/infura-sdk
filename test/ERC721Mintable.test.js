import { ContractFactory, ethers } from 'ethers';
import ERC721Mintable from '../src/lib/ContractTemplates/ERC721Mintable';
import { ACCOUNT_ADDRESS, CONTRACT_ADDRESS, ACCOUNT_ADDRESS_2 } from './__mocks__/utils';

let eRC721Mintable;
let signer;
let contractAddress;

jest.mock('ethers');

describe('SDK', () => {
  const contractFactoryMock = jest
    .spyOn(ContractFactory.prototype, 'deploy')
    .mockImplementation(() => ({
      deployed: () => ({
        mintWithTokenURI: jest.fn(),
        'safeTransferFrom(address,address,uint256)': jest.fn(),
        setContractURI: jest.fn(),
        grantRole: jest.fn(),
        renounceRole: jest.fn(),
        revokeRole: jest.fn(),
        hasRole: jest.fn(),
        setApprovalForAll: jest.fn(),
        approve: jest.fn(),
        setRoyalties: jest.fn(),
        royaltyInfo: jest.fn(),
        renounceOwnership: jest.fn(),
      }),
    }));

  jest.spyOn(ethers.utils, 'isAddress').mockImplementation(() => true);
  jest.spyOn(ethers, 'Contract').mockImplementation(() => ({}));

  beforeAll(() => {
    signer = 'signer';
  });

  afterEach(() => {
    contractFactoryMock.mockClear();
  });

  it('should create "ERC721Mintable" instance', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    expect(eRC721Mintable).not.toBe(null);
  });

  it('[Deploy] - should return an Error if signer not defined ', () => {
    eRC721Mintable = new ERC721Mintable(null, contractAddress);

    const contract = async () =>
      eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });

    expect(contract).rejects.toThrow(
      '[ERC721Mintable.deploy] Signer instance is required to interact with contract.',
    );
  });

  it('[Deploy] - should console.warn if URI is not a link ', async () => {
    eRC721Mintable = new ERC721Mintable(signer, contractAddress);
    const logSpy = jest.spyOn(console, 'warn');

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });

    expect(logSpy).toHaveBeenCalledWith('WARNING: The ContractURI "URI" is not a link.');
    expect(logSpy).toHaveBeenCalledWith(
      'WARNING: ContractURI should be a public link to a valid JSON metadata file',
    );
  });

  it('[Deploy] - should return an Error if Name is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer, contractAddress);

    const contract = async () =>
      eRC721Mintable.deploy({ name: '', symbol: 'symbol', contractURI: 'URI' });

    expect(contract).rejects.toThrow('[ERC721Mintable.deploy] Name cannot be empty');
  });

  it('[Deploy] - should return an Error if symbol is undefined', () => {
    eRC721Mintable = new ERC721Mintable(signer, contractAddress);

    const contract = async () => eRC721Mintable.deploy({ name: 'name', contractURI: 'URI' });

    expect(contract).rejects.toThrow('[ERC721Mintable.deploy] symbol cannot be undefined');
  });

  it('[Deploy] - should return an Error if contractURI is undefined', () => {
    eRC721Mintable = new ERC721Mintable(signer, contractAddress);

    const contract = async () => eRC721Mintable.deploy({ name: 'name', symbol: 'symbol' });

    expect(contract).rejects.toThrow('[ERC721Mintable.deploy] contractURI cannot be undefined');
  });

  it('[Deploy] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => {
      throw new Error('test error');
    });

    const contract = async () =>
      eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });

    expect(contract).rejects.toThrow('code: UNKNOWN_ERROR, message: Error: test error');
  });

  it('[Deploy] - should return a contract', async () => {
    eRC721Mintable = new ERC721Mintable(signer, contractAddress);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });

    expect(ContractFactory.prototype.deploy).toHaveBeenCalledTimes(1);
  });

  it('[Mint] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const myNFT = async () =>
      eRC721Mintable.mint({
        publicAddress: ACCOUNT_ADDRESS,
        tokenURI: 'https://infura.io/images/404.png',
      });
    expect(myNFT).rejects.toThrow(
      '[ERC721Mintable.mint] A contract should be deployed or loaded first',
    );
  });

  it('[Mint] - should console.warn if tokenURI is not a link ', async () => {
    eRC721Mintable = new ERC721Mintable(signer);
    const logSpy = jest.spyOn(console, 'warn');

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'ipfs://URI' });
    await eRC721Mintable.mint({
      publicAddress: '0xE26a682fa90322eC48eB9F3FA66E8961D799177C',
      tokenURI: 'URI',
    });

    expect(logSpy).toHaveBeenCalledWith('WARNING: The TokenURI "URI" is not a link.');
    expect(logSpy).toHaveBeenCalledWith(
      'WARNING: TokenURI should be a public link to a valid JSON metadata file',
    );
  });

  it('[Mint] - should return an Error if the address is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const myNFT = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.mint({
        publicAddress: '',
        tokenURI: 'https://infura.io/images/404.png',
      });
    };
    expect(myNFT).rejects.toThrow('[ERC721Mintable.mint] A valid address is required to mint.');
  });

  it('[Mint] - should return an Error if the tokenURI is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const myNFT = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.mint({
        publicAddress: '0xE26a682fa90322eC48eB9F3FA66E8961D799177C',
        tokenURI: '',
      });
    };
    expect(myNFT).rejects.toThrow('[ERC721Mintable.mint] A tokenURI is required to mint.');
  });

  it('[Mint] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => ({
      deployed: () => ({
        mintWithTokenURI: () => {
          throw new Error('test error');
        },
      }),
    }));
    eRC721Mintable = new ERC721Mintable(signer);

    const myNFT = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.mint({
        publicAddress: ACCOUNT_ADDRESS,
        tokenURI: 'https://infura.io/images/404.png',
      });
    };
    expect(myNFT).rejects.toThrow(
      '[ERC721Mintable.mint] An error occured: code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[Mint] - should mint a token', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.mint({
      publicAddress: ACCOUNT_ADDRESS,
      tokenURI: 'https://infura.io/images/404.png',
    });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[LoadContract] - should return an Error if contract is already deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const contract = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.loadContract({ contractAddress: CONTRACT_ADDRESS });
    };
    expect(contract).rejects.toThrow(
      '[ERC721Mintable.loadContract] The contract has already been loaded!',
    );
  });

  it('[LoadContract] - should return an Error if the address is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const contract = async () => {
      await eRC721Mintable.loadContract({ contractAddress: '' });
    };
    expect(contract).rejects.toThrow(
      '[ERC721Mintable.loadContract] A valid contract address is required to load a contract.',
    );
  });

  it('[LoadContract] - should load the contract', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    await eRC721Mintable.loadContract({ contractAddress: CONTRACT_ADDRESS });

    expect(ethers.Contract).toHaveBeenCalledTimes(1);
  });

  it('[LoadContract] - should return an Error if there is a network error', async () => {
    jest.spyOn(ethers, 'Contract').mockImplementationOnce(() => {
      throw new Error('test error');
    });
    eRC721Mintable = new ERC721Mintable(signer);

    const contract = async () => {
      await eRC721Mintable.loadContract({ contractAddress: CONTRACT_ADDRESS });
    };
    expect(contract).rejects.toThrow(
      '[ERC721Mintable.loadContract] An error occured: code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[Transfer] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const transferNft = async () =>
      eRC721Mintable.transfer({ from: ACCOUNT_ADDRESS, to: ACCOUNT_ADDRESS_2, tokenId: 1 });
    expect(transferNft).rejects.toThrow(
      '[ERC721Mintable.transfer] A contract should be deployed or loaded first',
    );
  });

  it('[Transfer] - should return an Error if from address is not valid', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const transferNft = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'sumbol', contractURI: 'URI' });
      await eRC721Mintable.transfer({
        from: '',
        to: ACCOUNT_ADDRESS_2,
        tokenId: 1,
      });
    };
    expect(transferNft).rejects.toThrow(
      '[ERC721Mintable.transfer] A valid address "from" is required to transfer.',
    );
  });

  it('[Transfer] - should return an Error if to address is not valid', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const transferNft = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'sumbol', contractURI: 'URI' });
      await eRC721Mintable.transfer({
        from: ACCOUNT_ADDRESS,
        to: '',
        tokenId: 1,
      });
    };
    expect(transferNft).rejects.toThrow(
      '[ERC721Mintable.transfer] A valid address "to" is required to transfer.',
    );
  });

  it('[Transfer] - should return an Error if to tokenID is not valid', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const transferNft = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'sumbol', contractURI: 'URI' });
      await eRC721Mintable.transfer({
        from: ACCOUNT_ADDRESS,
        to: ACCOUNT_ADDRESS_2,
        tokenId: 'test',
      });
    };
    expect(transferNft).rejects.toThrow('[ERC721Mintable.transfer] TokenId should be an integer.');
  });

  it('[Transfer] - should transfer nft', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'sumbol', contractURI: 'URI' });
    await eRC721Mintable.transfer({
      from: ACCOUNT_ADDRESS,
      to: ACCOUNT_ADDRESS_2,
      tokenId: 1,
    });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[Transfer] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => ({
      deployed: () => ({
        'safeTransferFrom(address,address,uint256)': () => {
          throw new Error('test error');
        },
      }),
    }));
    eRC721Mintable = new ERC721Mintable(signer);

    const transferNft = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.transfer({
        from: ACCOUNT_ADDRESS,
        to: ACCOUNT_ADDRESS_2,
        tokenId: 1,
      });
    };
    expect(transferNft).rejects.toThrow(
      '[ERC721Mintable.transfer] An error occured: code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[SetContractURI] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    expect(() =>
      eRC721Mintable.setContractURI({
        contractURI:
          'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
      }),
    ).rejects.toThrow(
      '[ERC721Mintable.setContractURI] A contract should be deployed or loaded first!',
    );
  });

  it('[SetContractURI] - should console.warn if contractURI is not a link ', async () => {
    eRC721Mintable = new ERC721Mintable(signer);
    const logSpy = jest.spyOn(console, 'warn');

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'ipfs://URI' });
    await eRC721Mintable.setContractURI({ contractURI: 'URI' });

    expect(logSpy).toHaveBeenCalledWith('WARNING: The ContractURI "URI" is not a link.');
    expect(logSpy).toHaveBeenCalledWith(
      'WARNING: ContractURI should be a public link to a valid JSON metadata file',
    );
  });

  it('[SetContractURI] - should return an Error if the contractURI is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const uri = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.setContractURI({ contractURI: '' });
    };
    expect(uri).rejects.toThrow(
      '[ERC721Mintable.setContractURI] A valid contract uri is required!',
    );
  });

  it('[SetContractURI] - should set the contractURI', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.setContractURI({
      contractURI:
        'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
    });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[SetContractURI] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => ({
      deployed: () => ({
        setContractURI: () => {
          throw new Error('test error');
        },
      }),
    }));
    eRC721Mintable = new ERC721Mintable(signer);

    const setContractURI = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.setContractURI({
        contractURI:
          'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
      });
    };
    expect(setContractURI).rejects.toThrow(
      '[ERC721Mintable.setContractURI] An error occured: code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[SetContractURI] - should return an Error if there is runtime error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => ({
      deployed: () => ({
        setContractURI: () => {
          throw new RuntimeException('runtime exception');
        },
      }),
    }));
    eRC721Mintable = new ERC721Mintable(signer);

    const setContractURI = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.setContractURI({
        contractURI:
          'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
      });
    };
    expect(setContractURI).rejects.toThrow(
      '[RUNTIME.ERROR][ERC721Mintable.setContractURI] An error occured: code: UNKNOWN_ERROR, message: ReferenceError: RuntimeException is not defined',
    );
  });

  it('[addMinter] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const minter = async () => eRC721Mintable.addMinter({ publicAddress: ACCOUNT_ADDRESS });
    expect(minter).rejects.toThrow(
      '[ERC721Mintable.addMinter] A contract should be deployed or loaded first',
    );
  });

  it('[addMinter] - should return an Error if the address is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const minter = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.addMinter({ publicAddress: '' });
    };
    expect(minter).rejects.toThrow(
      '[ERC721Mintable.addMinter] A valid address is required to add the minter role.',
    );
  });

  it('[addMinter] - should add minter role to an address', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.addMinter({ publicAddress: ACCOUNT_ADDRESS });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[addMinter] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => ({
      deployed: () => ({
        grantRole: () => {
          throw new Error('test error');
        },
      }),
    }));
    eRC721Mintable = new ERC721Mintable(signer);

    const addMinter = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.addMinter({ publicAddress: ACCOUNT_ADDRESS });
    };
    expect(addMinter).rejects.toThrow(
      '[ERC721Mintable.addMinter] An error occured: code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[removeMinter] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const minter = async () => eRC721Mintable.removeMinter({ publicAddress: ACCOUNT_ADDRESS });
    expect(minter).rejects.toThrow(
      '[ERC721Mintable.removeMinter] A contract should be deployed or loaded first',
    );
  });

  it('[removeMinter] - should return an Error if the address is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const minter = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.removeMinter({ publicAddress: '' });
    };
    expect(minter).rejects.toThrow(
      '[ERC721Mintable.removeMinter] A valid address is required to remove the minter role.',
    );
  });

  it('[removeMinter] - should remove minter role to an address', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.removeMinter({ publicAddress: ACCOUNT_ADDRESS });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[renounceMinter] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const minter = async () => eRC721Mintable.renounceMinter({ publicAddress: ACCOUNT_ADDRESS });
    expect(minter).rejects.toThrow(
      '[ERC721Mintable.renounceMinter] A contract should be deployed or loaded first',
    );
  });

  it('[renounceMinter] - should return an Error if the address is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const minter = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.renounceMinter({ publicAddress: '' });
    };
    expect(minter).rejects.toThrow(
      '[ERC721Mintable.renounceMinter] A valid address is required to renounce the minter role.',
    );
  });

  it('[renounceMinter] - should renounce minter role for an address', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.renounceMinter({ publicAddress: ACCOUNT_ADDRESS });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[renounceMinter] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => ({
      deployed: () => ({
        renounceRole: () => {
          throw new Error('test error');
        },
      }),
    }));
    eRC721Mintable = new ERC721Mintable(signer);

    const renounceMinter = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.renounceMinter({ publicAddress: ACCOUNT_ADDRESS });
    };
    expect(renounceMinter).rejects.toThrow(
      '[ERC721Mintable.renounceMinter] An error occured: code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[isMinter] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const minter = async () => eRC721Mintable.isMinter({ publicAddress: ACCOUNT_ADDRESS });
    expect(minter).rejects.toThrow(
      '[ERC721Mintable.isMinter] A contract should be deployed or loaded first',
    );
  });

  it('[isMinter] - should return an Error if the address is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const minter = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.isMinter({ publicAddress: '' });
    };
    expect(minter).rejects.toThrow(
      '[ERC721Mintable.isMinter] A valid address is required to check the minter role.',
    );
  });

  it('[isMinter] - should check if an address has minter role', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.isMinter({ publicAddress: ACCOUNT_ADDRESS });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[isMinter] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => ({
      deployed: () => ({
        hasRole: () => {
          throw new Error('test error');
        },
      }),
    }));
    eRC721Mintable = new ERC721Mintable(signer);

    const isMinter = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.isMinter({ publicAddress: ACCOUNT_ADDRESS });
    };
    expect(isMinter).rejects.toThrow(
      '[ERC721Mintable.isMinter] An error occured: code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[SetApprovalForAll] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    expect(() =>
      eRC721Mintable.setApprovalForAll({ to: ACCOUNT_ADDRESS, approvalStatus: true }),
    ).rejects.toThrow(
      '[ERC721Mintable.setApprovalForAll] A contract should be deployed or loaded first.',
    );
  });

  it('[SetApprovalForAll] - should return an Error if the address is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const approval = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.setApprovalForAll({ to: '', approvalStatus: true });
    };
    expect(approval).rejects.toThrow(
      '[ERC721Mintable.setApprovalForAll] An address is required to setApprovalForAll.',
    );
  });

  it('[SetApprovalForAll] - should return an Error if the approvalStatus is not a boolean', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const approval = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.setApprovalForAll({ to: ACCOUNT_ADDRESS, approvalStatus: '' });
    };
    expect(approval).rejects.toThrow(
      '[ERC721Mintable.setApprovalForAll] approvalStatus param should be a boolean.',
    );
  });

  it('[SetApprovalForAll] - should set approval for all when all params are correct', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const approval = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.setApprovalForAll({ to: ACCOUNT_ADDRESS, approvalStatus: true });
    };

    expect(approval).not.toThrow();
    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[SetApprovalForAll] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => ({
      deployed: () => ({
        setApprovalForAll: () => {
          throw new Error('test error');
        },
      }),
    }));
    eRC721Mintable = new ERC721Mintable(signer);

    const setApprovalForAll = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.setApprovalForAll({ to: ACCOUNT_ADDRESS, approvalStatus: true });
    };
    expect(setApprovalForAll).rejects.toThrow(
      '[ERC721Mintable.setApprovalForAll] An error occured: code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[addAdmin] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    expect(() =>
      eRC721Mintable.addAdmin({ publicAddress: '0xB3C24BB465b682225F8C87b29a031921B764Ed94' }),
    ).rejects.toThrow('[ERC721Mintable.addAdmin] A contract should be deployed or loaded first!');
  });

  it('[addAdmin] - should return an Error because of bad address', () => {
    eRC721Mintable = new ERC721Mintable(signer);
    const admin = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.addAdmin({ publicAddress: '' });
    };
    expect(admin).rejects.toThrow(
      '[ERC721Mintable.addAdmin] A valid address is required to add the admin role.',
    );
  });

  it('[addAdmin] - should add admin', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.addAdmin({ publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67' });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[addAdmin] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => ({
      deployed: () => ({
        grantRole: () => {
          throw new Error('test error');
        },
      }),
    }));
    eRC721Mintable = new ERC721Mintable(signer);

    const addAdmin = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.addAdmin({
        publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
      });
    };
    expect(addAdmin).rejects.toThrow(
      '[ERC721Mintable.addAdmin] An error occured: code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[removeAdmin] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    expect(() =>
      eRC721Mintable.removeAdmin({ publicAddress: '0xB3C24BB465b682225F8C87b29a031921B764Ed94' }),
    ).rejects.toThrow(
      '[ERC721Mintable.removeAdmin] A contract should be deployed or loaded first!',
    );
  });

  it('[removeAdmin] - should return an Error because of bad address', () => {
    eRC721Mintable = new ERC721Mintable(signer);
    const admin = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.removeAdmin({ publicAddress: '' });
    };
    expect(admin).rejects.toThrow(
      '[ERC721Mintable.removeAdmin] A valid address is required to remove the admin role.',
    );
  });

  it('[removeAdmin] - should remove admin', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.removeAdmin({
      publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
    });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[removeAdmin] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => ({
      deployed: () => ({
        revokeRole: () => {
          throw new Error('test error');
        },
      }),
    }));
    eRC721Mintable = new ERC721Mintable(signer);

    const removeAdmin = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.removeAdmin({
        publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
      });
    };
    expect(removeAdmin).rejects.toThrow(
      '[ERC721Mintable.removeAdmin] An error occured: code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[renounceAdmin] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    expect(() =>
      eRC721Mintable.renounceAdmin({ publicAddress: '0xB3C24BB465b682225F8C87b29a031921B764Ed94' }),
    ).rejects.toThrow(
      '[ERC721Mintable.renounceAdmin] A contract should be deployed or loaded first!',
    );
  });

  it('[renounceAdmin] - should return an Error because of bad address', () => {
    eRC721Mintable = new ERC721Mintable(signer);
    const admin = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.renounceAdmin({ publicAddress: '' });
    };
    expect(admin).rejects.toThrow(
      '[ERC721Mintable.renounceAdmin] A valid address is required to renounce the admin role.',
    );
  });

  it('[renounceAdmin] - should renounce admin', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.renounceAdmin({
      publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
    });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[renounceAdmin] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => ({
      deployed: () => ({
        renounceRole: () => {
          throw new Error('test error');
        },
      }),
    }));
    eRC721Mintable = new ERC721Mintable(signer);

    const renounceAdmin = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.renounceAdmin({
        publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
      });
    };
    expect(renounceAdmin).rejects.toThrow(
      '[ERC721Mintable.renounceAdmin] An error occured: code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[isAdmin] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    expect(() =>
      eRC721Mintable.isAdmin({ publicAddress: '0xB3C24BB465b682225F8C87b29a031921B764Ed94' }),
    ).rejects.toThrow('[ERC721Mintable.isAdmin] A contract should be deployed or loaded first!');
  });

  it('[isAdmin] - should return an Error because of bad address', () => {
    eRC721Mintable = new ERC721Mintable(signer);
    const admin = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.isAdmin({ publicAddress: '' });
    };
    expect(admin).rejects.toThrow(
      '[ERC721Mintable.isAdmin] A valid address is required to check the admin role.',
    );
  });

  it('[isAdmin] - should renounce admin', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.isAdmin({ publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67' });
    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[isAdmin] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => ({
      deployed: () => ({
        hasRole: () => {
          throw new Error('test error');
        },
      }),
    }));
    eRC721Mintable = new ERC721Mintable(signer);

    const isAdmin = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.isAdmin({ publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67' });
    };
    expect(isAdmin).rejects.toThrow(
      '[ERC721Mintable.isAdmin] An error occured: code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[ApproveTransfer] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const approveTransfer = async () =>
      eRC721Mintable.approveTransfer({ to: ACCOUNT_ADDRESS_2, tokenId: 1 });
    expect(approveTransfer).rejects.toThrow(
      '[ERC721Mintable.approveTransfer] A contract should be deployed or loaded first',
    );
  });

  it('[ApproveTransfer] - should return an Error if to address is not valid', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const approveTransfer = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'sumbol', contractURI: 'URI' });
      await eRC721Mintable.approveTransfer({ to: '', tokenId: 1 });
    };

    expect(approveTransfer).rejects.toThrow(
      '[ERC721Mintable.approveTransfer] A valid address "to" is required to transfer.',
    );
  });

  it('[ApproveTransfer] - should return an Error if tokenId is not valid', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const approveTransfer = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'sumbol', contractURI: 'URI' });
      await eRC721Mintable.approveTransfer({ to: ACCOUNT_ADDRESS, tokenId: '' });
    };

    expect(approveTransfer).rejects.toThrow(
      '[ERC721Mintable.approveTransfer] TokenId should be an integer.',
    );
  });

  it('[ApproveTransfer] - should approve transfer nft', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'sumbol', contractURI: 'URI' });
    await eRC721Mintable.approveTransfer({ to: ACCOUNT_ADDRESS, tokenId: 1 });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[ApproveTransfer] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => ({
      deployed: () => ({
        approve: () => {
          throw new Error('test error');
        },
      }),
    }));
    eRC721Mintable = new ERC721Mintable(signer);

    const approveTransfer = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.approveTransfer({ to: ACCOUNT_ADDRESS, tokenId: 1 });
    };
    expect(approveTransfer).rejects.toThrow(
      '[ERC721Mintable.approveTransfer] An error occured: code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  describe('setRoyalties', () => {
    it('[setRoyalties] - should throw if contract not deployed', async () => {
      const contract = new ERC721Mintable(signer);

      await expect(() =>
        contract.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 }),
      ).rejects.toThrow('[ERC721Mintable.setRoyalties] Contract needs to be deployed');
    });
    it('[setRoyalties] - should throw when args are missing (address)', async () => {
      const contract = new ERC721Mintable(signer);
      contract.contractAddress = CONTRACT_ADDRESS;

      await expect(() => contract.setRoyalties({ publicAddress: null, fee: 1 })).rejects.toThrow(
        '[ERC721Mintable.setRoyalties] Address is required',
      );
    });
    it('[setRoyalties] - should throw when args are missing (fee)', async () => {
      const contract = new ERC721Mintable(signer);
      contract.contractAddress = CONTRACT_ADDRESS;

      await expect(() =>
        contract.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: null }),
      ).rejects.toThrow(
        '[ERC721Mintable.setRoyalties] Fee as numeric value between 0 and 10000 is required',
      );
    });
    it('[setRoyalties] - should throw when "fee" is not a number', async () => {
      const contract = new ERC721Mintable(signer);
      contract.contractAddress = CONTRACT_ADDRESS;

      await expect(() =>
        contract.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 'number' }),
      ).rejects.toThrow(
        '[ERC721Mintable.setRoyalties] Fee as numeric value between 0 and 10000 is required',
      );
    });
    it('[setRoyalties] - should throw when "fee" is not a number larger than 0 and less than 10000', async () => {
      const contract = new ERC721Mintable(signer);
      contract.contractAddress = CONTRACT_ADDRESS;

      await expect(() =>
        contract.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 0 }),
      ).rejects.toThrow(
        '[ERC721Mintable.setRoyalties] Fee as numeric value between 0 and 10000 is required',
      );
    });

    it('[setRoyalties] - should set royalties', async () => {
      const contract = new ERC721Mintable(signer);
      await contract.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      contract.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });
      await expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });

    it('[setRoyalties] - should return an Error if there is a network error', async () => {
      jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => ({
        deployed: () => ({
          setRoyalties: () => {
            throw new Error('test error');
          },
        }),
      }));
      eRC721Mintable = new ERC721Mintable(signer);

      const setRoyalties = async () => {
        await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
        await eRC721Mintable.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });
      };
      expect(setRoyalties).rejects.toThrow(
        '[ERC721Mintable.setRoyalties] An error occured: code: UNKNOWN_ERROR, message: Error: test error',
      );
    });
  });

  describe('royaltyInfo', () => {
    it('[royaltyInfo] - should throw if contract not deployed', async () => {
      const contract = new ERC721Mintable(signer);
      await contract.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      contract.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() => contract.royaltyInfo({ tokenId: 1, sellPrice: null })).rejects.toThrow(
        '[ERC721Mintable.royaltyInfo] Sell price is required',
      );
    });
    it('[royaltyInfo] - should throw when args are missing (tokenId)', async () => {
      const contract = new ERC721Mintable(signer);
      await contract.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      contract.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() => contract.royaltyInfo({ tokenId: null, sellPrice: null })).rejects.toThrow(
        '[ERC721Mintable.royaltyInfo] TokenId is required',
      );
    });
    it('[royaltyInfo] - should throw when args are missing (sellPrice)', async () => {
      const contract = new ERC721Mintable(signer);
      await contract.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      contract.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() => contract.royaltyInfo({ tokenId: 1, sellPrice: null })).rejects.toThrow(
        '[ERC721Mintable.royaltyInfo] Sell price is required',
      );
    });
    it('[royaltyInfo] - should not throw if TokenId is 0', async () => {
      const contract = new ERC721Mintable(signer);
      await contract.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      contract.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() => contract.royaltyInfo({ tokenId: 0, sellPrice: 10 })).toBeTruthy();
    });
    it('[royaltyInfo] - should not throw if SalePrice is 0', async () => {
      const contract = new ERC721Mintable(signer);
      await contract.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      contract.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() => contract.royaltyInfo({ tokenId: 1, sellPrice: 0 })).toBeTruthy();
    });

    it('[royaltyInfo] - should return an Error if there is a network error', async () => {
      jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => ({
        deployed: () => ({
          royaltyInfo: () => {
            throw new Error('test error');
          },
        }),
      }));
      eRC721Mintable = new ERC721Mintable(signer);

      const royaltyInfo = async () => {
        await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
        await eRC721Mintable.royaltyInfo({ tokenId: 1, sellPrice: 100 });
      };
      expect(royaltyInfo).rejects.toThrow(
        '[ERC721Mintable.royaltyInfo] An error occured: code: UNKNOWN_ERROR, message: Error: test error',
      );
    });
  });
  describe('renounceOwnership', () => {
    it('[renounceOwnership] - should throw if contract not deployed', async () => {
      eRC721Mintable = new ERC721Mintable(signer);
      const renounceOwnership = async () => eRC721Mintable.renounceOwnership();

      expect(renounceOwnership).rejects.toThrow(
        '[ERC721Mintable.renounceOwnership] Contract needs to be deployed',
      );
    });

    it('[renounceOwnership] - should call renounce ownership', async () => {
      eRC721Mintable = new ERC721Mintable(signer);

      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.renounceOwnership();

      expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });

    it('[renounceOwnership] - should return an Error if there is a network error', async () => {
      jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => ({
        deployed: () => ({
          renounceOwnership: () => {
            throw new Error('test error');
          },
        }),
      }));
      eRC721Mintable = new ERC721Mintable(signer);

      const renounceOwnership = async () => {
        await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
        await eRC721Mintable.renounceOwnership();
      };
      expect(renounceOwnership).rejects.toThrow(
        '[ERC721Mintable.renounceOwnership] An error occured: code: UNKNOWN_ERROR, message: Error: test error',
      );
    });
  });
});
