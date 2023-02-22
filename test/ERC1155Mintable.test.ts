import { faker } from '@faker-js/faker';
import { BigNumber, Contract, ContractFactory, ethers } from 'ethers';
import { ACCOUNT_ADDRESS, ACCOUNT_ADDRESS_2, CONTRACT_ADDRESS } from './__mocks__/utils';
import ERC1155Mintable from '../src/lib/ContractTemplates/ERC1155Mintable';
import * as templateUtils from '../src/lib/ContractTemplates/utils';
import version from '../src/_version';

let erc1155Mintable: ERC1155Mintable;
let signer: Object;
const address = '0x0';

jest.mock('ethers');

describe('ERC1155Mintable SDK', () => {
  const contractFactoryMock = jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementation(
    () =>
      ({
        deployed: () => ({
          address,
          addIds: jest.fn(),
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
      } as unknown as Promise<Contract>),
  );

  jest.spyOn(ethers.utils, 'isAddress').mockImplementation(() => true);
  jest.spyOn(ethers, 'Contract').mockImplementation(() => ({} as Contract));
  jest
    .spyOn(ethers.utils, 'parseUnits')
    .mockImplementation(
      () => ({ _hex: '0x3a35294400', _isBigNumber: true } as unknown as BigNumber),
    );
  jest.spyOn(console, 'warn').mockImplementation();

  beforeAll(() => {
    signer = {
      getChainId: () => 80001,
      getTransactionCount: () => 1,
    };
  });

  afterEach(() => {
    contractFactoryMock.mockClear();
    signer = {
      getChainId: () => 80001,
      getTransactionCount: () => 1,
    };
  });

  it('should create "ERC1155Mintable" instance', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    expect(erc1155Mintable).not.toBe(null);
  });

  it('[Deploy] - should console.warn if contractURI is not a link ', async () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
    const logSpy = jest.spyOn(console, 'warn');

    await erc1155Mintable.deploy({
      baseURI: faker.internet.url(),
      contractURI: 'URI',
      ids: [],
    });

    expect(logSpy).toHaveBeenCalledWith('WARNING: The supplied ContractURI is not a link.');
    expect(logSpy).toHaveBeenCalledWith(
      'WARNING: ContractURI should be a public link to a valid JSON metadata file',
    );
  });

  it('[Deploy] - should console.warn if baseURI is not a link ', async () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
    const logSpy = jest.spyOn(console, 'warn');

    await erc1155Mintable.deploy({
      baseURI: 'URI',
      contractURI: faker.internet.url(),
      ids: [],
    });

    expect(logSpy).toHaveBeenCalledWith('WARNING: The supplied ContractURI is not a link.');
    expect(logSpy).toHaveBeenCalledWith(
      'WARNING: ContractURI should be a public link to a valid JSON metadata file',
    );
  });

  it('[Deploy] - should return an Error if contractURI is undefined', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    const contract = async () =>
      erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: '',
        ids: [],
      });

    expect(contract).rejects.toThrow(
      `No contractURI supplied. (location=\"[ERC1155Mintable.deploy]\", argument=\"contractURI\", value=\"\", code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[Deploy] - should return an Error if baseURI is undefined', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    const contract = async () => erc1155Mintable.deploy({ baseURI: '', contractURI: '', ids: [] });

    expect(contract).rejects.toThrow(
      `No baseURI supplied. (location=\"[ERC1155Mintable.deploy]\", argument=\"baseURI\", value=\"\", code=INVALID_ARGUMENT, version=${version})`,
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

    expect(contract).rejects.toThrow(
      `An Ethers error occured (location=\"[ERC1155Mintable.deploy]\", error={}, code=[NETWORK.ERROR], version=${version}`,
    );
  });

  it('[Deploy] - should return an Error if already deployed', async () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    await erc1155Mintable.deploy({
      baseURI: faker.internet.url(),
      contractURI: faker.internet.url(),
      ids: [],
    });

    const contract = async () =>
      erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });

    expect(contract).rejects.toThrow(
      `Contract already deployed. (location=\"[ERC1155Mintable.deploy]\", argument=\"contractAddress\", value=\"0x0\", code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[Deploy] - should return a contract', async () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    await erc1155Mintable.deploy({
      baseURI: faker.internet.url(),
      contractURI: faker.internet.url(),
      ids: [],
    });

    expect(ContractFactory.prototype.deploy).toHaveBeenCalledTimes(1);
  });

  it('[Deploy] - should deploy with gas passed', async () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
    const baseURI = faker.internet.url();
    const contractURI = faker.internet.url();

    await erc1155Mintable.deploy({
      baseURI,
      contractURI,
      ids: [],
      gas: '250',
    });
    const gasPrice = { _hex: '0x3a35294400', _isBigNumber: true }; // 250 in BigNumber

    expect(ContractFactory.prototype.deploy).toHaveBeenCalledTimes(1);
    expect(ContractFactory.prototype.deploy).toHaveBeenCalledWith(baseURI, contractURI, [], {
      gasPrice,
    });
  });

  it('[Deploy] - should deploy when polygon mainnet', async () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
    jest.spyOn(signer, 'getChainId' as any).mockResolvedValue(137);
    jest.spyOn(signer, 'getTransactionCount' as any).mockResolvedValue(1);
    jest.spyOn(templateUtils as any, 'default').mockResolvedValueOnce({
      nonce: 1,
      maxFeePerGas: '0.001',
      maxPriorityFeePerGas: '0.001',
      gasLimit: '6000000',
    });
    const baseURI = faker.internet.url();
    const contractURI = faker.internet.url();

    await erc1155Mintable.deploy({
      baseURI,
      contractURI,
      ids: [],
      gas: '250',
    });

    expect(ContractFactory.prototype.deploy).toHaveBeenCalledTimes(1);
  });

  it('[Deploy] - should deploy when polygon mainnet when axios failed', async () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
    jest.spyOn(signer, 'getChainId' as any).mockResolvedValue(137);
    jest.spyOn(signer, 'getTransactionCount' as any).mockResolvedValue(1);
    jest.spyOn(templateUtils as any, 'default').mockResolvedValue({
      gas: '6000000',
    });
    const baseURI = faker.internet.url();
    const contractURI = faker.internet.url();

    await erc1155Mintable.deploy({
      baseURI,
      contractURI,
      ids: [],
      gas: '250',
    });

    expect(ContractFactory.prototype.deploy).toHaveBeenCalledTimes(1);
  });

  it('[Mint] - should return an Error if contract is not deployed', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    const myNFT = async () =>
      erc1155Mintable.mint({
        to: ACCOUNT_ADDRESS,
        id: 0,
        quantity: 1,
      });
    expect(myNFT).rejects.toThrow(
      `Contract not deployed. (location=\"[ERC1155Mintable.mint]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[Mint] - should return an Error if the address is empty', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

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
      `missing argument: Invalid contract address. (location=\"[ERC1155Mintable.mint]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[Mint] - should return an Error if the quantity is less than one', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

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
      `Quantity as integer value greater than 0 required. (location=\"[ERC1155Mintable.mint]\", argument=\"quantity\", value=0, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[Mint] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(
      () =>
        ({
          deployed: () => ({
            mint: () => {
              throw new Error('test error');
            },
          }),
        } as unknown as Promise<Contract>),
    );
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

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
      `An Ethers error occured (location=\"[ERC1155Mintable.mint]\", error={}, code=[NETWORK.ERROR], version=${version})`,
    );
  });

  it('[Mint] - should mint a token', async () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

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
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    const contract = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.loadContract({ contractAddress: CONTRACT_ADDRESS });
    };
    expect(contract).rejects.toThrow(
      `Contract already deployed. (location=\"[ERC1155Mintable.loadContract]\", argument=\"contractAddress\", value=\"0x0\", code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[LoadContract] - should return an Error if the address is empty', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    const contract = async () => {
      await erc1155Mintable.loadContract({ contractAddress: '' });
    };
    expect(contract).rejects.toThrow(
      `missing argument: Invalid contract address. (location=\"[ERC1155Mintable.loadContract]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[LoadContract] - should load the contract', async () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    await erc1155Mintable.loadContract({ contractAddress: CONTRACT_ADDRESS });

    expect(ethers.Contract).toHaveBeenCalledTimes(1);
  });

  it('[LoadContract] - should return an Error if there is a network error', async () => {
    jest.spyOn(ethers, 'Contract').mockImplementationOnce(() => {
      throw new Error('test error');
    });
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    const contract = async () => {
      await erc1155Mintable.loadContract({ contractAddress: CONTRACT_ADDRESS });
    };
    expect(contract).rejects.toThrow(
      `An Ethers error occured (location=\"[ERC1155Mintable.loadContract]\", error={}, code=[NETWORK.ERROR], version=${version})`,
    );
  });

  it('[SetContractURI] - should return an Error if contract is not deployed', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    expect(() =>
      erc1155Mintable.setContractURI({
        contractURI:
          'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
      }),
    ).rejects.toThrow(
      `Contract not deployed. (location=\"[ERC1155Mintable.setContractURI]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[SetContractURI] - should console.warn if contractURI is not a link ', async () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
    const logSpy = jest.spyOn(console, 'warn').mockImplementation();

    await erc1155Mintable.deploy({
      baseURI: faker.internet.url(),
      contractURI: faker.internet.url(),
      ids: [],
    });
    await erc1155Mintable.setContractURI({ contractURI: 'URI' });

    expect(logSpy).toHaveBeenCalledWith('WARNING: The supplied ContractURI is not a link.');
    expect(logSpy).toHaveBeenCalledWith(
      'WARNING: ContractURI should be a public link to a valid JSON metadata file',
    );
  });

  it('[SetContractURI] - should return an Error if the contractURI is empty', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    const uri = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.setContractURI({ contractURI: '' });
    };
    expect(uri).rejects.toThrow(
      `missing argument: No contractURI supplied. (location=\"[ERC1155Mintable.setContractURI]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[SetContractURI] - should set the contractURI', async () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

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
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(
      () =>
        ({
          deployed: () => ({
            setContractURI: () => {
              throw new Error('test error');
            },
          }),
        } as unknown as Promise<Contract>),
    );
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

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
      `An Ethers error occured (location=\"[ERC1155Mintable.setContractURI]\", error={}, code=[NETWORK.ERROR], version=${version})`,
    );
  });

  it('[SetContractURI] - should return an Error if there is runtime error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(
      () =>
        ({
          deployed: () => ({
            setContractURI: () => {
              throw new Error('runtime exception');
            },
          }),
        } as unknown as Promise<Contract>),
    );
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

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
      `An Ethers error occured (location=\"[ERC1155Mintable.setContractURI]\", error={}, code=[NETWORK.ERROR], version=${version})`,
    );
  });

  it('[addMinter] - should return an Error if contract is not deployed', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    const minter = async () =>
      erc1155Mintable.accessControl.addMinter({ publicAddress: ACCOUNT_ADDRESS });
    expect(minter).rejects.toThrow(
      `Contract not deployed. (location=\"[HasAccessControl.addMinter]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[addMinter] - should return an Error if the address is empty', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    const minter = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.addMinter({ publicAddress: '' });
    };
    expect(minter).rejects.toThrow(
      `missing argument: Invalid public address. (location=\"[HasAccessControl.addMinter]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[addMinter] - should add minter role to an address', async () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    await erc1155Mintable.deploy({
      baseURI: faker.internet.url(),
      contractURI: faker.internet.url(),
      ids: [],
    });
    await erc1155Mintable.accessControl.addMinter({ publicAddress: ACCOUNT_ADDRESS });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[addMinter] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(
      () =>
        ({
          deployed: () => ({
            grantRole: () => {
              throw new Error('test error');
            },
          }),
        } as unknown as Promise<Contract>),
    );
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    const addMinter = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.addMinter({ publicAddress: ACCOUNT_ADDRESS });
    };
    expect(addMinter).rejects.toThrow(
      `An Ethers error occured (location=\"[HasAccessControl.addMinter]\", error={}, code=[NETWORK.ERROR], version=${version})`,
    );
  });

  it('[removeMinter] - should return an Error if contract is not deployed', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    const minter = async () =>
      erc1155Mintable.accessControl.removeMinter({ publicAddress: ACCOUNT_ADDRESS });
    expect(minter).rejects.toThrow(
      `Contract not deployed. (location=\"[HasAccessControl.removeMinter]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[removeMinter] - should return an Error if the address is empty', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    const minter = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.removeMinter({ publicAddress: '' });
    };
    expect(minter).rejects.toThrow(
      `missing argument: Invalid public address. (location=\"[HasAccessControl.removeMinter]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[removeMinter] - should remove minter role to an address', async () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    await erc1155Mintable.deploy({
      baseURI: faker.internet.url(),
      contractURI: faker.internet.url(),
      ids: [],
    });
    await erc1155Mintable.accessControl.removeMinter({ publicAddress: ACCOUNT_ADDRESS });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[renounceMinter] - should return an Error if contract is not deployed', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    const minter = async () =>
      erc1155Mintable.accessControl.renounceMinter({ publicAddress: ACCOUNT_ADDRESS });
    expect(minter).rejects.toThrow(
      `Contract not deployed. (location=\"[HasAccessControl.renounceMinter]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[renounceMinter] - should return an Error if the address is empty', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    const minter = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.renounceMinter({ publicAddress: '' });
    };
    expect(minter).rejects.toThrow(
      `missing argument: Invalid public address. (location=\"[HasAccessControl.renounceMinter]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[renounceMinter] - should renounce minter role for an address', async () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    await erc1155Mintable.deploy({
      baseURI: faker.internet.url(),
      contractURI: faker.internet.url(),
      ids: [],
    });
    await erc1155Mintable.accessControl.renounceMinter({ publicAddress: ACCOUNT_ADDRESS });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[renounceMinter] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(
      () =>
        ({
          deployed: () => ({
            address,
            renounceRole: () => {
              throw new Error('test error');
            },
          }),
        } as unknown as Promise<Contract>),
    );
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    const renounceMinter = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.renounceMinter({ publicAddress: ACCOUNT_ADDRESS });
    };
    expect(renounceMinter).rejects.toThrow(
      `An Ethers error occured (location=\"[HasAccessControl.renounceMinter]\", error={}, code=[NETWORK.ERROR], version=${version})`,
    );
  });

  it('[isMinter] - should return an Error if contract is not deployed', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    const minter = async () =>
      erc1155Mintable.accessControl.isMinter({ publicAddress: ACCOUNT_ADDRESS });
    expect(minter).rejects.toThrow(
      `Contract not deployed. (location=\"[HasAccessControl.isMinter]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[isMinter] - should return an Error if the address is empty', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    const minter = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.isMinter({ publicAddress: '' });
    };
    expect(minter).rejects.toThrow(
      `missing argument: Invalid public address. (location=\"[HasAccessControl.isMinter]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[isMinter] - should check if an address has minter role', async () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    await erc1155Mintable.deploy({
      baseURI: faker.internet.url(),
      contractURI: faker.internet.url(),
      ids: [],
    });
    await erc1155Mintable.accessControl.isMinter({ publicAddress: ACCOUNT_ADDRESS });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[isMinter] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(
      () =>
        ({
          deployed: () => ({
            hasRole: () => {
              throw new Error('test error');
            },
          }),
        } as unknown as Promise<Contract>),
    );
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    const isMinter = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.isMinter({ publicAddress: ACCOUNT_ADDRESS });
    };
    expect(isMinter).rejects.toThrow(
      `An Ethers error occured (location=\"[HasAccessControl.isMinter]\", error={}, code=[NETWORK.ERROR], version=${version})`,
    );
  });

  it('[SetApprovalForAll] - should return an Error if contract is not deployed', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    expect(() =>
      erc1155Mintable.setApprovalForAll({ to: ACCOUNT_ADDRESS, approvalStatus: true }),
    ).rejects.toThrow(
      `Contract not deployed. (location=\"[ERC1155Mintable.setApprovalForAll]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[SetApprovalForAll] - should return an Error if the address is empty', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    const approval = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.setApprovalForAll({ to: '', approvalStatus: true });
    };
    expect(approval).rejects.toThrow(
      `missing argument: Invalid \"to\" address. (location=\"[ERC1155Mintable.setApprovalForAll]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[SetApprovalForAll] - should set approval for all when all params are correct', async () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    const approval = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.setApprovalForAll({ to: ACCOUNT_ADDRESS, approvalStatus: true });
    };

    expect(approval).not.toThrow();
    expect(await contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[SetApprovalForAll] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(
      () =>
        ({
          deployed: () => ({
            setApprovalForAll: () => {
              throw new Error('test error');
            },
          }),
        } as unknown as Promise<Contract>),
    );
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    const setApprovalForAll = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.setApprovalForAll({ to: ACCOUNT_ADDRESS, approvalStatus: true });
    };
    expect(setApprovalForAll).rejects.toThrow(
      `An Ethers error occured (location=\"[ERC1155Mintable.setApprovalForAll]\", error={}, code=[NETWORK.ERROR], version=${version})`,
    );
  });

  it('[addAdmin] - should return an Error if contract is not deployed', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    expect(() =>
      erc1155Mintable.accessControl.addAdmin({
        publicAddress: '0xB3C24BB465b682225F8C87b29a031921B764Ed94',
      }),
    ).rejects.toThrow(
      `Contract not deployed. (location=\"[HasAccessControl.addAdmin]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[addAdmin] - should return an Error because of bad address', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
    const admin = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.addAdmin({ publicAddress: '' });
    };
    expect(admin).rejects.toThrow(
      `missing argument: Invalid public address. (location=\"[HasAccessControl.addAdmin]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[addAdmin] - should add admin', async () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

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
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(
      () =>
        ({
          deployed: () => ({
            grantRole: () => {
              throw new Error('test error');
            },
          }),
        } as unknown as Promise<Contract>),
    );
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

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
      `An Ethers error occured (location=\"[HasAccessControl.addAdmin]\", error={}, code=[NETWORK.ERROR], version=${version})`,
    );
  });

  it('[removeAdmin] - should return an Error if contract is not deployed', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    expect(() =>
      erc1155Mintable.accessControl.removeAdmin({
        publicAddress: '0xB3C24BB465b682225F8C87b29a031921B764Ed94',
      }),
    ).rejects.toThrow(
      `Contract not deployed. (location=\"[HasAccessControl.removeAdmin]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[removeAdmin] - should return an Error because of bad address', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
    const admin = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.removeAdmin({ publicAddress: '' });
    };
    expect(admin).rejects.toThrow(
      `missing argument: Invalid public address. (location=\"[HasAccessControl.removeAdmin]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[removeAdmin] - should remove admin', async () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

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
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(
      () =>
        ({
          deployed: () => ({
            revokeRole: () => {
              throw new Error('test error');
            },
          }),
        } as unknown as Promise<Contract>),
    );
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

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
      `An Ethers error occured (location=\"[HasAccessControl.removeAdmin]\", error={}, code=[NETWORK.ERROR], version=${version})`,
    );
  });

  it('[renounceAdmin] - should return an Error if contract is not deployed', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    expect(() =>
      erc1155Mintable.accessControl.renounceAdmin({
        publicAddress: '0xB3C24BB465b682225F8C87b29a031921B764Ed94',
      }),
    ).rejects.toThrow(
      `Contract not deployed. (location=\"[HasAccessControl.renounceAdmin]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[renounceAdmin] - should return an Error because of bad address', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
    const admin = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.renounceAdmin({ publicAddress: '' });
    };
    expect(admin).rejects.toThrow(
      `missing argument: Invalid public address. (location=\"[HasAccessControl.renounceAdmin]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[renounceAdmin] - should renounce admin', async () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

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
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(
      () =>
        ({
          deployed: () => ({
            renounceRole: () => {
              throw new Error('test error');
            },
          }),
        } as unknown as Promise<Contract>),
    );
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

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
      `An Ethers error occured (location=\"[HasAccessControl.renounceAdmin]\", error={}, code=[NETWORK.ERROR], version=${version})`,
    );
  });

  it('[isAdmin] - should return an Error if contract is not deployed', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

    expect(() =>
      erc1155Mintable.accessControl.isAdmin({
        publicAddress: '0xB3C24BB465b682225F8C87b29a031921B764Ed94',
      }),
    ).rejects.toThrow(
      `Contract not deployed. (location=\"[HasAccessControl.isAdmin]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[isAdmin] - should return an Error because of bad address', () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
    const admin = async () => {
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.isAdmin({ publicAddress: '' });
    };
    expect(admin).rejects.toThrow(
      `missing argument: Invalid public address. (location=\"[HasAccessControl.isAdmin]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[isAdmin] - should renounce admin', async () => {
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

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
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(
      () =>
        ({
          deployed: () => ({
            hasRole: () => {
              throw new Error('test error');
            },
          }),
        } as unknown as Promise<Contract>),
    );
    erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

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
      `An Ethers error occured (location=\"[HasAccessControl.isAdmin]\", error={}, code=[NETWORK.ERROR], version=${version})`,
    );
  });

  describe('setRoyalties', () => {
    it('[setRoyalties] - should throw if contract not deployed', async () => {
      const contract = new ERC1155Mintable(signer as unknown as ethers.Wallet);

      await expect(() =>
        contract.royalty.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 }),
      ).rejects.toThrow(
        `Contract not deployed. (location=\"[HasRoyalty.setRoyalties]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
      );
    });
    it('[setRoyalties] - should throw when args are missing (address)', async () => {
      const erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });

      await expect(() =>
        erc1155Mintable.royalty.setRoyalties({ publicAddress: '', fee: 1 }),
      ).rejects.toThrow(
        `missing argument: Invalid public address. (location=\"[HasRoyalty.setRoyalties]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });
    it('[setRoyalties] - should throw when args are missing (fee)', async () => {
      const erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });

      await expect(() =>
        erc1155Mintable.royalty.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: -1 }),
      ).rejects.toThrow(
        `Fee must be between 0 and 10000. (location=\"[HasRoyalty.setRoyalties]\", argument=\"fee\", value=-1, code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('[setRoyalties] - should throw when "fee" is not a number larger than 0 and less than 10000', async () => {
      const erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });

      await expect(() =>
        erc1155Mintable.royalty.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 0 }),
      ).rejects.toThrow(
        `Fee must be between 0 and 10000. (location=\"[HasRoyalty.setRoyalties]\", argument=\"fee\", value=0, code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('[setRoyalties] - should set royalties', async () => {
      const erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      erc1155Mintable.royalty.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });
      await expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });

    it('[setRoyalties] - should return an Error if there is a network error', async () => {
      jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(
        () =>
          ({
            deployed: () => ({
              setRoyalties: () => {
                throw new Error('test error');
              },
            }),
          } as unknown as Promise<Contract>),
      );
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

      const setRoyalties = async () => {
        await erc1155Mintable.deploy({
          baseURI: faker.internet.url(),
          contractURI: faker.internet.url(),
          ids: [],
        });
        await erc1155Mintable.royalty.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });
      };
      expect(setRoyalties).rejects.toThrow(
        `An Ethers error occured (location=\"[HasRoyalty.setRoyalties]\", error={}, code=[NETWORK.ERROR], version=${version})`,
      );
    });
  });

  describe('royaltyInfo', () => {
    it('[royaltyInfo] - should throw if contract not deployed', async () => {
      const erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

      await expect(() =>
        erc1155Mintable.royalty.royaltyInfo({ tokenId: 1, sellPrice: 1 }),
      ).rejects.toThrow(
        `Contract not deployed. (location=\"[HasRoyalty.royaltyInfo]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('[royaltyInfo] - should throw if sellPrice is not valid', async () => {
      const erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      erc1155Mintable.royalty.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() =>
        erc1155Mintable.royalty.royaltyInfo({ tokenId: 1, sellPrice: -1 }),
      ).rejects.toThrow(
        `missing argument: No sell price supplied or not valid. (location=\"[HasRoyalty.royaltyInfo]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });
    it('[royaltyInfo] - should throw when args are missing (tokenId)', async () => {
      const erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      erc1155Mintable.royalty.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() =>
        erc1155Mintable.royalty.royaltyInfo({ tokenId: -1, sellPrice: 1 }),
      ).rejects.toThrow(
        `missing argument: No tokenId supplied or tokenID is invalid. (location=\"[HasRoyalty.royaltyInfo]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });
    it('[royaltyInfo] - should throw when args are missing (sellPrice)', async () => {
      const erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      erc1155Mintable.royalty.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() =>
        erc1155Mintable.royalty.royaltyInfo({ tokenId: 1, sellPrice: -1 }),
      ).rejects.toThrow(
        `missing argument: No sell price supplied or not valid. (location=\"[HasRoyalty.royaltyInfo]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });
    it('[royaltyInfo] - should not throw if TokenId is 0', async () => {
      const erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      erc1155Mintable.royalty.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() =>
        erc1155Mintable.royalty.royaltyInfo({ tokenId: 0, sellPrice: 10 }),
      ).toBeTruthy();
    });
    it('[royaltyInfo] - should not throw if SalePrice is 0', async () => {
      const erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      erc1155Mintable.royalty.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() =>
        erc1155Mintable.royalty.royaltyInfo({ tokenId: 1, sellPrice: 0 }),
      ).toBeTruthy();
    });

    it('[royaltyInfo] - should return an Error if there is a network error', async () => {
      jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(
        () =>
          ({
            deployed: () => ({
              royaltyInfo: () => {
                throw new Error('test error');
              },
            }),
          } as unknown as Promise<Contract>),
      );
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

      const royaltyInfo = async () => {
        await erc1155Mintable.deploy({
          baseURI: faker.internet.url(),
          contractURI: faker.internet.url(),
          ids: [],
        });
        await erc1155Mintable.royalty.royaltyInfo({ tokenId: 1, sellPrice: 100 });
      };
      expect(royaltyInfo).rejects.toThrow(
        `n Ethers error occured (location=\"[HasRoyalty.royaltyInfo]\", error={}, code=[NETWORK.ERROR], version=${version})`,
      );
    });
    //   });
    // describe('renounceOwnership', () => {
    it('[renounceOwnership] - should throw if contract not deployed', async () => {
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      const renounceOwnership = async () => erc1155Mintable.accessControl.renounceOwnership({});

      expect(renounceOwnership).rejects.toThrow(
        `Contract not deployed. (location=\"[HasAccessControl.renounceOwnership]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('[renounceOwnership] - should call renounce ownership', async () => {
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.accessControl.renounceOwnership({});

      expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });

    it('[renounceOwnership] - should return an Error if there is a network error', async () => {
      jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(
        () =>
          ({
            deployed: () => ({
              renounceOwnership: () => {
                throw new Error('test error');
              },
            }),
          } as unknown as Promise<Contract>),
      );
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

      const renounceOwnership = async () => {
        await erc1155Mintable.deploy({
          baseURI: faker.internet.url(),
          contractURI: faker.internet.url(),
          ids: [],
        });
        await erc1155Mintable.accessControl.renounceOwnership({});
      };
      expect(renounceOwnership).rejects.toThrow(
        `An Ethers error occured (location=\"[HasAccessControl.renounceOwnership]\", error={}, code=[NETWORK.ERROR], version=${version})`,
      );
    });
  });

  describe('setBaseURI', () => {
    it('[SetBaseURI] - should return an Error if contract is not deployed', () => {
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

      expect(() =>
        erc1155Mintable.setBaseURI({
          baseURI:
            'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
        }),
      ).rejects.toThrow(
        `Contract not deployed. (location=\"[ERC1155Mintable.setBaseURI]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('[SetBaseURI] - should return an Error if the baseURI is empty', () => {
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

      const uri = async () => {
        await erc1155Mintable.deploy({
          baseURI: faker.internet.url(),
          contractURI: faker.internet.url(),
          ids: [],
        });
        await erc1155Mintable.setBaseURI({ baseURI: '' });
      };
      expect(uri).rejects.toThrow(
        `missing argument: Invalid baseURI. (location=\"[ERC1155Mintable.setBaseURI]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('[SetBaseURI] - should set the baseURI', async () => {
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.setBaseURI({
        baseURI:
          'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
      });

      expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('mintBatch', () => {
    it('[Mint] - should return an Error if contract is not deployed', () => {
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

      const myNFT = async () =>
        erc1155Mintable.mintBatch({
          to: ACCOUNT_ADDRESS,
          ids: [0],
          quantities: [1],
        });
      expect(myNFT).rejects.toThrow(
        `Contract not deployed. (location=\"[ERC1155Mintable.mintBatch]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('[mintBatch] - should return an Error if the address is empty', () => {
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

      const myNFT = async () => {
        await erc1155Mintable.deploy({
          baseURI: faker.internet.url(),
          contractURI: faker.internet.url(),
          ids: [],
        });
        await erc1155Mintable.mintBatch({
          to: '',
          ids: [0],
          quantities: [1],
        });
      };
      expect(myNFT).rejects.toThrow(
        `missing argument: Invalid contract address. (location=\"[ERC1155Mintable.mintBatch]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('[mintBatch] - should return an Error if ids and quantities arrays have different sizes', () => {
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

      const myNFT = async () => {
        await erc1155Mintable.deploy({
          baseURI: faker.internet.url(),
          contractURI: faker.internet.url(),
          ids: [],
        });
        await erc1155Mintable.mintBatch({
          to: '0xE26a682fa90322eC48eB9F3FA66E8961D799177C',
          ids: [0, 1],
          quantities: [1],
        });
      };
      expect(myNFT).rejects.toThrow(
        `IDs and quantities arrays must be of same length (location=\"[ERC1155Mintable.mintBatch]\", argument=\"ids\", value=[0,1], code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('[MmintBatchint] - should return an Error if any quantity is less than one', () => {
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

      const myNFT = async () => {
        await erc1155Mintable.deploy({
          baseURI: faker.internet.url(),
          contractURI: faker.internet.url(),
          ids: [],
        });
        await erc1155Mintable.mintBatch({
          to: '0xE26a682fa90322eC48eB9F3FA66E8961D799177C',
          ids: [0, 1],
          quantities: [1, 0],
        });
      };
      expect(myNFT).rejects.toThrow(
        `Quantity as integer value greater than 0 required. (location=\"[ERC1155Mintable.mintBatch]\", argument=\"quantity\", value=0, code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('[mintBatch] - should return an Error if there is a network error', async () => {
      jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(
        () =>
          ({
            deployed: () => ({
              mintBatch: () => {
                throw new Error('test error');
              },
            }),
          } as unknown as Promise<Contract>),
      );
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

      const myNFT = async () => {
        await erc1155Mintable.deploy({
          baseURI: faker.internet.url(),
          contractURI: faker.internet.url(),
          ids: [],
        });
        await erc1155Mintable.mintBatch({
          to: ACCOUNT_ADDRESS,
          ids: [0, 1],
          quantities: [1, 1],
        });
      };
      expect(myNFT).rejects.toThrow(
        `An Ethers error occured (location=\"[ERC1155Mintable.mintBatch]\", error={}, code=[NETWORK.ERROR], version=${version})`,
      );
    });

    it('[mintBatch] - should mint a token', async () => {
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);

      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.mintBatch({
        to: ACCOUNT_ADDRESS,
        ids: [0, 1],
        quantities: [1, 1],
      });

      expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('addIds', () => {
    it('[addIds] - should return an Error if contract is not deployed', () => {
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      const myNFT = async () =>
        erc1155Mintable.addIds({
          ids: [0],
        });
      expect(myNFT).rejects.toThrow(
        `Contract not deployed. (location=\"[ERC1155Mintable.addIds]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
      );
    });
    it('[addIds] - should return an Error if the ids array is empty', () => {
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      const myNFT = async () => {
        await erc1155Mintable.deploy({
          baseURI: faker.internet.url(),
          contractURI: faker.internet.url(),
          ids: [],
        });
        await erc1155Mintable.addIds({
          ids: [],
        });
      };
      expect(myNFT).rejects.toThrow(
        `List of IDs provided cannot be empty (location=\"[ERC1155Mintable.addIds]\", argument=\"ids\", value=[], code=INVALID_ARGUMENT, version=${version})`,
      );
    });
    it('[addIds] - should return an Error if there is a network error', async () => {
      jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(
        () =>
          ({
            deployed: () => ({
              addIds: () => {
                throw new Error('test error');
              },
            }),
          } as unknown as Promise<Contract>),
      );
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      const myNFT = async () => {
        await erc1155Mintable.deploy({
          baseURI: faker.internet.url(),
          contractURI: faker.internet.url(),
          ids: [],
        });
        await erc1155Mintable.addIds({
          ids: [0, 1],
        });
      };
      expect(myNFT).rejects.toThrow(
        `An Ethers error occured (location=\"[ERC1155Mintable.addIds]\", error={}, code=[NETWORK.ERROR], version=${version})`,
      );
    });
  });

  describe('Transfers', () => {
    it('[Transfer] - should return an Error if contract is not deployed', () => {
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      const transferNft = async () =>
        erc1155Mintable.transfer({
          from: ACCOUNT_ADDRESS,
          to: ACCOUNT_ADDRESS_2,
          tokenId: 1,
          quantity: 1,
        });
      expect(transferNft).rejects.toThrow(
        `Contract not deployed. (location=\"[ERC1155Mintable.transfer]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
      );
    });
    it('[Transfer] - should return an Error if there is a network error', async () => {
      jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(
        () =>
          ({
            address,
            deployed: () => ({
              safeTransferFrom: () => {
                throw new Error('test error');
              },
            }),
          } as unknown as Promise<Contract>),
      );
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      const transferNft = async () => {
        await erc1155Mintable.deploy({
          baseURI: faker.internet.url(),
          contractURI: faker.internet.url(),
          ids: [],
        });
        await erc1155Mintable.transfer({
          from: ACCOUNT_ADDRESS,
          to: ACCOUNT_ADDRESS_2,
          tokenId: 1,
          quantity: 1,
        });
      };
      expect(transferNft).rejects.toThrow(
        `An Ethers error occured (location=\"[ERC1155Mintable.transfer]\", error={}, code=[NETWORK.ERROR], version=${version})`,
      );
    });
    it('[Transfer] - should return an Error if from address is not valid', () => {
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      const transferNft = async () => {
        await erc1155Mintable.deploy({
          baseURI: faker.internet.url(),
          contractURI: faker.internet.url(),
          ids: [],
        });
        await erc1155Mintable.transfer({
          from: '',
          to: ACCOUNT_ADDRESS_2,
          tokenId: 1,
          quantity: 1,
        });
      };
      expect(transferNft).rejects.toThrow(
        `missing argument: Invalid \"from\" address. (location=\"[ERC1155Mintable.transfer]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });
    it('[Transfer] - should return an Error if to address is not valid', () => {
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      const transferNft = async () => {
        await erc1155Mintable.deploy({
          baseURI: faker.internet.url(),
          contractURI: faker.internet.url(),
          ids: [],
        });
        await erc1155Mintable.transfer({
          from: ACCOUNT_ADDRESS,
          to: '',
          tokenId: 1,
          quantity: 1,
        });
      };
      expect(transferNft).rejects.toThrow(
        `missing argument: Invalid \"to\" address. (location=\"[ERC1155Mintable.transfer]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });
    it('[Transfer] - should return an Error if to tokenID is not valid', () => {
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      const transferNft = async () => {
        await erc1155Mintable.deploy({
          baseURI: faker.internet.url(),
          contractURI: faker.internet.url(),
          ids: [],
        });
        await erc1155Mintable.transfer({
          from: ACCOUNT_ADDRESS,
          to: ACCOUNT_ADDRESS_2,
          tokenId: -1,
          quantity: 1,
        });
      };
      expect(transferNft).rejects.toThrow(
        `TokenId must be integer. (location=\"[ERC1155Mintable.transfer]\", argument=\"tokenId\", value=-1, code=INVALID_ARGUMENT, version=${version})`,
      );
    });
    it('[Transfer] - should transfer nft', async () => {
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.transfer({
        from: ACCOUNT_ADDRESS,
        to: ACCOUNT_ADDRESS_2,
        tokenId: 1,
        quantity: 1,
      });
      expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('BatchTransfers', () => {
    it('[BatchTransfer] - should return an Error if contract is not deployed', () => {
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      const transferNft = async () =>
        erc1155Mintable.transferBatch({
          from: ACCOUNT_ADDRESS,
          to: ACCOUNT_ADDRESS_2,
          tokenIds: [1],
          quantities: [1],
        });
      expect(transferNft).rejects.toThrow(
        `Contract not deployed. (location=\"[ERC1155Mintable.transferBatch]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
      );
    });
    it('[BatchTransfer] - should return an Error if there is a network error', async () => {
      jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(
        () =>
          ({
            address,
            deployed: () => ({
              safeBatchTransferFrom: () => {
                throw new Error('test error');
              },
            }),
          } as unknown as Promise<Contract>),
      );
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      const transferNft = async () => {
        await erc1155Mintable.deploy({
          baseURI: faker.internet.url(),
          contractURI: faker.internet.url(),
          ids: [],
        });
        await erc1155Mintable.transferBatch({
          from: ACCOUNT_ADDRESS,
          to: ACCOUNT_ADDRESS_2,
          tokenIds: [1],
          quantities: [1],
        });
      };
      expect(transferNft).rejects.toThrow(
        `An Ethers error occured (location=\"[ERC1155Mintable.transferBatch]\", error={}, code=[NETWORK.ERROR], version=${version})`,
      );
    });
    it('[BatchTransfer] - should return an Error if from address is not valid', () => {
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      const transferNft = async () => {
        await erc1155Mintable.deploy({
          baseURI: faker.internet.url(),
          contractURI: faker.internet.url(),
          ids: [],
        });
        await erc1155Mintable.transferBatch({
          from: '',
          to: ACCOUNT_ADDRESS_2,
          tokenIds: [1],
          quantities: [1],
        });
      };
      expect(transferNft).rejects.toThrow(
        `missing argument: Invalid \"from\" address. (location=\"[ERC1155Mintable.transferBatch]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });
    it('[BatchTransfer] - should return an Error if to address is not valid', () => {
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      const transferNft = async () => {
        await erc1155Mintable.deploy({
          baseURI: faker.internet.url(),
          contractURI: faker.internet.url(),
          ids: [],
        });
        await erc1155Mintable.transferBatch({
          from: ACCOUNT_ADDRESS,
          to: '',
          tokenIds: [1],
          quantities: [1],
        });
      };
      expect(transferNft).rejects.toThrow(
        `missing argument: Invalid \"to\" address. (location=\"[ERC1155Mintable.transferBatch]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('[BatchTransfer] - should transfer nft', async () => {
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      await erc1155Mintable.deploy({
        baseURI: faker.internet.url(),
        contractURI: faker.internet.url(),
        ids: [],
      });
      await erc1155Mintable.transferBatch({
        from: ACCOUNT_ADDRESS,
        to: ACCOUNT_ADDRESS_2,
        tokenIds: [1],
        quantities: [1],
      });
      expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });
    it('[BatchTransfer] - should throw error because of different array lengths', async () => {
      erc1155Mintable = new ERC1155Mintable(signer as unknown as ethers.Wallet);
      const transferNft = async () => {
        await erc1155Mintable.deploy({
          baseURI: faker.internet.url(),
          contractURI: faker.internet.url(),
          ids: [],
        });
        await erc1155Mintable.transferBatch({
          from: ACCOUNT_ADDRESS,
          to: ACCOUNT_ADDRESS_2,
          tokenIds: [0, 1],
          quantities: [1],
        });
      };
      expect(transferNft).rejects.toThrow(
        `IDs and quantities arrays must be of same length (location=\"[ERC1155Mintable.transferBatch]\", argument=\"tokenIds\", value=[0,1], code=INVALID_ARGUMENT, version=${version})`,
      );
    });
  });
});
