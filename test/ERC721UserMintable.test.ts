import { faker } from '@faker-js/faker';
import { BigNumber, Contract, ContractFactory, ethers, utils } from 'ethers';

import ERC721UserMintable from '../src/lib/ContractTemplates/ERC721UserMintable';
import version from '../src/_version';
import { ACCOUNT_ADDRESS, CONTRACT_ADDRESS, ACCOUNT_ADDRESS_2 } from './__mocks__/utils';

let eRC721UserMintable: ERC721UserMintable;
let signer: Object;
const address = '0x0';

jest.mock('ethers');

describe('SDK', () => {
  const contractFactoryMock = jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementation(
    () =>
      ({
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
          signer: {
            getChainId: () => 80001,
          },
        }),
      } as unknown as Promise<Contract>),
  );

  jest.spyOn(ethers.utils, 'isAddress').mockImplementation(() => true);
  jest.spyOn(ethers, 'Contract').mockImplementation(() => ({} as Contract));
  jest
    .spyOn(ethers.utils, 'parseEther')
    .mockImplementation(() => 1000000000000000000 as unknown as BigNumber);
  jest.spyOn(ethers.utils, 'formatEther').mockImplementation(() => '1');
  jest
    .spyOn(ethers.utils, 'parseUnits')
    .mockImplementation(
      () => ({ _hex: '0x3a35294400', _isBigNumber: true } as unknown as BigNumber),
    );
  jest.spyOn(console, 'warn').mockImplementation();

  beforeAll(() => {
    signer = {
      getChainId: () => 80001,
    };
  });

  afterEach(() => {
    contractFactoryMock.mockClear();
    signer = {
      getChainId: () => 80001,
    };
  });

  it('should create "ERC721UserMintable" instance', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    expect(eRC721UserMintable).not.toBe(null);
  });

  it('[Deploy] - should return an Error if Name is empty', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const contract = async () =>
      eRC721UserMintable.deploy({
        name: '',
        symbol: 'PYMC',
        contractURI: faker.internet.url(),
        baseURI: faker.internet.url(),
        maxSupply: 10,
        price: '0.00001',
        maxTokenRequest: 1,
      });

    expect(contract).rejects.toThrow(
      `No name supplied. (location="[ERC721UserMintable.deploy]", argument="name", value="", code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[Deploy] - should return an Error if symbol is undefined', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const contract = async () =>
      eRC721UserMintable.deploy({
        name: 'test',
        symbol: '',
        contractURI: faker.internet.url(),
        baseURI: faker.internet.url(),
        maxSupply: 10,
        price: '0.00001',
        maxTokenRequest: 1,
      });

    expect(contract).rejects.toThrow(
      `No symbol supplied. (location=\"[ERC721UserMintable.deploy]\", argument=\"symbol\", value=\"\", code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[Deploy] - should return an Error if baseURI is undefined', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const contract = async () =>
      eRC721UserMintable.deploy({
        name: 'test',
        symbol: 'test',
        contractURI: faker.internet.url(),
        baseURI: '',
        maxSupply: 10,
        price: '0.00001',
        maxTokenRequest: 1,
      });

    expect(contract).rejects.toThrow(
      `No baseURI supplied. (location=\"[ERC721UserMintable.deploy]\", argument=\"baseURI\", value=\"\", code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[Deploy] - should return an Error if contractURI is undefined', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const contract = async () =>
      eRC721UserMintable.deploy({
        name: 'test',
        symbol: 'test',
        contractURI: '',
        baseURI: faker.internet.url(),
        maxSupply: 10,
        price: '0.00001',
        maxTokenRequest: 1,
      });

    expect(contract).rejects.toThrow(
      `Invalid contractURI. (location="[ERC721UserMintable.deploy]", argument="contractURI", value="", code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[Deploy] - should return an Error if maxSupply is undefined', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const contract = async () =>
      eRC721UserMintable.deploy({
        name: 'test',
        symbol: 'test',
        contractURI: faker.internet.url(),
        baseURI: faker.internet.url(),
        maxSupply: 0,
        price: '0.00001',
        maxTokenRequest: 1,
      });

    expect(contract).rejects.toThrow(
      `Invalid maximum supply. (location=\"[ERC721UserMintable.deploy]\", argument=\"maxSupply\", value=0, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[Deploy] - should return an Error if price is negatif', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const contract = async () =>
      eRC721UserMintable.deploy({
        name: 'test',
        symbol: 'test',
        contractURI: faker.internet.url(),
        baseURI: faker.internet.url(),
        maxSupply: 1,
        price: '-1',
        maxTokenRequest: 1,
      });

    expect(contract).rejects.toThrow(
      `Invalid price (location="[ERC721UserMintable.deploy]", argument="price", value="-1", code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[Deploy] - should return an Error if price is invalid', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const contract = async () =>
      eRC721UserMintable.deploy({
        name: 'test',
        symbol: 'test',
        contractURI: faker.internet.url(),
        baseURI: faker.internet.url(),
        maxSupply: 1,
        price: 'test',
        maxTokenRequest: 1,
      });

    expect(contract).rejects.toThrow(
      `Invalid price (location="[ERC721UserMintable.deploy]", argument="price", value="test", code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[Deploy] - should return a contract', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      contractURI: 'contractURI',
      maxSupply: 10,
      price: '1',
      maxTokenRequest: 1,
    });

    expect(ContractFactory.prototype.deploy).toHaveBeenCalledTimes(1);
  });

  it('[Deploy] - should deploy with gas passed', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      contractURI: 'contractURI',
      maxSupply: 10,
      price: '1',
      maxTokenRequest: 1,
      gas: '250',
    });
    const gasPrice = { _hex: '0x3a35294400', _isBigNumber: true }; // 250 in BigNumber

    expect(ContractFactory.prototype.deploy).toHaveBeenCalledTimes(1);
    expect(ContractFactory.prototype.deploy).toHaveBeenCalledWith(
      'name',
      'symbol',
      'URI',
      'contractURI',
      10,
      utils.parseEther('1'),
      1,
      {
        gasPrice,
      },
    );
  });

  it('[Deploy] - should deploy when polygon mainnet', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);
    signer = {
      getChainId: () => 137,
    };
    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      contractURI: 'contractURI',
      maxSupply: 10,
      price: '1',
      maxTokenRequest: 1,
      gas: '250',
    });

    expect(ContractFactory.prototype.deploy).toHaveBeenCalledTimes(1);
  });

  it('[Mint] - should return an Error if contract is not deployed', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const myNFT = async () =>
      eRC721UserMintable.mint({
        quantity: 1,
        cost: '100',
      });
    expect(myNFT).rejects.toThrow(
      `Contract not deployed. (location=\"[ERC721UserMintable.mint]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[Mint] - should return an Error if the quantity is 0', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const myNFT = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.mint({
        quantity: 0,
        cost: '100',
      });
    };
    expect(myNFT).rejects.toThrow(
      `Quantity as integer value greater than 0 required. (location="[ERC721UserMintable.mint]", argument="quantity", value=0, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[Mint] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(
      () =>
        ({
          deployed: () =>
            ({
              address,
              mint: () => {
                throw new Error('test error');
              },
            } as unknown as Promise<Contract>),
        } as unknown as Promise<Contract>),
    );
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const myNFT = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.mint({
        quantity: 1,
        cost: '100',
      });
    };
    expect(myNFT).rejects.toThrow(
      `An Ethers error occured (location=\"[ERC721UserMintable.mint]\", error={}, code=[NETWORK.ERROR], version=${version})`,
    );
  });

  it('[Mint] - should mint a token', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      contractURI: 'contractURI',
      maxSupply: 10,
      price: '1',
      maxTokenRequest: 1,
    });
    await eRC721UserMintable.mint({
      quantity: 1,
      cost: '100',
    });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[LoadContract] - should return an Error if contract is already deployed', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const contract = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.loadContract({ contractAddress: CONTRACT_ADDRESS });
    };
    expect(contract).rejects.toThrow(
      `Contract already loaded. (location=\"[ERC721UserMintable.loadContract]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[LoadContract] - should return an Error if the address is empty', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const contract = async () => {
      await eRC721UserMintable.loadContract({ contractAddress: '' });
    };
    expect(contract).rejects.toThrow(
      `missing argument: Invalid contract address. (location=\"[ERC721UserMintable.loadContract]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[LoadContract] - should return an Error if there is a network error', async () => {
    jest.spyOn(ethers, 'Contract').mockImplementationOnce(() => {
      throw new Error('test error');
    });
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const contract = async () => {
      await eRC721UserMintable.loadContract({ contractAddress: CONTRACT_ADDRESS });
    };
    expect(contract).rejects.toThrow(
      `An Ethers error occured (location="[ERC721UserMintable.loadContract]", error={}, code=[NETWORK.ERROR], version=${version})`,
    );
  });

  it('[LoadContract] - should load the contract', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    await eRC721UserMintable.loadContract({ contractAddress: CONTRACT_ADDRESS });

    expect(ethers.Contract).toHaveBeenCalledTimes(2);
  });

  it('[Transfer] - should return an Error if contract is not deployed', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const transferNft = async () =>
      eRC721UserMintable.baseERC721.transfer({
        from: ACCOUNT_ADDRESS,
        to: ACCOUNT_ADDRESS_2,
        tokenId: 1,
      });
    expect(transferNft).rejects.toThrow(
      `Contract not deployed. (location=\"[BaseERC721.transfer]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[Transfer] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(
      () =>
        ({
          address,
          deployed: () => ({
            'safeTransferFrom(address,address,uint256)': () => {
              throw new Error('test error');
            },
          }),
        } as unknown as Promise<Contract>),
    );
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const transferNft = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.baseERC721.transfer({
        from: ACCOUNT_ADDRESS,
        to: ACCOUNT_ADDRESS_2,
        tokenId: 1,
      });
    };
    expect(transferNft).rejects.toThrow(
      `An Ethers error occured (location=\"[BaseERC721.transfer]\", error={}, code=[NETWORK.ERROR], version=${version})`,
    );
  });

  it('[Transfer] - should return an Error if from address is not valid', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const transferNft = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.baseERC721.transfer({
        from: '',
        to: ACCOUNT_ADDRESS_2,
        tokenId: 1,
      });
    };
    expect(transferNft).rejects.toThrow(
      `missing argument: Invalid \"from\" address. (location=\"[BaseERC721.transfer]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[Transfer] - should return an Error if to address is not valid', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const transferNft = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.baseERC721.transfer({
        from: ACCOUNT_ADDRESS,
        to: '',
        tokenId: 1,
      });
    };
    expect(transferNft).rejects.toThrow(
      `missing argument: Invalid \"to\" address. (location=\"[BaseERC721.transfer]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[Transfer] - should return an Error if to tokenID is not valid', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const transferNft = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.baseERC721.transfer({
        from: ACCOUNT_ADDRESS,
        to: ACCOUNT_ADDRESS_2,
        tokenId: -1,
      });
    };
    expect(transferNft).rejects.toThrow(
      `TokenId must be integer. (location=\"[BaseERC721.transfer]\", argument=\"tokenId\", value=-1, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[Transfer] - should transfer nft', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      contractURI: 'contractURI',
      maxSupply: 10,
      price: '1',
      maxTokenRequest: 1,
    });
    await eRC721UserMintable.baseERC721.transfer({
      from: ACCOUNT_ADDRESS,
      to: ACCOUNT_ADDRESS_2,
      tokenId: 1,
    });

    expect(await contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[SetBaseURI] - should return an Error if contract is not deployed', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    expect(() =>
      eRC721UserMintable.setBaseURI({
        baseURI:
          'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
      }),
    ).rejects.toThrow(
      `Contract not deployed. (location=\"[ERC721UserMintable.setBaseURI]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[SetBaseURI] - should return an Error if the baseURI is empty', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const uri = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.setBaseURI({ baseURI: '' });
    };
    expect(uri).rejects.toThrow(
      `missing argument: Invalid baseURI. (location=\"[ERC721UserMintable.setBaseURI]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[SetBaseURI] - should set the BASEuri', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      contractURI: 'contractURI',
      maxSupply: 10,
      price: '1',
      maxTokenRequest: 1,
    });
    await eRC721UserMintable.setBaseURI({
      baseURI: 'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
    });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[SetApprovalForAll] - should return an Error if contract is not deployed', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    expect(() =>
      eRC721UserMintable.baseERC721.setApprovalForAll({
        to: ACCOUNT_ADDRESS,
        approvalStatus: true,
      }),
    ).rejects.toThrow(
      `Contract not deployed. (location=\"[BaseERC721.setApprovalForAll]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[SetApprovalForAll] - should return an Error if the address is empty', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const approval = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.baseERC721.setApprovalForAll({ to: '', approvalStatus: true });
    };
    expect(approval).rejects.toThrow(
      `missing argument: Invalid \"to\" address. (location=\"[BaseERC721.setApprovalForAll]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[SetApprovalForAll] - should set approval for all when all params are correct', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const approval = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.baseERC721.setApprovalForAll({
        to: ACCOUNT_ADDRESS,
        approvalStatus: true,
      });
    };

    expect(approval).not.toThrow();
    expect(await contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[ApproveTransfer] - should return an Error if contract is not deployed', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const approveTransfer = async () =>
      eRC721UserMintable.baseERC721.approveTransfer({ to: ACCOUNT_ADDRESS_2, tokenId: 1 });
    expect(approveTransfer).rejects.toThrow(
      `Contract not deployed. (location="[BaseERC721.approveTransfer]", argument="contractAddress", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[ApproveTransfer] - should return an Error if to address is not valid', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const approveTransfer = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.baseERC721.approveTransfer({ to: '', tokenId: 1 });
    };

    expect(approveTransfer).rejects.toThrow(
      `missing argument: Invalid \"to\" address. (location=\"[BaseERC721.approveTransfer]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[ApproveTransfer] - should return an Error if tokenId is not valid', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const approveTransfer = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.baseERC721.approveTransfer({ to: ACCOUNT_ADDRESS, tokenId: -1 });
    };

    expect(approveTransfer).rejects.toThrow(
      `TokenId must be integer. (location="[BaseERC721.approveTransfer]", argument="tokenId", value=-1, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[ApproveTransfer] - should approve transfer nft', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      contractURI: 'contractURI',
      maxSupply: 10,
      price: '1',
      maxTokenRequest: 1,
    });
    await eRC721UserMintable.baseERC721.approveTransfer({ to: ACCOUNT_ADDRESS, tokenId: 1 });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[addAdmin] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(
      () =>
        ({
          address,
          deployed: () => ({
            address,
            grantRole: () => {
              throw new Error('test error');
            },
          }),
        } as unknown as Promise<Contract>),
    );
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const addAdmin = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.accessControl.addAdmin({ publicAddress: ACCOUNT_ADDRESS });
    };
    expect(addAdmin).rejects.toThrow(
      `An Ethers error occured (location=\"[HasAccessControl.addAdmin]\", error={}, code=[NETWORK.ERROR], version=${version})`,
    );
  });

  it('[addAdmin] - should add admin', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      contractURI: 'contractURI',
      maxSupply: 10,
      price: '1',
      maxTokenRequest: 1,
    });

    await eRC721UserMintable.accessControl.addAdmin({
      publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
    });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[removeAdmin] - should return an Error if contract is not deployed', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    expect(() =>
      eRC721UserMintable.accessControl.removeAdmin({
        publicAddress: '0xB3C24BB465b682225F8C87b29a031921B764Ed94',
      }),
    ).rejects.toThrow(
      `Contract not deployed. (location=\"[HasAccessControl.removeAdmin]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[removeAdmin] - should return an Error because of bad address', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const admin = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });

      await eRC721UserMintable.accessControl.removeAdmin({ publicAddress: '' });
    };

    expect(admin).rejects.toThrow(
      `missing argument: Invalid public address. (location=\"[HasAccessControl.removeAdmin]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[removeAdmin] - should remove admin', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      contractURI: 'contractURI',
      maxSupply: 10,
      price: '1',
      maxTokenRequest: 1,
    });
    await eRC721UserMintable.accessControl.removeAdmin({
      publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
    });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[removeAdmin] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(
      () =>
        ({
          address,
          deployed: () => ({
            address,
            revokeRole: () => {
              throw new Error('test error');
            },
          }),
        } as unknown as Promise<Contract>),
    );
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    const removeAdmin = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });

      await eRC721UserMintable.accessControl.removeAdmin({
        publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
      });
    };
    expect(removeAdmin).rejects.toThrow(
      `An Ethers error occured (location="[HasAccessControl.removeAdmin]", error={}, code=[NETWORK.ERROR], version=${version})`,
    );
  });

  it('[renounceAdmin] - should return an Error if contract is not deployed', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    expect(() =>
      eRC721UserMintable.accessControl.renounceAdmin({
        publicAddress: '0xB3C24BB465b682225F8C87b29a031921B764Ed94',
      }),
    ).rejects.toThrow(
      `Contract not deployed. (location=\"[HasAccessControl.renounceAdmin]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[renounceAdmin] - should return an Error because of bad address', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);
    const admin = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.accessControl.renounceAdmin({ publicAddress: '' });
    };
    expect(admin).rejects.toThrow(
      `missing argument: Invalid public address. (location=\"[HasAccessControl.renounceAdmin]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[renounceAdmin] - should renounce admin', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);
    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      contractURI: 'contractURI',
      maxSupply: 10,
      price: '1',
      maxTokenRequest: 1,
    });
    await eRC721UserMintable.accessControl.renounceAdmin({
      publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
    });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[renounceAdmin] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(
      () =>
        ({
          address,
          deployed: () => ({
            renounceRole: () => {
              throw new Error('test error');
            },
          }),
        } as unknown as Promise<Contract>),
    );
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);
    const renounceAdmin = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });

      await eRC721UserMintable.accessControl.renounceAdmin({
        publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
      });
    };
    expect(renounceAdmin).rejects.toThrow(
      `An Ethers error occured (location=\"[HasAccessControl.renounceAdmin]\", error={}, code=[NETWORK.ERROR], version=${version})`,
    );
  });

  it('[isAdmin] - should return an Error if contract is not deployed', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

    expect(() =>
      eRC721UserMintable.accessControl.isAdmin({
        publicAddress: '0xB3C24BB465b682225F8C87b29a031921B764Ed94',
      }),
    ).rejects.toThrow(
      `Contract not deployed. (location=\"[HasAccessControl.isAdmin]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[isAdmin] - should return an Error because of bad address', () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);
    const admin = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.accessControl.isAdmin({ publicAddress: '' });
    };
    expect(admin).rejects.toThrow(
      `missing argument: Invalid public address. (location=\"[HasAccessControl.isAdmin]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[isAdmin] - should renounce admin', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);
    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      contractURI: 'contractURI',
      maxSupply: 10,
      price: '1',
      maxTokenRequest: 1,
    });
    await eRC721UserMintable.accessControl.isAdmin({
      publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
    });
    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[isAdmin] - should return an Error if there is a network error', async () => {
    jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementationOnce(
      () =>
        ({
          address,
          deployed: () => ({
            hasRole: () => {
              throw new Error('test error');
            },
          }),
        } as unknown as Promise<Contract>),
    );
    eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);
    const isAdmin = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });

      await eRC721UserMintable.accessControl.isAdmin({
        publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
      });
    };
    expect(isAdmin).rejects.toThrow(
      `An Ethers error occured (location=\"[HasAccessControl.isAdmin]\", error={}, code=[NETWORK.ERROR], version=${version})`,
    );
  });

  describe('setRoyalties', () => {
    it('[setRoyalties] - should throw if contract not deployed', async () => {
      const contract = new ERC721UserMintable(signer as unknown as ethers.Wallet);

      await expect(() =>
        contract.royalty.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 }),
      ).rejects.toThrow(
        `Contract not deployed. (location=\"[HasRoyalty.setRoyalties]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('[setRoyalties] - should throw when args are missing (address)', async () => {
      const eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });

      await expect(() =>
        eRC721UserMintable.royalty.setRoyalties({ publicAddress: '', fee: 1 }),
      ).rejects.toThrow(
        `missing argument: Invalid public address. (location=\"[HasRoyalty.setRoyalties]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('[setRoyalties] - should throw when args are missing (fee)', async () => {
      const contract = new ERC721UserMintable(signer as unknown as ethers.Wallet);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });

      await expect(() =>
        contract.royalty.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: -1 }),
      ).rejects.toThrow(
        `Fee must be between 0 and 10000. (location=\"[HasRoyalty.setRoyalties]\", argument=\"fee\", value=-1, code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('[setRoyalties] - should throw when "fee" is not a number larger than 0 and less than 10000', async () => {
      const contract = new ERC721UserMintable(signer as unknown as ethers.Wallet);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });

      await expect(() =>
        contract.royalty.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 0 }),
      ).rejects.toThrow(
        `Fee must be between 0 and 10000. (location=\"[HasRoyalty.setRoyalties]\", argument=\"fee\", value=0, code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('[setRoyalties] - should set royalties', async () => {
      const contract = new ERC721UserMintable(signer as unknown as ethers.Wallet);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      contract.royalty.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });
      await expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });
  });

  it('[price] - should return mint price per token', async () => {
    const contract = new ERC721UserMintable(signer as unknown as ethers.Wallet);
    await contract.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      contractURI: 'contractURI',
      maxSupply: 10,
      price: '1',
      maxTokenRequest: 1,
    });
    contract.price();
    await expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  describe('royaltyInfo', () => {
    it('[royaltyInfo] - should throw if contract not deployed', async () => {
      const contract = new ERC721UserMintable(signer as unknown as ethers.Wallet);

      await expect(() =>
        contract.royalty.royaltyInfo({ tokenId: 1, sellPrice: -1 }),
      ).rejects.toThrow(
        `Contract not deployed. (location=\"[HasRoyalty.royaltyInfo]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('[royaltyInfo] - should throw when args are missing (tokenId)', async () => {
      const contract = new ERC721UserMintable(signer as unknown as ethers.Wallet);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      contract.royalty.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() =>
        contract.royalty.royaltyInfo({ tokenId: -1, sellPrice: 0.001 }),
      ).rejects.toThrow(
        `missing argument: No tokenId supplied or tokenID is invalid. (location=\"[HasRoyalty.royaltyInfo]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('[royaltyInfo] - should throw when args are missing (sellPrice)', async () => {
      const contract = new ERC721UserMintable(signer as unknown as ethers.Wallet);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      contract.royalty.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() =>
        contract.royalty.royaltyInfo({ tokenId: 1, sellPrice: -1 }),
      ).rejects.toThrow(
        `missing argument: No sell price supplied or not valid. (location=\"[HasRoyalty.royaltyInfo]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('[royaltyInfo] - should not throw if TokenId is 0', async () => {
      const contract = new ERC721UserMintable(signer as unknown as ethers.Wallet);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      contract.royalty.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() => contract.royalty.royaltyInfo({ tokenId: 0, sellPrice: 0.1 })).toBeTruthy();
    });

    it('[royaltyInfo] - should not throw if SalePrice is 0', async () => {
      const contract = new ERC721UserMintable(signer as unknown as ethers.Wallet);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      contract.royalty.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() => contract.royalty.royaltyInfo({ tokenId: 1, sellPrice: 0 })).toBeTruthy();
    });
  });

  describe('renounceOwnership', () => {
    it('[renounceOwnership] - should throw if contract not deployed', async () => {
      eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);
      const renounceOwnership = async () => eRC721UserMintable.accessControl.renounceOwnership({});

      expect(renounceOwnership).rejects.toThrow(
        `Contract not deployed. (location=\"[HasAccessControl.renounceOwnership]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('[renounceOwnership] - should call renounce ownership', async () => {
      eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.accessControl.renounceOwnership({});

      expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('reserve', () => {
    it('[reserve] - should return an Error if contract is not deployed', () => {
      eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

      const reserve = async () =>
        eRC721UserMintable.reserve({
          quantity: 1,
        });
      expect(reserve).rejects.toThrow(
        `Contract not deployed. (location=\"[ERC721UserMintable.reserve]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
      );
    });
    it('[reserve] - should throw error because of invalid quantity', async () => {
      const contract = new ERC721UserMintable(signer as unknown as ethers.Wallet);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      const reserve = async () =>
        contract.reserve({
          quantity: 0,
        });
      expect(reserve).rejects.toThrow(
        `Quantity as integer value greater than 0 required. (location=\"[ERC721UserMintable.reserve]\", argument=\"quantity\", value=0, code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('[reserve] - should reserve a token', async () => {
      eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
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
      eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

      const reveal = async () =>
        eRC721UserMintable.reveal({
          baseURI: 'URI',
        });
      expect(reveal).rejects.toThrow(
        `Contract not deployed. (location=\"[ERC721UserMintable.reveal]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
      );
    });
    it('[reveal] - should throw error because of invalid URI', async () => {
      const contract = new ERC721UserMintable(signer as unknown as ethers.Wallet);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      const reveal = async () =>
        contract.reveal({
          baseURI: '',
        });
      expect(reveal).rejects.toThrow(
        `missing argument: Invalid baseURI. (location=\"[ERC721UserMintable.reveal]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('[reveal] - should reveal the contract', async () => {
      eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
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
      eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

      const setPrice = async () =>
        eRC721UserMintable.setPrice({
          price: '1',
        });
      expect(setPrice).rejects.toThrow(
        `Contract not deployed. (location=\"[ERC721UserMintable.setPrice]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
      );
    });
    it('[setPrice] - should throw error because of invalid price', async () => {
      const contract = new ERC721UserMintable(signer as unknown as ethers.Wallet);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      const setPrice = async () =>
        contract.setPrice({
          price: '-1',
        });
      expect(setPrice).rejects.toThrow(
        `missing argument: Invalid price (location=\"[ERC721UserMintable.setPrice]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('[setPrice] - should setPrice of the mint per token', async () => {
      eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.setPrice({
        price: '1',
      });

      expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('toggleSale', () => {
    it('[toggleSale] - should return an Error if contract is not deployed', () => {
      eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

      const toggleSale = async () => eRC721UserMintable.toggleSale();
      expect(toggleSale).rejects.toThrow(
        `Contract not deployed. (location=\"[ERC721UserMintable.toggleSale]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('[toggleSale] - should toggleSale of the mint per token', async () => {
      eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.toggleSale();

      expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('withdraw', () => {
    it('[withdraw] - should return an Error if contract is not deployed', () => {
      eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

      const withdraw = async () => eRC721UserMintable.withdraw();
      expect(withdraw).rejects.toThrow(
        `Contract not deployed. (location=\"[ERC721UserMintable.withdraw]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('[withdraw] - should toggleSale of the mint per token', async () => {
      eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.withdraw();

      expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('setContractURI', () => {
    it('[SetContractURI] - should return an Error if contract is not deployed', () => {
      eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

      expect(() =>
        eRC721UserMintable.baseERC721.setContractURI({
          contractURI:
            'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
        }),
      ).rejects.toThrow(
        `Contract not deployed. (location=\"[BaseERC721.setContractURI]\", argument=\"contractAddress\", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('[SetContractURI] - should console.warn if contractURI is not a link ', async () => {
      eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);
      const logSpy = jest.spyOn(console, 'warn');

      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.baseERC721.setContractURI({ contractURI: 'URI' });

      expect(logSpy).toHaveBeenCalledWith('WARNING: The ContractURI "URI" is not a link.');
      expect(logSpy).toHaveBeenCalledWith(
        'WARNING: ContractURI should be a public link to a valid JSON metadata file',
      );
    });

    it('[SetContractURI] - should return an Error if the contractURI is empty', () => {
      eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

      const uri = async () => {
        await eRC721UserMintable.deploy({
          name: 'name',
          symbol: 'symbol',
          baseURI: 'URI',
          contractURI: 'contractURI',
          maxSupply: 10,
          price: '1',
          maxTokenRequest: 1,
        });
        await eRC721UserMintable.baseERC721.setContractURI({ contractURI: '' });
      };
      expect(uri).rejects.toThrow(
        `ContractURI is not defined. (location=\"[BaseERC721.setContractURI]\", argument=\"contractURI\", value=\"\", code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('[SetContractURI] - should set the contractURI', async () => {
      eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        contractURI: 'contractURI',
        maxSupply: 10,
        price: '1',
        maxTokenRequest: 1,
      });
      await eRC721UserMintable.baseERC721.setContractURI({
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
      eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

      const setContractURI = async () => {
        await eRC721UserMintable.deploy({
          name: 'name',
          symbol: 'symbol',
          baseURI: 'URI',
          contractURI: 'contractURI',
          maxSupply: 10,
          price: '1',
          maxTokenRequest: 1,
        });
        await eRC721UserMintable.baseERC721.setContractURI({
          contractURI:
            'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
        });
      };
      expect(setContractURI).rejects.toThrow(
        `An Ethers error occured (location=\"[BaseERC721.setContractURI]\", error={}, code=[NETWORK.ERROR], version=${version})`,
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
      eRC721UserMintable = new ERC721UserMintable(signer as unknown as ethers.Wallet);

      const setContractURI = async () => {
        await eRC721UserMintable.deploy({
          name: 'name',
          symbol: 'symbol',
          baseURI: 'URI',
          contractURI: 'contractURI',
          maxSupply: 10,
          price: '1',
          maxTokenRequest: 1,
        });
        await eRC721UserMintable.baseERC721.setContractURI({
          contractURI:
            'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
        });
      };
      expect(setContractURI).rejects.toThrow(
        `An Ethers error occured (location=\"[BaseERC721.setContractURI]\", error={}, code=[NETWORK.ERROR], version=${version})`,
      );
    });
  });
});
