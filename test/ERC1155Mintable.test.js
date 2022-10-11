import { ContractFactory, ethers } from 'ethers';
import { faker } from '@faker-js/faker';

import ERC1155Mintable from '../src/lib/ContractTemplates/ERC1155Mintable';
import { ACCOUNT_ADDRESS, CONTRACT_ADDRESS, ACCOUNT_ADDRESS_2 } from './__mocks__/utils';
import { errorLogger, ERROR_LOG } from '../src/lib/error/handler.js';

let erc1155Mintable;
let signer;
const address = '0x0';

jest.mock('ethers');

describe('SDK', () => {
  const contractFactoryMock = jest
    .spyOn(ContractFactory.prototype, 'deploy')
    .mockImplementation(() => ({
      deployed: () => ({
        address,
        mint: jest.fn(),
        mintBatch: jest.fn(),
        safeTransferFrom: jest.fn(),
        safeBatchTransferFrom: jest.fn(),
        setContractURI: jest.fn(),
        setURI: jest.fn(),
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
  jest
    .spyOn(ethers.utils, 'parseUnits')
    .mockImplementation(() => ({ _hex: '0x3a35294400', _isBigNumber: true }));

  beforeAll(() => {
    signer = 'signer';
  });

  afterEach(() => {
    contractFactoryMock.mockClear();
  });

  it('should create "ERC1155Mintable" instance', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    expect(erc1155Mintable).not.toBe(null);
  });

  it('[Deploy] - should return an Error if signer not defined ', () => {
    erc1155Mintable = new ERC1155Mintable(null);

    const contract = async () =>
      erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });

    expect(contract).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.ERC1155Mintable_deploy,
        message: ERROR_LOG.message.no_signer_instance_supplied,
      }),
    );
  });

  it('[Deploy] - should console.warn if contractURI is not a link ', async () => {
    erc1155Mintable = new ERC1155Mintable(signer);
    const logSpy = jest.spyOn(console, 'warn');

    await erc1155Mintable.deploy({
      baseURI: faker.internet.url(),
      contractURI: 'this is not a URI',
      ids: [],
    });

    expect(logSpy).toHaveBeenCalledWith('WARNING: The ContractURI "URI" is not a link.');
    expect(logSpy).toHaveBeenCalledWith(
      'WARNING: ContractURI should be a public link to a valid JSON metadata file',
    );
  });

  it('[Deploy] - should console.warn if baseURI is not a link ', async () => {
    erc1155Mintable = new ERC1155Mintable(signer);
    const logSpy = jest.spyOn(console, 'warn');

    await erc1155Mintable.deploy({
      contractURI: faker.internet.url(),
      baseURI: 'this is not a URI',
      ids: [],
    });

    expect(logSpy).toHaveBeenCalledWith('WARNING: The BaseURI "URI" is not a link.');
    expect(logSpy).toHaveBeenCalledWith(
      'WARNING: BaseURI should be a public link to a valid JSON metadata file',
    );
  });

  it('[Deploy] - should return an Error if contractURI is undefined', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    const contract = async () => erc1155Mintable.deploy({ baseURI: faker.internet.url() });

    expect(contract).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.ERC1155Mintable_deploy,
        message: ERROR_LOG.message.no_contractURI_supplied,
      }),
    );
  });

  it('[Deploy] - should return an Error if baseURI is undefined', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    const contract = async () => erc1155Mintable.deploy({ contractURI: faker.internet.url() });

    expect(contract).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.ERC1155Mintable_deploy,
        message: ERROR_LOG.message.no_baseURI_supplied,
      }),
    );
  });

  it('[Deploy] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => {
      throw new Error('test error');
    });

    const contract = async () =>
      erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });

    expect(contract).rejects.toThrow('code: UNKNOWN_ERROR, message: Error: test error');
  });

  it('[Deploy] - should return a contract', async () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    await erc1155Mintable.deploy({
      baseURI: faker.internet.url(),
      contractURI: faker.internet.url(),
      ids: [],
    });

    expect(ContractFactory.prototype.deploy).toHaveBeenCalledTimes(1);
  });

  it('[Deploy] - should deploy with gas passed', async () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    await erc1155Mintable.deploy({
      baseURI: faker.internet.url(),
      contractURI: faker.internet.url(),
      ids: [],
      gas: 250,
    });
    const gasPrice = { _hex: '0x3a35294400', _isBigNumber: true }; // 250 in BigNumber

    expect(ContractFactory.prototype.deploy).toHaveBeenCalledTimes(1);
    expect(ContractFactory.prototype.deploy).toHaveBeenCalledWith(
      faker.internet.url(),
      faker.internet.url(),
      [],
      {
        gasPrice,
      },
    );
  });

  it('[Mint] - should return an Error if contract is not deployed', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    const myNFT = async () =>
      erc1155Mintable.mint({
        publicAddress: ACCOUNT_ADDRESS,
        tokenURI: 'https://infura.io/images/404.png',
      });
    expect(myNFT).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.ERC1155Mintable_mint,
        message: ERROR_LOG.message.contract_not_deployed_or_loaded,
      }),
    );
  });

  it('[Mint] - should return an Error if the address is empty', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    const myNFT = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.mint({
        to: '',
        id: 0,
        quantity: 1,
      });
    };
    expect(myNFT).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.ERC1155Mintable_mint,
        message: ERROR_LOG.message.invalid_public_address,
      }),
    );
  });

  it('[Mint] - should return an Error if the quantity is less than one', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    const myNFT = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.mint({
        to: '0xE26a682fa90322eC48eB9F3FA66E8961D799177C',
        id: 0,
        quantity: 0,
      });
    };
    expect(myNFT).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.ERC1155Mintable_mint,
        message: ERROR_LOG.message.no_tokenURI_supplied,
      }),
    );
  });

  it('[Mint] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => ({
      deployed: () => ({
        mintWithTokenURI: () => {
          throw new Error('test error');
        },
      }),
    }));
    erc1155Mintable = new ERC1155Mintable(signer);

    const myNFT = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.mint({
        to: ACCOUNT_ADDRESS,
        id: 0,
        quantity: 1,
      });
    };
    expect(myNFT).rejects.toThrow(
      '[ERC1155Mintable.mint] An error occured | [RUNTIME.ERROR] code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[Mint] - should mint a token', async () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    await erc1155Mintable.deploy({
      baseURI: faker.internet.url(),
      contractURI: faker.internet.url(),
      ids: [],
    });
    await erc1155Mintable.mint({
      to: ACCOUNT_ADDRESS,
      id: 0,
      quantity: 1,
    });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[LoadContract] - should return an Error if contract is already deployed', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    const contract = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.loadContract({ contractAddress: CONTRACT_ADDRESS });
    };
    expect(contract).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.ERC1155Mintable_loadContract,
        message: ERROR_LOG.message.contract_already_loaded,
      }),
    );
  });

  it('[LoadContract] - should return an Error if the address is empty', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    const contract = async () => {
      await erc1155Mintable.loadContract({ contractAddress: '' });
    };
    expect(contract).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.ERC1155Mintable_loadContract,
        message: ERROR_LOG.message.invalid_contract_address,
      }),
    );
  });

  it('[LoadContract] - should load the contract', async () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    await erc1155Mintable.loadContract({ contractAddress: CONTRACT_ADDRESS });

    expect(ethers.Contract).toHaveBeenCalledTimes(1);
  });

  it('[LoadContract] - should return an Error if there is a network error', async () => {
    jest.spyOn(ethers, 'Contract').mockImplementationOnce(() => {
      throw new Error('test error');
    });
    erc1155Mintable = new ERC1155Mintable(signer);

    const contract = async () => {
      await erc1155Mintable.loadContract({ contractAddress: CONTRACT_ADDRESS });
    };
    expect(contract).rejects.toThrow(
      '[ERC1155Mintable.loadContract] An error occured | [RUNTIME.ERROR] code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[SetContractURI] - should return an Error if contract is not deployed', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    expect(() =>
      erc1155Mintable.setContractURI({
        contractURI:
          'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
      }),
    ).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.BaseERC721_setContractURI,
        message: ERROR_LOG.message.contract_not_deployed_or_loaded,
      }),
    );
  });

  it('[SetContractURI] - should console.warn if contractURI is not a link ', async () => {
    erc1155Mintable = new ERC1155Mintable(signer);
    const logSpy = jest.spyOn(console, 'warn').mockImplementation();

    await erc1155Mintable.deploy({
      baseURI: faker.internet.url(),
      contractURI: faker.internet.url(),
      ids: [],
    });
    await erc1155Mintable.setContractURI({ contractURI: 'URI' });

    expect(logSpy).toHaveBeenCalledWith('WARNING: The ContractURI "URI" is not a link.');
    expect(logSpy).toHaveBeenCalledWith(
      'WARNING: ContractURI should be a public link to a valid JSON metadata file',
    );
  });

  it('[SetContractURI] - should return an Error if the contractURI is empty', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    const uri = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.setContractURI({ contractURI: '' });
    };
    expect(uri).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.BaseERC721_setContractURI,
        message: ERROR_LOG.message.invalid_contractURI,
      }),
    );
  });

  it('[SetContractURI] - should set the contractURI', async () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    await erc1155Mintable.deploy({
      baseURI: faker.internet.url(),
      contractURI: faker.internet.url(),
      ids: [],
    });
    await erc1155Mintable.setContractURI({
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
    erc1155Mintable = new ERC1155Mintable(signer);

    const setContractURI = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.setContractURI({
        contractURI:
          'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
      });
    };
    expect(setContractURI).rejects.toThrow(
      '[BaseERC721.setContractURI] An error occured | [RUNTIME.ERROR] code: UNKNOWN_ERROR, message: Error: test error',
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
    erc1155Mintable = new ERC1155Mintable(signer);

    const setContractURI = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.setContractURI({
        contractURI:
          'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
      });
    };
    expect(setContractURI).rejects.toThrow(
      '[BaseERC721.setContractURI] An error occured | [RUNTIME.ERROR] code: UNKNOWN_ERROR, message: ReferenceError: RuntimeException is not defined',
    );
  });

  it('[addMinter] - should return an Error if contract is not deployed', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    const minter = async () =>
      erc1155Mintable.accessControl.addMinter({ publicAddress: ACCOUNT_ADDRESS });
    expect(minter).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.AccessControl_addMinter,
        message: ERROR_LOG.message.contract_not_deployed_or_loaded,
      }),
    );
  });

  it('[addMinter] - should return an Error if the address is empty', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    const minter = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.addMinter({ publicAddress: '' });
    };
    expect(minter).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.AccessControl_addMinter,
        message: ERROR_LOG.message.invalid_public_address,
      }),
    );
  });

  it('[addMinter] - should add minter role to an address', async () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    await erc1155Mintable.deploy({
      baseURI: faker.internet.url(),
      contractURI: faker.internet.url(),
      ids: [],
    });
    await erc1155Mintable.accessControl.addMinter({ publicAddress: ACCOUNT_ADDRESS });

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
    erc1155Mintable = new ERC1155Mintable(signer);

    const addMinter = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.addMinter({ publicAddress: ACCOUNT_ADDRESS });
    };
    expect(addMinter).rejects.toThrow(
      '[AccessControl.addMinter] An error occured | [RUNTIME.ERROR] code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[removeMinter] - should return an Error if contract is not deployed', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    const minter = async () =>
      erc1155Mintable.accessControl.removeMinter({ publicAddress: ACCOUNT_ADDRESS });
    expect(minter).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.AccessControl_removeMinter,
        message: ERROR_LOG.message.contract_not_deployed_or_loaded,
      }),
    );
  });

  it('[removeMinter] - should return an Error if the address is empty', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    const minter = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.removeMinter({ publicAddress: '' });
    };
    expect(minter).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.AccessControl_removeMinter,
        message: ERROR_LOG.message.invalid_public_address,
      }),
    );
  });

  it('[removeMinter] - should remove minter role to an address', async () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    await erc1155Mintable.deploy({
      baseURI: faker.internet.url(),
      contractURI: faker.internet.url(),
      ids: [],
    });
    await erc1155Mintable.accessControl.removeMinter({ publicAddress: ACCOUNT_ADDRESS });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[renounceMinter] - should return an Error if contract is not deployed', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    const minter = async () =>
      ERC1155Mintable.accessControl.renounceMinter({ publicAddress: ACCOUNT_ADDRESS });
    expect(minter).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.AccessControl_renounceMinter,
        message: ERROR_LOG.message.contract_not_deployed_or_loaded,
      }),
    );
  });

  it('[renounceMinter] - should return an Error if the address is empty', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    const minter = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.renounceMinter({ publicAddress: '' });
    };
    expect(minter).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.AccessControl_renounceMinter,
        message: ERROR_LOG.message.invalid_public_address,
      }),
    );
  });

  it('[renounceMinter] - should renounce minter role for an address', async () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    await erc1155Mintable.deploy({
      baseURI: faker.internet.url(),
      contractURI: faker.internet.url(),
      ids: [],
    });
    await erc1155Mintable.accessControl.renounceMinter({ publicAddress: ACCOUNT_ADDRESS });

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
    erc1155Mintable = new ERC1155Mintable(signer);

    const renounceMinter = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.renounceMinter({ publicAddress: ACCOUNT_ADDRESS });
    };
    expect(renounceMinter).rejects.toThrow(
      '[AccessControl.renounceMinter] An error occured | [RUNTIME.ERROR] code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[isMinter] - should return an Error if contract is not deployed', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    const minter = async () =>
      erc1155Mintable.accessControl.isMinter({ publicAddress: ACCOUNT_ADDRESS });
    expect(minter).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.AccessControl_isMinter,
        message: ERROR_LOG.message.contract_not_deployed_or_loaded,
      }),
    );
  });

  it('[isMinter] - should return an Error if the address is empty', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    const minter = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.isMinter({ publicAddress: '' });
    };
    expect(minter).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.AccessControl_isMinter,
        message: ERROR_LOG.message.invalid_public_address,
      }),
    );
  });

  it('[isMinter] - should check if an address has minter role', async () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    await erc1155Mintable.deploy({
      baseURI: faker.internet.url(),
      contractURI: faker.internet.url(),
      ids: [],
    });
    await erc1155Mintable.accessControl.isMinter({ publicAddress: ACCOUNT_ADDRESS });

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
    erc1155Mintable = new ERC1155Mintable(signer);

    const isMinter = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.isMinter({ publicAddress: ACCOUNT_ADDRESS });
    };
    expect(isMinter).rejects.toThrow(
      '[AccessControl.isMinter] An error occured | [RUNTIME.ERROR] code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[SetApprovalForAll] - should return an Error if contract is not deployed', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    expect(() =>
      erc1155Mintable.setApprovalForAll({ to: ACCOUNT_ADDRESS, approvalStatus: true }),
    ).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.BaseERC721_setApprovalForAll,
        message: ERROR_LOG.message.contract_not_deployed_or_loaded,
      }),
    );
  });

  it('[SetApprovalForAll] - should return an Error if the address is empty', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    const approval = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.setApprovalForAll({ to: '', approvalStatus: true });
    };
    expect(approval).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.BaseERC721_setApprovalForAll,
        message: ERROR_LOG.message.no_to_address,
      }),
    );
  });

  it('[SetApprovalForAll] - should return an Error if the approvalStatus is not a boolean', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    const approval = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.setApprovalForAll({ to: ACCOUNT_ADDRESS, approvalStatus: '' });
    };
    expect(approval).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.BaseERC721_setApprovalForAll,
        message: ERROR_LOG.message.approvalStatus_must_be_boolean,
      }),
    );
  });

  it('[SetApprovalForAll] - should set approval for all when all params are correct', async () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    const approval = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.setApprovalForAll({ to: ACCOUNT_ADDRESS, approvalStatus: true });
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
    erc1155Mintable = new ERC1155Mintable(signer);

    const setApprovalForAll = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.setApprovalForAll({ to: ACCOUNT_ADDRESS, approvalStatus: true });
    };
    expect(setApprovalForAll).rejects.toThrow(
      '[BaseERC721.setApprovalForAll] An error occured | [RUNTIME.ERROR] code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[addAdmin] - should return an Error if contract is not deployed', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    expect(() =>
      erc1155Mintable.accessControl.addAdmin({
        publicAddress: '0xB3C24BB465b682225F8C87b29a031921B764Ed94',
      }),
    ).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.AccessControl_addAdmin,
        message: ERROR_LOG.message.contract_not_deployed_or_loaded,
      }),
    );
  });

  it('[addAdmin] - should return an Error because of bad address', () => {
    erc1155Mintable = new ERC1155Mintable(signer);
    const admin = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.addAdmin({ publicAddress: '' });
    };
    expect(admin).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.AccessControl_addAdmin,
        message: ERROR_LOG.message.invalid_public_address,
      }),
    );
  });

  it('[addAdmin] - should add admin', async () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    await erc1155Mintable.deploy({
      baseURI: faker.internet.url(),
      contractURI: faker.internet.url(),
      ids: [],
    });
    await erc1155Mintable.accessControl.addAdmin({
      publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
    });

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
    erc1155Mintable = new ERC1155Mintable(signer);

    const addAdmin = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.addAdmin({
        publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
      });
    };
    expect(addAdmin).rejects.toThrow(
      '[AccessControl.addAdmin] An error occured | [RUNTIME.ERROR] code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[removeAdmin] - should return an Error if contract is not deployed', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    expect(() =>
      erc1155Mintable.accessControl.removeAdmin({
        publicAddress: '0xB3C24BB465b682225F8C87b29a031921B764Ed94',
      }),
    ).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.AccessControl_removeAdmin,
        message: ERROR_LOG.message.contract_not_deployed_or_loaded,
      }),
    );
  });

  it('[removeAdmin] - should return an Error because of bad address', () => {
    erc1155Mintable = new ERC1155Mintable(signer);
    const admin = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.removeAdmin({ publicAddress: '' });
    };
    expect(admin).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.AccessControl_removeAdmin,
        message: ERROR_LOG.message.invalid_public_address,
      }),
    );
  });

  it('[removeAdmin] - should remove admin', async () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    await erc1155Mintable.deploy({
      baseURI: faker.internet.url(),
      contractURI: faker.internet.url(),
      ids: [],
    });
    await erc1155Mintable.accessControl.removeAdmin({
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
    erc1155Mintable = new ERC1155Mintable(signer);

    const removeAdmin = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.removeAdmin({
        publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
      });
    };
    expect(removeAdmin).rejects.toThrow(
      '[AccessControl.removeAdmin] An error occured | [RUNTIME.ERROR] code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[renounceAdmin] - should return an Error if contract is not deployed', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    expect(() =>
      erc1155Mintable.accessControl.renounceAdmin({
        publicAddress: '0xB3C24BB465b682225F8C87b29a031921B764Ed94',
      }),
    ).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.AccessControl_renounceAdmin,
        message: ERROR_LOG.message.contract_not_deployed_or_loaded,
      }),
    );
  });

  it('[renounceAdmin] - should return an Error because of bad address', () => {
    erc1155Mintable = new ERC1155Mintable(signer);
    const admin = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.renounceAdmin({ publicAddress: '' });
    };
    expect(admin).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.AccessControl_renounceAdmin,
        message: ERROR_LOG.message.invalid_public_address,
      }),
    );
  });

  it('[renounceAdmin] - should renounce admin', async () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    await erc1155Mintable.deploy({
      baseURI: faker.internet.url(),
      contractURI: faker.internet.url(),
      ids: [],
    });
    await erc1155Mintable.accessControl.renounceAdmin({
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
    erc1155Mintable = new ERC1155Mintable(signer);

    const renounceAdmin = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.renounceAdmin({
        publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
      });
    };
    expect(renounceAdmin).rejects.toThrow(
      '[AccessControl.renounceAdmin] An error occured | [RUNTIME.ERROR] code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[isAdmin] - should return an Error if contract is not deployed', () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    expect(() =>
      erc1155Mintable.accessControl.isAdmin({
        publicAddress: '0xB3C24BB465b682225F8C87b29a031921B764Ed94',
      }),
    ).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.AccessControl_isAdmin,
        message: ERROR_LOG.message.contract_not_deployed_or_loaded,
      }),
    );
  });

  it('[isAdmin] - should return an Error because of bad address', () => {
    erc1155Mintable = new ERC1155Mintable(signer);
    const admin = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.isAdmin({ publicAddress: '' });
    };
    expect(admin).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.AccessControl_isAdmin,
        message: ERROR_LOG.message.invalid_public_address,
      }),
    );
  });

  it('[isAdmin] - should renounce admin', async () => {
    erc1155Mintable = new ERC1155Mintable(signer);

    await erc1155Mintable.deploy({
      baseURI: faker.internet.url(),
      contractURI: faker.internet.url(),
      ids: [],
    });
    await erc1155Mintable.accessControl.isAdmin({
      publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
    });
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
    erc1155Mintable = new ERC1155Mintable(signer);

    const isAdmin = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.isAdmin({
        publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
      });
    };
    expect(isAdmin).rejects.toThrow(
      '[AccessControl.isAdmin] An error occured | [RUNTIME.ERROR] code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  describe('setRoyalties', () => {
    it('[setRoyalties] - should throw if contract not deployed', async () => {
      const contract = new ERC1155Mintable(signer);

      await expect(() =>
        contract.royalties.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 }),
      ).rejects.toThrow(
        errorLogger({
          location: ERROR_LOG.location.Royalties_setRoyalties,
          message: ERROR_LOG.message.contract_not_deployed,
        }),
      );
    });
    it('[setRoyalties] - should throw when args are missing (address)', async () => {
      const contract = new ERC1155Mintable(signer);
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });

      await expect(() =>
        contract.royalties.setRoyalties({ publicAddress: null, fee: 1 }),
      ).rejects.toThrow(
        errorLogger({
          location: ERROR_LOG.location.Royalties_setRoyalties,
          message: ERROR_LOG.message.no_address_supplied,
        }),
      );
    });
    it('[setRoyalties] - should throw when args are missing (fee)', async () => {
      const contract = new ERC1155Mintable(signer);
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });

      await expect(() =>
        contract.royalties.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: null }),
      ).rejects.toThrow(
        errorLogger({
          location: ERROR_LOG.location.Royalties_setRoyalties,
          message: ERROR_LOG.message.fee_must_be_between_0_and_10000,
        }),
      );
    });

    it('[setRoyalties] - should throw when "fee" is not a number', async () => {
      const contract = new ERC1155Mintable(signer);
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });

      await expect(() =>
        contract.royalties.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 'number' }),
      ).rejects.toThrow(
        errorLogger({
          location: ERROR_LOG.location.Royalties_setRoyalties,
          message: ERROR_LOG.message.fee_must_be_between_0_and_10000,
        }),
      );
    });

    it('[setRoyalties] - should throw when "fee" is not a number larger than 0 and less than 10000', async () => {
      const contract = new ERC1155Mintable(signer);
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });

      await expect(() =>
        contract.royalties.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 0 }),
      ).rejects.toThrow(
        errorLogger({
          location: ERROR_LOG.location.Royalties_setRoyalties,
          message: ERROR_LOG.message.fee_must_be_between_0_and_10000,
        }),
      );
    });

    it('[setRoyalties] - should set royalties', async () => {
      const contract = new ERC1155Mintable(signer);
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      contract.royalties.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });
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
      erc1155Mintable = new ERC1155Mintable(signer);

      const setRoyalties = async () => {
        await erc1155Mintable.deploy({
          baseURI: faker.internet.url(),
          contractURI: faker.internet.url(),
          ids: [],
        });
        await erc1155Mintable.royalties.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });
      };
      expect(setRoyalties).rejects.toThrow(
        '[Royalties.setRoyalties] An error occured | [RUNTIME.ERROR] code: UNKNOWN_ERROR, message: Error: test error',
      );
    });
  });

  describe('royaltyInfo', () => {
    it('[royaltyInfo] - should throw if contract not deployed', async () => {
      const contract = new ERC1155Mintable(signer);
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      contract.royalties.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() =>
        contract.royalties.royaltyInfo({ tokenId: 1, sellPrice: null }),
      ).rejects.toThrow(
        errorLogger({
          location: ERROR_LOG.location.Royalties_royaltyInfo,
          message: ERROR_LOG.message.no_sell_price_supplied,
        }),
      );
    });
    it('[royaltyInfo] - should throw when args are missing (tokenId)', async () => {
      const contract = new ERC1155Mintable(signer);
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      contract.royalties.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() =>
        contract.royalties.royaltyInfo({ tokenId: null, sellPrice: null }),
      ).rejects.toThrow(
        errorLogger({
          location: ERROR_LOG.location.Royalties_royaltyInfo,
          message: ERROR_LOG.message.no_tokenId_supplied,
        }),
      );
    });
    it('[royaltyInfo] - should throw when args are missing (sellPrice)', async () => {
      const contract = new ERC1155Mintable(signer);
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      contract.royalties.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() =>
        contract.royalties.royaltyInfo({ tokenId: 1, sellPrice: null }),
      ).rejects.toThrow(
        errorLogger({
          location: ERROR_LOG.location.Royalties_royaltyInfo,
          message: ERROR_LOG.message.no_sell_price_supplied,
        }),
      );
    });
    it('[royaltyInfo] - should not throw if TokenId is 0', async () => {
      const contract = new ERC1155Mintable(signer);
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      contract.royalties.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() =>
        contract.royalties.royaltyInfo({ tokenId: 0, sellPrice: 10 }),
      ).toBeTruthy();
    });
    it('[royaltyInfo] - should not throw if SalePrice is 0', async () => {
      const contract = new ERC1155Mintable(signer);
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      contract.royalties.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() => contract.royalties.royaltyInfo({ tokenId: 1, sellPrice: 0 })).toBeTruthy();
    });

    it('[royaltyInfo] - should return an Error if there is a network error', async () => {
      jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => ({
        deployed: () => ({
          royaltyInfo: () => {
            throw new Error('test error');
          },
        }),
      }));
      erc1155Mintable = new ERC1155Mintable(signer);

      const royaltyInfo = async () => {
        await erc1155Mintable.deploy({
          baseURI: faker.internet.url(),
          contractURI: faker.internet.url(),
          ids: [],
        });
        await erc1155Mintable.royalties.royaltyInfo({ tokenId: 1, sellPrice: 100 });
      };
      expect(royaltyInfo).rejects.toThrow(
        '[Royalties.royaltyInfo] An error occured | [RUNTIME.ERROR] code: UNKNOWN_ERROR, message: Error: test error',
      );
    });
  });
  describe('renounceOwnership', () => {
    it('[renounceOwnership] - should throw if contract not deployed', async () => {
      erc1155Mintable = new ERC1155Mintable(signer);
      const renounceOwnership = async () => ERC1155Mintable.accessControl.renounceOwnership();

      expect(renounceOwnership).rejects.toThrow(
        errorLogger({
          location: ERROR_LOG.location.AccessControl_renounceOwnership,
          message: ERROR_LOG.message.contract_not_deployed,
        }),
      );
    });

    it('[renounceOwnership] - should call renounce ownership', async () => {
      erc1155Mintable = new ERC1155Mintable(signer);

      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.renounceOwnership();

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
      erc1155Mintable = new ERC1155Mintable(signer);

      const renounceOwnership = async () => {
        await erc1155Mintable.deploy({
          baseURI: faker.internet.url(),
          contractURI: faker.internet.url(),
          ids: [],
        });
        await erc1155Mintable.accessControl.renounceOwnership();
      };
      expect(renounceOwnership).rejects.toThrow(
        '[AccessControl.renounceOwnership] An error occured | [RUNTIME.ERROR] code: UNKNOWN_ERROR, message: Error: test error',
      );
    });
  });
});
