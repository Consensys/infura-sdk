import { ContractFactory, ethers } from 'ethers';

import ERC721UserMintable from '../src/lib/ContractTemplates/ERC721UserMintable';
import { ACCOUNT_ADDRESS, CONTRACT_ADDRESS, ACCOUNT_ADDRESS_2 } from './__mocks__/utils';
import { errorLogger, ERROR_LOG } from '../src/lib/error/handler.js';

let eRC721UserMintable;
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
        'safeTransferFrom(address,address,uint256)': jest.fn(),
        setBaseURI: jest.fn(),
        setContractURI: jest.fn(),
        setApprovalForAll: jest.fn(),
        approve: jest.fn(),
        grantRole: jest.fn(),
        hasRole: jest.fn(),
        renounceRole: jest.fn(),
        revokeRole: jest.fn(),
        setRoyalties: jest.fn(),
        royaltyInfo: jest.fn(),
        renounceOwnership: jest.fn(),
        reveal: jest.fn(),
        reserve: jest.fn(),
        toggleSale: jest.fn(),
        price: jest.fn(),
        setPrice: jest.fn(),
        withdraw: jest.fn(),
      }),
    }));

  jest.spyOn(ethers.utils, 'isAddress').mockImplementation(() => true);
  jest.spyOn(ethers, 'Contract').mockImplementation(() => ({}));
  jest.spyOn(ethers.utils, 'parseEther').mockImplementation(() => 1000000000000000000);
  jest.spyOn(ethers.utils, 'formatEther').mockImplementation(() => 1);
  jest
    .spyOn(ethers.utils, 'parseUnits')
    .mockImplementation(() => ({ _hex: '0x3a35294400', _isBigNumber: true }));

  beforeAll(() => {
    signer = 'signer';
  });

  afterEach(() => {
    contractFactoryMock.mockClear();
  });

  it('should create "ERC721UserMintable" instance', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    expect(eRC721UserMintable).not.toBe(null);
  });

  it('[Deploy] - should return an Error if signer not defined ', () => {
    eRC721UserMintable = new ERC721UserMintable(null);

    const contract = async () =>
      eRC721UserMintable.deploy({ name: 'name', symbol: 'symbol', baseURI: 'URI' });

    expect(contract).rejects.toThrow('[ERC721UserMintable.deploy] No signer instance supplied.');
  });

  it('[Deploy] - should return an Error if Name is empty', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const contract = async () =>
      eRC721UserMintable.deploy({ name: '', symbol: 'symbol', baseURI: 'URI' });

    expect(contract).rejects.toThrow('[ERC721UserMintable.deploy] No name supplied');
  });

  it('[Deploy] - should return an Error if symbol is undefined', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const contract = async () => eRC721UserMintable.deploy({ name: 'name', baseURI: 'URI' });

    expect(contract).rejects.toThrow('[ERC721UserMintable.deploy] No symbol supplied.');
  });

  it('[Deploy] - should return an Error if baseURI is undefined', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const contract = async () => eRC721UserMintable.deploy({ name: 'name', symbol: 'symbol' });

    expect(contract).rejects.toThrow('[ERC721UserMintable.deploy] No baseURI supplied.');
  });

  it('[Deploy] - should return an Error if contractURI is undefined', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const contract = async () =>
      eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
      });

    expect(contract).rejects.toThrow('[ERC721UserMintable.deploy] No contractURI supplied.');
  });

  it('[Deploy] - should return an Error if maxSupply is undefined', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const contract = async () =>
      eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: '',
      });

    expect(contract).rejects.toThrow('[ERC721UserMintable.deploy] Invalid maximum supply.');
  });

  it('[Deploy] - should return an Error if price is undefined', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const contract = async () =>
      eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: '',
        maxSupply: 10,
      });

    expect(contract).rejects.toThrow('[ERC721UserMintable.deploy] Invalid price');
  });

  it('[Deploy] - should return an Error if maxSupply is undefined', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const contract = async () =>
      eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: '',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
      });

    expect(contract).rejects.toThrow('[ERC721UserMintable.deploy] Invalid maximum token request.');
  });

  it('[Deploy] - should return a contract', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      contractURI: 'contractURI',
      maxSupply: 10,
      price: ethers.utils.parseEther(1),
      maxTokenRequest: 1,
    });

    expect(ContractFactory.prototype.deploy).toHaveBeenCalledTimes(1);
  });

  it('[Deploy] - should deploy with gas passed', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      contractURI: 'contractURI',
      maxSupply: 10,
      price: ethers.utils.parseEther(1),
      maxTokenRequest: 1,
      gas: 250,
    });
    const gasPrice = { _hex: '0x3a35294400', _isBigNumber: true }; // 250 in BigNumber

    expect(ContractFactory.prototype.deploy).toHaveBeenCalledTimes(1);
    expect(ContractFactory.prototype.deploy).toHaveBeenCalledWith(
      'name',
      'symbol',
      'URI',
      'contractURI',
      10,
      ethers.utils.parseEther(1),
      1,
      {
        gasPrice,
      },
    );
  });

  it('[Mint] - should return an Error if contract is not deployed', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const myNFT = async () =>
      eRC721UserMintable.mint({
        quantity: 1,
        value: 100,
      });
    expect(myNFT).rejects.toThrow('[ERC721UserMintable.mint] Contract not deployed or loaded.');
  });

  it('[Mint] - should return an Error if the quantity is 0', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const myNFT = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.mint({
        quantity: 0,
        value: 100,
      });
    };
    expect(myNFT).rejects.toThrow(
      '[ERC721UserMintable.mint] Quantity as integer value greater than 0 required.',
    );
  });

  it('[Mint] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => ({
      deployed: () => ({
        address,
        mint: () => {
          throw new Error('test error');
        },
      }),
    }));
    eRC721UserMintable = new ERC721UserMintable(signer);

    const myNFT = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.mint({
        quantity: 1,
        value: 100,
      });
    };
    expect(myNFT).rejects.toThrow(
      '[ERC721UserMintable.mint] An error occured | [RUNTIME.ERROR] code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[Mint] - should mint a token', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      contractURI: 'contractURI',
      maxSupply: 10,
      price: ethers.utils.parseEther(1),
      maxTokenRequest: 1,
    });
    await eRC721UserMintable.mint({
      quantity: 1,
      value: 100,
    });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[LoadContract] - should return an Error if contract is already deployed', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const contract = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.loadContract({ contractAddress: CONTRACT_ADDRESS });
    };
    expect(contract).rejects.toThrow('[ERC721UserMintable.loadContract] Contract already loaded.');
  });

  it('[LoadContract] - should return an Error if the address is empty', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const contract = async () => {
      await eRC721UserMintable.loadContract({ contractAddress: '' });
    };
    expect(contract).rejects.toThrow('[ERC721UserMintable.loadContract] Invalid contract address.');
  });

  it('[LoadContract] - should return an Error if there is a network error', async () => {
    jest.spyOn(ethers, 'Contract').mockImplementationOnce(() => {
      throw new Error('test error');
    });
    eRC721UserMintable = new ERC721UserMintable(signer);

    const contract = async () => {
      await eRC721UserMintable.loadContract({ contractAddress: CONTRACT_ADDRESS });
    };
    expect(contract).rejects.toThrow(
      '[ERC721UserMintable.loadContract] An error occured | [RUNTIME.ERROR] code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[LoadContract] - should load the contract', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    await eRC721UserMintable.loadContract({ contractAddress: CONTRACT_ADDRESS });

    expect(ethers.Contract).toHaveBeenCalledTimes(2);
  });

  it('[Transfer] - should return an Error if contract is not deployed', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const transferNft = async () =>
      eRC721UserMintable.transfer({ from: ACCOUNT_ADDRESS, to: ACCOUNT_ADDRESS_2, tokenId: 1 });
    expect(transferNft).rejects.toThrow('[BaseERC721.transfer] Contract not deployed or loaded.');
  });

  it('[Transfer] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => ({
      address,
      deployed: () => ({
        'safeTransferFrom(address,address,uint256)': () => {
          throw new Error('test error');
        },
      }),
    }));
    eRC721UserMintable = new ERC721UserMintable(signer);

    const transferNft = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.transfer({
        from: ACCOUNT_ADDRESS,
        to: ACCOUNT_ADDRESS_2,
        tokenId: 1,
      });
    };
    expect(transferNft).rejects.toThrow(
      '[BaseERC721.transfer] An error occured | [RUNTIME.ERROR] code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[Transfer] - should return an Error if from address is not valid', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const transferNft = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.transfer({
        from: '',
        to: ACCOUNT_ADDRESS_2,
        tokenId: 1,
      });
    };
    expect(transferNft).rejects.toThrow('[BaseERC721.transfer] Invalid from address.');
  });

  it('[Transfer] - should return an Error if to address is not valid', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const transferNft = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.transfer({
        from: ACCOUNT_ADDRESS,
        to: '',
        tokenId: 1,
      });
    };
    expect(transferNft).rejects.toThrow('[BaseERC721.transfer] Invalid to address.');
  });

  it('[Transfer] - should return an Error if to tokenID is not valid', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const transferNft = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.transfer({
        from: ACCOUNT_ADDRESS,
        to: ACCOUNT_ADDRESS_2,
        tokenId: 'test',
      });
    };
    expect(transferNft).rejects.toThrow('[BaseERC721.transfer] TokenId must be integer.');
  });

  it('[Transfer] - should transfer nft', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      contractURI: 'contractURI',
      maxSupply: 10,
      price: ethers.utils.parseEther(1),
      maxTokenRequest: 1,
    });
    await eRC721UserMintable.transfer({
      from: ACCOUNT_ADDRESS,
      to: ACCOUNT_ADDRESS_2,
      tokenId: 1,
    });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[SetBaseURI] - should return an Error if contract is not deployed', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    expect(() =>
      eRC721UserMintable.setBaseURI({
        baseURI:
          'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
      }),
    ).rejects.toThrow('[ERC721UserMintable.setBaseURI] Contract not deployed or loaded.');
  });

  it('[SetBaseURI] - should return an Error if the baseURI is empty', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const uri = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.setBaseURI({ baseURI: '' });
    };
    expect(uri).rejects.toThrow('[ERC721UserMintable.setBaseURI] Invalid baseURI.');
  });

  it('[SetBaseURI] - should set the BASEuri', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      contractURI: 'contractURI',
      maxSupply: 10,
      price: ethers.utils.parseEther(1),
      maxTokenRequest: 1,
    });
    await eRC721UserMintable.setBaseURI({
      baseURI: 'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
    });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[SetApprovalForAll] - should return an Error if contract is not deployed', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    expect(() =>
      eRC721UserMintable.setApprovalForAll({ to: ACCOUNT_ADDRESS, approvalStatus: true }),
    ).rejects.toThrow('[BaseERC721.setApprovalForAll] Contract not deployed or loaded.');
  });

  it('[SetApprovalForAll] - should return an Error if the address is empty', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const approval = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.setApprovalForAll({ to: '', approvalStatus: true });
    };
    expect(approval).rejects.toThrow('[BaseERC721.setApprovalForAll] No to address.');
  });

  it('[SetApprovalForAll] - should return an Error if the approvalStatus is not a boolean', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const approval = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.setApprovalForAll({ to: ACCOUNT_ADDRESS, approvalStatus: '' });
    };
    expect(approval).rejects.toThrow(
      '[BaseERC721.setApprovalForAll] approvalStatus must be boolean.',
    );
  });

  it('[SetApprovalForAll] - should set approval for all when all params are correct', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const approval = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.setApprovalForAll({ to: ACCOUNT_ADDRESS, approvalStatus: true });
    };

    expect(approval).not.toThrow();
    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[ApproveTransfer] - should return an Error if contract is not deployed', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const approveTransfer = async () =>
      eRC721UserMintable.approveTransfer({ to: ACCOUNT_ADDRESS_2, tokenId: 1 });
    expect(approveTransfer).rejects.toThrow(
      '[BaseERC721.approveTransfer] Contract not deployed or loaded.',
    );
  });

  it('[ApproveTransfer] - should return an Error if to address is not valid', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const approveTransfer = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.approveTransfer({ to: '', tokenId: 1 });
    };

    expect(approveTransfer).rejects.toThrow('[BaseERC721.approveTransfer] Invalid to address.');
  });

  it('[ApproveTransfer] - should return an Error if tokenId is not valid', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const approveTransfer = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.approveTransfer({ to: ACCOUNT_ADDRESS, tokenId: '' });
    };

    expect(approveTransfer).rejects.toThrow(
      '[BaseERC721.approveTransfer] TokenId must be integer.',
    );
  });

  it('[ApproveTransfer] - should approve transfer nft', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      contractURI: 'contractURI',
      maxSupply: 10,
      price: ethers.utils.parseEther(1),
      maxTokenRequest: 1,
    });
    await eRC721UserMintable.approveTransfer({ to: ACCOUNT_ADDRESS, tokenId: 1 });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[addAdmin] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => ({
      address,
      deployed: () => ({
        address,
        grantRole: () => {
          throw new Error('test error');
        },
      }),
    }));
    eRC721UserMintable = new ERC721UserMintable(signer);

    const addAdmin = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.accessControl.addAdmin({ publicAddress: ACCOUNT_ADDRESS });
    };
    expect(addAdmin).rejects.toThrow(
      '[AccessControl.addAdmin] An error occured | [RUNTIME.ERROR] code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[addAdmin] - should add admin', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      contractURI: 'contractURI',
      maxSupply: 10,
      price: ethers.utils.parseEther(1),
      maxTokenRequest: 1,
    });

    await eRC721UserMintable.accessControl.addAdmin({
      publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
    });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[removeAdmin] - should return an Error if contract is not deployed', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    expect(() =>
      eRC721UserMintable.accessControl.removeAdmin({
        publicAddress: '0xB3C24BB465b682225F8C87b29a031921B764Ed94',
      }),
    ).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.AccessControl_removeAdmin,
        message: ERROR_LOG.message.contract_not_deployed_or_loaded,
      }),
    );
  });

  it('[removeAdmin] - should return an Error because of bad address', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const admin = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });

      await eRC721UserMintable.accessControl.removeAdmin({ publicAddress: '' });
    };

    expect(admin).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.AccessControl_removeAdmin,
        message: ERROR_LOG.message.invalid_public_address,
      }),
    );
  });

  it('[removeAdmin] - should remove admin', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      contractURI: 'contractURI',
      maxSupply: 10,
      price: ethers.utils.parseEther(1),
      maxTokenRequest: 1,
    });
    await eRC721UserMintable.accessControl.removeAdmin({
      publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
    });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[removeAdmin] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => ({
      address,
      deployed: () => ({
        address,
        revokeRole: () => {
          throw new Error('test error');
        },
      }),
    }));
    eRC721UserMintable = new ERC721UserMintable(signer);

    const removeAdmin = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });

      await eRC721UserMintable.accessControl.removeAdmin({
        publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
      });
    };
    expect(removeAdmin).rejects.toThrow(
      '[AccessControl.removeAdmin] An error occured | [RUNTIME.ERROR] code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[renounceAdmin] - should return an Error if contract is not deployed', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    expect(() =>
      eRC721UserMintable.accessControl.renounceAdmin({
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
    eRC721UserMintable = new ERC721UserMintable(signer);
    const admin = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.accessControl.renounceAdmin({ publicAddress: '' });
    };
    expect(admin).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.AccessControl_renounceAdmin,
        message: ERROR_LOG.message.invalid_public_address,
      }),
    );
  });

  it('[renounceAdmin] - should renounce admin', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer);
    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      contractURI: 'contractURI',
      maxSupply: 10,
      price: ethers.utils.parseEther(1),
      maxTokenRequest: 1,
    });
    await eRC721UserMintable.accessControl.renounceAdmin({
      publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
    });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[renounceAdmin] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => ({
      address,
      deployed: () => ({
        renounceRole: () => {
          throw new Error('test error');
        },
      }),
    }));
    eRC721UserMintable = new ERC721UserMintable(signer);
    const renounceAdmin = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });

      await eRC721UserMintable.accessControl.renounceAdmin({
        publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
      });
    };
    expect(renounceAdmin).rejects.toThrow(
      '[AccessControl.renounceAdmin] An error occured | [RUNTIME.ERROR] code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  it('[isAdmin] - should return an Error if contract is not deployed', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    expect(() =>
      eRC721UserMintable.accessControl.isAdmin({
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
    eRC721UserMintable = new ERC721UserMintable(signer);
    const admin = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.accessControl.isAdmin({ publicAddress: '' });
    };
    expect(admin).rejects.toThrow(
      errorLogger({
        location: ERROR_LOG.location.AccessControl_isAdmin,
        message: ERROR_LOG.message.invalid_public_address,
      }),
    );
  });

  it('[isAdmin] - should renounce admin', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer);
    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      contractURI: 'contractURI',
      maxSupply: 10,
      price: ethers.utils.parseEther(1),
      maxTokenRequest: 1,
    });
    await eRC721UserMintable.accessControl.isAdmin({
      publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
    });
    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[isAdmin] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(() => ({
      address,
      deployed: () => ({
        hasRole: () => {
          throw new Error('test error');
        },
      }),
    }));
    eRC721UserMintable = new ERC721UserMintable(signer);
    const isAdmin = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });

      await eRC721UserMintable.accessControl.isAdmin({
        publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
      });
    };
    expect(isAdmin).rejects.toThrow(
      '[AccessControl.isAdmin] An error occured | [RUNTIME.ERROR] code: UNKNOWN_ERROR, message: Error: test error',
    );
  });

  describe('setRoyalties', () => {
    it('[setRoyalties] - should throw if contract not deployed', async () => {
      const contract = new ERC721UserMintable(signer);

      await expect(() =>
        contract.royalties.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 }),
      ).rejects.toThrow('[Royalties.setRoyalties] Contract not deployed.');
    });

    it('[setRoyalties] - should throw when args are missing (address)', async () => {
      const eRC721UserMintable = new ERC721UserMintable(signer);
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });

      await expect(() =>
        eRC721UserMintable.royalties.setRoyalties({ publicAddress: null, fee: 1 }),
      ).rejects.toThrow('[Royalties.setRoyalties] No address supplied.');
    });

    it('[setRoyalties] - should throw when args are missing (fee)', async () => {
      const contract = new ERC721UserMintable(signer);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });

      await expect(() =>
        contract.royalties.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: null }),
      ).rejects.toThrow('[Royalties.setRoyalties] Fee must be between 0 and 10000.');
    });

    it('[setRoyalties] - should throw when "fee" is not a number', async () => {
      const contract = new ERC721UserMintable(signer);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });

      await expect(() =>
        contract.royalties.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 'number' }),
      ).rejects.toThrow('[Royalties.setRoyalties] Fee must be between 0 and 10000.');
    });

    it('[setRoyalties] - should throw when "fee" is not a number larger than 0 and less than 10000', async () => {
      const contract = new ERC721UserMintable(signer);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });

      await expect(() =>
        contract.royalties.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 0 }),
      ).rejects.toThrow('[Royalties.setRoyalties] Fee must be between 0 and 10000.');
    });

    it('[setRoyalties] - should set royalties', async () => {
      const contract = new ERC721UserMintable(signer);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      contract.royalties.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });
      await expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });
  });

  it('[price] - should return mint price per token', async () => {
    const contract = new ERC721UserMintable(signer);
    await contract.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      contractURI: 'contractURI',
      maxSupply: 10,
      price: ethers.utils.parseEther(1),
      maxTokenRequest: 1,
    });
    const price = contract.price();
    await expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  describe('royaltyInfo', () => {
    it('[royaltyInfo] - should throw if contract not deployed', async () => {
      const contract = new ERC721UserMintable(signer);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      contract.royalties.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() =>
        contract.royalties.royaltyInfo({ tokenId: 1, sellPrice: null }),
      ).rejects.toThrow('[Royalties.royaltyInfo] No sell price supplied.');
    });

    it('[royaltyInfo] - should throw when args are missing (tokenId)', async () => {
      const contract = new ERC721UserMintable(signer);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      contract.royalties.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() =>
        contract.royalties.royaltyInfo({ tokenId: null, sellPrice: null }),
      ).rejects.toThrow('[Royalties.royaltyInfo] No tokenId supplied.');
    });

    it('[royaltyInfo] - should throw when args are missing (sellPrice)', async () => {
      const contract = new ERC721UserMintable(signer);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      contract.royalties.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() =>
        contract.royalties.royaltyInfo({ tokenId: 1, sellPrice: null }),
      ).rejects.toThrow('[Royalties.royaltyInfo] No sell price supplied.');
    });

    it('[royaltyInfo] - should not throw if TokenId is 0', async () => {
      const contract = new ERC721UserMintable(signer);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      contract.royalties.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() =>
        contract.royalties.royaltyInfo({ tokenId: 0, sellPrice: 10 }),
      ).toBeTruthy();
    });

    it('[royaltyInfo] - should not throw if SalePrice is 0', async () => {
      const contract = new ERC721UserMintable(signer);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      contract.royalties.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() => contract.royalties.royaltyInfo({ tokenId: 1, sellPrice: 0 })).toBeTruthy();
    });
  });

  describe('renounceOwnership', () => {
    it('[renounceOwnership] - should throw if contract not deployed', async () => {
      eRC721UserMintable = new ERC721UserMintable(signer);
      const renounceOwnership = async () => eRC721UserMintable.accessControl.renounceOwnership();

      expect(renounceOwnership).rejects.toThrow(
        '[AccessControl.renounceOwnership] Contract not deployed.',
      );
    });

    it('[renounceOwnership] - should call renounce ownership', async () => {
      eRC721UserMintable = new ERC721UserMintable(signer);

      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.accessControl.renounceOwnership();

      expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('reserve', () => {
    it('[reserve] - should return an Error if contract is not deployed', () => {
      eRC721UserMintable = new ERC721UserMintable(signer);

      const reserve = async () =>
        eRC721UserMintable.reserve({
          quantity: 1,
        });
      expect(reserve).rejects.toThrow(
        '[ERC721UserMintable.reserve] Contract not deployed or loaded.',
      );
    });
    it('[reserve] - should throw error because of invalid quantity', async () => {
      const contract = new ERC721UserMintable(signer);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      const reserve = async () =>
        contract.reserve({
          quantity: 0,
        });
      expect(reserve).rejects.toThrow(
        '[ERC721UserMintable.reserve] Quantity as integer value greater than 0 required.',
      );
    });

    it('[reserve] - should reserve a token', async () => {
      eRC721UserMintable = new ERC721UserMintable(signer);

      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.reserve({
        quantity: 1,
      });

      expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('reveal', () => {
    it('[reveal] - should return an Error if contract is not deployed', () => {
      eRC721UserMintable = new ERC721UserMintable(signer);

      const reveal = async () =>
        eRC721UserMintable.reveal({
          baseURI: 'URI',
        });
      expect(reveal).rejects.toThrow(
        '[ERC721UserMintable.reveal] Contract not deployed or loaded.',
      );
    });
    it('[reveal] - should throw error because of invalid URI', async () => {
      const contract = new ERC721UserMintable(signer);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      const reveal = async () =>
        contract.reveal({
          baseURI: '',
        });
      expect(reveal).rejects.toThrow('[ERC721UserMintable.reveal] Invalid baseURI.');
    });

    it('[reveal] - should reveal the contract', async () => {
      eRC721UserMintable = new ERC721UserMintable(signer);

      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.reveal({
        baseURI: 'URI',
      });

      expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('setPrice', () => {
    it('[setPrice] - should return an Error if contract is not deployed', () => {
      eRC721UserMintable = new ERC721UserMintable(signer);

      const setPrice = async () =>
        eRC721UserMintable.setPrice({
          price: ethers.utils.parseEther(1),
        });
      expect(setPrice).rejects.toThrow('[ERC721UserMintable.setPrice] Contract not deployed.');
    });
    it('[setPrice] - should throw error because of invalid price', async () => {
      const contract = new ERC721UserMintable(signer);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      const setPrice = async () =>
        contract.setPrice({
          price: undefined,
        });
      expect(setPrice).rejects.toThrow('[ERC721UserMintable.setPrice] Invalid price');
    });

    it('[setPrice] - should setPrice of the mint per token', async () => {
      eRC721UserMintable = new ERC721UserMintable(signer);

      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.setPrice({
        price: ethers.utils.parseEther(1),
      });

      expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('toggleSale', () => {
    it('[toggleSale] - should return an Error if contract is not deployed', () => {
      eRC721UserMintable = new ERC721UserMintable(signer);

      const toggleSale = async () => eRC721UserMintable.toggleSale();
      expect(toggleSale).rejects.toThrow('[ERC721UserMintable.toggleSale] Contract not deployed.');
    });

    it('[toggleSale] - should toggleSale of the mint per token', async () => {
      eRC721UserMintable = new ERC721UserMintable(signer);

      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.toggleSale();

      expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('withdraw', () => {
    it('[withdraw] - should return an Error if contract is not deployed', () => {
      eRC721UserMintable = new ERC721UserMintable(signer);

      const withdraw = async () => eRC721UserMintable.withdraw();
      expect(withdraw).rejects.toThrow('[ERC721UserMintable.withdraw] Contract not deployed.');
    });

    it('[withdraw] - should toggleSale of the mint per token', async () => {
      eRC721UserMintable = new ERC721UserMintable(signer);

      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.withdraw();

      expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('setContractURI', () => {
    it('[SetContractURI] - should return an Error if contract is not deployed', () => {
      eRC721UserMintable = new ERC721UserMintable(signer);

      expect(() =>
        eRC721UserMintable.setContractURI({
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
      eRC721UserMintable = new ERC721UserMintable(signer);
      const logSpy = jest.spyOn(console, 'warn');

      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.setContractURI({ contractURI: 'URI' });

      expect(logSpy).toHaveBeenCalledWith('WARNING: The ContractURI "URI" is not a link.');
      expect(logSpy).toHaveBeenCalledWith(
        'WARNING: ContractURI should be a public link to a valid JSON metadata file',
      );
    });

    it('[SetContractURI] - should return an Error if the contractURI is empty', () => {
      eRC721UserMintable = new ERC721UserMintable(signer);

      const uri = async () => {
        await eRC721UserMintable.deploy({
          name: 'name',
          symbol: 'symbol',
          baseURI: 'URI',
          contractURI: 'contractURI',
          maxSupply: 10,
          price: ethers.utils.parseEther(1),
          maxTokenRequest: 1,
        });
        await eRC721UserMintable.setContractURI({ contractURI: '' });
      };
      expect(uri).rejects.toThrow(
        errorLogger({
          location: ERROR_LOG.location.BaseERC721_setContractURI,
          message: ERROR_LOG.message.invalid_contractURI,
        }),
      );
    });

    it('[SetContractURI] - should set the contractURI', async () => {
      eRC721UserMintable = new ERC721UserMintable(signer);

      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.setContractURI({
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
      eRC721UserMintable = new ERC721UserMintable(signer);

      const setContractURI = async () => {
        await eRC721UserMintable.deploy({
          name: 'name',
          symbol: 'symbol',
          baseURI: 'URI',
          contractURI: 'contractURI',
          maxSupply: 10,
          price: ethers.utils.parseEther(1),
          maxTokenRequest: 1,
        });
        await eRC721UserMintable.setContractURI({
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
      eRC721UserMintable = new ERC721UserMintable(signer);

      const setContractURI = async () => {
        await eRC721UserMintable.deploy({
          name: 'name',
          symbol: 'symbol',
          baseURI: 'URI',
          contractURI: 'contractURI',
          maxSupply: 10,
          price: ethers.utils.parseEther(1),
          maxTokenRequest: 1,
        });
        await eRC721UserMintable.setContractURI({
          contractURI:
            'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
        });
      };
      expect(setContractURI).rejects.toThrow(
        '[BaseERC721.setContractURI] An error occured | [RUNTIME.ERROR] code: UNKNOWN_ERROR, message: ReferenceError: RuntimeException is not defined',
      );
    });
  });
});
