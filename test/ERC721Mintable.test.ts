import { Contract, ContractFactory, ethers } from 'ethers';
import ERC721Mintable from '../src/lib/ContractTemplates/ERC721Mintable';
import { ACCOUNT_ADDRESS, CONTRACT_ADDRESS, ACCOUNT_ADDRESS_2 } from './__mocks__/utils';
import version from '../src/_version';

let eRC721Mintable: ERC721Mintable;
let signer: Object;

jest.mock('ethers');

describe('SDK', () => {
  const contractFactoryMock = jest.spyOn(ContractFactory.prototype, 'deploy').mockImplementation(
    () =>
      ({
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
      } as unknown as Promise<Contract>),
  );

  jest.spyOn(ethers.utils, 'isAddress').mockImplementation(() => true);
  jest.spyOn(ethers, 'Contract').mockImplementation(() => ({} as Contract));
  jest.spyOn(console, 'warn').mockImplementation();

  beforeAll(() => {
    signer = {
      getChainId: () => 80001,
    };
  });

  afterEach(() => {
    contractFactoryMock.mockClear();
  });

  it('should create "ERC721Mintable" instance', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    expect(eRC721Mintable).not.toBe(null);
  });

  it('[Deploy] - should return an Error if signer not defined ', () => {
    eRC721Mintable = new ERC721Mintable(null as unknown as ethers.Wallet);

    const contract = async () =>
      eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });

    expect(contract).rejects.toThrow(
      `No signer instance supplied. (location="[ERC721Mintable.deploy]", argument="signer", value=null, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[Deploy] - should console.warn if URI is not a link ', async () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);
    const logSpy = jest.spyOn(console, 'warn');

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });

    expect(logSpy).toHaveBeenCalledWith('WARNING: The supplied ContractURI is not a link.');
    expect(logSpy).toHaveBeenCalledWith(
      'WARNING: ContractURI should be a public link to a valid JSON metadata file',
    );
  });

  it('[Deploy] - should return an Error if Name is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    const contract = async () =>
      eRC721Mintable.deploy({ name: '', symbol: 'symbol', contractURI: 'URI' });

    expect(contract).rejects.toThrow(
      `No name supplied. (location="[ERC721Mintable.deploy]", argument="name", value="", code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[Deploy] - should return a contract', async () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });

    expect(ContractFactory.prototype.deploy).toHaveBeenCalledTimes(1);
  });

  it('[Mint] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    const myNFT = async () =>
      eRC721Mintable.mint({
        publicAddress: ACCOUNT_ADDRESS,
        tokenURI: 'https://infura.io/images/404.png',
      });
    expect(myNFT).rejects.toThrow(
      `Contract not deployed. (location="[ERC721Mintable.mint]", argument="contractAddress", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[Mint] - should console.warn if tokenURI is not a link ', async () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);
    const logSpy = jest.spyOn(console, 'warn');

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'ipfs://URI' });
    await eRC721Mintable.mint({
      publicAddress: '0xE26a682fa90322eC48eB9F3FA66E8961D799177C',
      tokenURI: 'URI',
    });

    expect(logSpy).toHaveBeenCalledWith('WARNING: The supplied TokenURI is not a link.');
    expect(logSpy).toHaveBeenCalledWith(
      'WARNING: TokenURI should be a public link to a valid JSON metadata file',
    );
  });

  it('[Mint] - should return an Error if the address is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    const myNFT = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.mint({
        publicAddress: '',
        tokenURI: 'https://infura.io/images/404.png',
      });
    };
    expect(myNFT).rejects.toThrow(
      `missing argument: Invalid public address. (location="[ERC721Mintable.mint]", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[Mint] - should return an Error if the tokenURI is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    const myNFT = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.mint({
        publicAddress: '0xE26a682fa90322eC48eB9F3FA66E8961D799177C',
        tokenURI: '',
      });
    };
    expect(myNFT).rejects.toThrow(
      `missing argument: No tokenURI supplied. (location="[ERC721Mintable.mint]", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[Mint] - should mint a token', async () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.mint({
      publicAddress: ACCOUNT_ADDRESS,
      tokenURI: 'https://infura.io/images/404.png',
    });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[LoadContract] - should return an Error if contract is already deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    const contract = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.loadContract({ contractAddress: CONTRACT_ADDRESS });
    };
    expect(contract).rejects.toThrow(
      `Contract already deployed. (location="[ERC721Mintable.loadContract]", argument="contractAddress", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[LoadContract] - should return an Error if the address is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    const contract = async () => {
      await eRC721Mintable.loadContract({ contractAddress: '' });
    };
    expect(contract).rejects.toThrow(
      `missing argument: Invalid contract address. (location="[ERC721Mintable.loadContract]", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[LoadContract] - should load the contract', async () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    await eRC721Mintable.loadContract({ contractAddress: CONTRACT_ADDRESS });

    expect(ethers.Contract).toHaveBeenCalledTimes(1);
  });

  it('[Transfer] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    const transferNft = async () =>
      eRC721Mintable.baseERC721.transfer({
        from: ACCOUNT_ADDRESS,
        to: ACCOUNT_ADDRESS_2,
        tokenId: 1,
      });
    expect(transferNft).rejects.toThrow(
      `Contract not deployed. (location="[BaseERC721.transfer]", argument="contractAddress", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[Transfer] - should return an Error if from address is not valid', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    const transferNft = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'sumbol', contractURI: 'URI' });
      await eRC721Mintable.baseERC721.transfer({
        from: '',
        to: ACCOUNT_ADDRESS_2,
        tokenId: 1,
      });
    };
    expect(transferNft).rejects.toThrow(
      `missing argument: Invalid "from" address. (location="[BaseERC721.transfer]", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[Transfer] - should return an Error if to address is not valid', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    const transferNft = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'sumbol', contractURI: 'URI' });
      await eRC721Mintable.baseERC721.transfer({
        from: ACCOUNT_ADDRESS,
        to: '',
        tokenId: 1,
      });
    };
    expect(transferNft).rejects.toThrow(
      `missing argument: Invalid "to" address. (location="[BaseERC721.transfer]", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[Transfer] - should transfer nft', async () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'sumbol', contractURI: 'URI' });
    await eRC721Mintable.baseERC721.transfer({
      from: ACCOUNT_ADDRESS,
      to: ACCOUNT_ADDRESS_2,
      tokenId: 1,
    });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[SetContractURI] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    expect(() =>
      eRC721Mintable.setContractURI({
        contractURI:
          'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
      }),
    ).rejects.toThrow(
      `Contract not deployed. (location="[ERC721Mintable.setContractURI]", argument="contractAddress", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[SetContractURI] - should console.warn if contractURI is not a link ', async () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);
    const logSpy = jest.spyOn(console, 'warn');

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'ipfs://URI' });
    await eRC721Mintable.setContractURI({ contractURI: 'URI' });

    expect(logSpy).toHaveBeenCalledWith('WARNING: The supplied ContractURI is not a link.');
    expect(logSpy).toHaveBeenCalledWith(
      'WARNING: ContractURI should be a public link to a valid JSON metadata file',
    );
  });

  it('[SetContractURI] - should return an Error if the contractURI is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    const uri = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.setContractURI({ contractURI: '' });
    };
    expect(uri).rejects.toThrow(
      `missing argument: No contractURI supplied. (location="[ERC721Mintable.setContractURI]", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[SetContractURI] - should set the contractURI', async () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.setContractURI({
      contractURI:
        'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
    });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[addMinter] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    const minter = async () =>
      eRC721Mintable.accessControl.addMinter({ publicAddress: ACCOUNT_ADDRESS });
    expect(minter).rejects.toThrow(
      `Contract not deployed. (location="[HasAccessControl.addMinter]", argument="contractAddress", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[addMinter] - should return an Error if the address is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    const minter = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.accessControl.addMinter({ publicAddress: '' });
    };
    expect(minter).rejects.toThrow(
      `missing argument: Invalid public address. (location="[HasAccessControl.addMinter]", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[addMinter] - should add minter role to an address', async () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.accessControl.addMinter({ publicAddress: ACCOUNT_ADDRESS });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[removeMinter] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    const minter = async () =>
      eRC721Mintable.accessControl.removeMinter({ publicAddress: ACCOUNT_ADDRESS });
    expect(minter).rejects.toThrow(
      `Contract not deployed. (location="[HasAccessControl.removeMinter]", argument="contractAddress", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[removeMinter] - should return an Error if the address is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    const minter = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.accessControl.removeMinter({ publicAddress: '' });
    };
    expect(minter).rejects.toThrow(
      `missing argument: Invalid public address. (location="[HasAccessControl.removeMinter]", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[removeMinter] - should remove minter role to an address', async () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.accessControl.removeMinter({ publicAddress: ACCOUNT_ADDRESS });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[renounceMinter] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    const minter = async () =>
      eRC721Mintable.accessControl.renounceMinter({ publicAddress: ACCOUNT_ADDRESS });
    expect(minter).rejects.toThrow(
      `Contract not deployed. (location="[HasAccessControl.renounceMinter]", argument="contractAddress", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[renounceMinter] - should return an Error if the address is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    const minter = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.accessControl.renounceMinter({ publicAddress: '' });
    };
    expect(minter).rejects.toThrow(
      `missing argument: Invalid public address. (location="[HasAccessControl.renounceMinter]", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[renounceMinter] - should renounce minter role for an address', async () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.accessControl.renounceMinter({ publicAddress: ACCOUNT_ADDRESS });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[isMinter] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    const minter = async () =>
      eRC721Mintable.accessControl.isMinter({ publicAddress: ACCOUNT_ADDRESS });
    expect(minter).rejects.toThrow(
      `Contract not deployed. (location="[HasAccessControl.isMinter]", argument="contractAddress", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[isMinter] - should return an Error if the address is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    const minter = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.accessControl.isMinter({ publicAddress: '' });
    };
    expect(minter).rejects.toThrow(
      `missing argument: Invalid public address. (location="[HasAccessControl.isMinter]", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[isMinter] - should check if an address has minter role', async () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.accessControl.isMinter({ publicAddress: ACCOUNT_ADDRESS });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[SetApprovalForAll] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    expect(() =>
      eRC721Mintable.baseERC721.setApprovalForAll({ to: ACCOUNT_ADDRESS, approvalStatus: true }),
    ).rejects.toThrow(
      `Contract not deployed. (location="[BaseERC721.setApprovalForAll]", argument="contractAddress", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[SetApprovalForAll] - should return an Error if the address is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    const approval = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.baseERC721.setApprovalForAll({ to: '', approvalStatus: true });
    };
    expect(approval).rejects.toThrow(
      `missing argument: Invalid "to" address. (location="[BaseERC721.setApprovalForAll]", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[SetApprovalForAll] - should set approval for all when all params are correct', async () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    const approval = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.baseERC721.setApprovalForAll({
        to: ACCOUNT_ADDRESS,
        approvalStatus: true,
      });
    };

    expect(approval).not.toThrow();
    expect(await contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[addAdmin] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    expect(() =>
      eRC721Mintable.accessControl.addAdmin({
        publicAddress: '0xB3C24BB465b682225F8C87b29a031921B764Ed94',
      }),
    ).rejects.toThrow(
      `Contract not deployed. (location="[HasAccessControl.addAdmin]", argument="contractAddress", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[addAdmin] - should return an Error because of bad address', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);
    const admin = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.accessControl.addAdmin({ publicAddress: '' });
    };
    expect(admin).rejects.toThrow(
      `missing argument: Invalid public address. (location="[HasAccessControl.addAdmin]", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[addAdmin] - should add admin', async () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.accessControl.addAdmin({
      publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
    });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[removeAdmin] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    expect(() =>
      eRC721Mintable.accessControl.removeAdmin({
        publicAddress: '0xB3C24BB465b682225F8C87b29a031921B764Ed94',
      }),
    ).rejects.toThrow(
      `Contract not deployed. (location="[HasAccessControl.removeAdmin]", argument="contractAddress", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[removeAdmin] - should return an Error because of bad address', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);
    const admin = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.accessControl.removeAdmin({ publicAddress: '' });
    };
    expect(admin).rejects.toThrow(
      `missing argument: Invalid public address. (location="[HasAccessControl.removeAdmin]", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[removeAdmin] - should remove admin', async () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.accessControl.removeAdmin({
      publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
    });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[renounceAdmin] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    expect(() =>
      eRC721Mintable.accessControl.renounceAdmin({
        publicAddress: '0xB3C24BB465b682225F8C87b29a031921B764Ed94',
      }),
    ).rejects.toThrow(
      `Contract not deployed. (location="[HasAccessControl.renounceAdmin]", argument="contractAddress", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[renounceAdmin] - should return an Error because of bad address', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);
    const admin = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.accessControl.renounceAdmin({ publicAddress: '' });
    };
    expect(admin).rejects.toThrow(
      `missing argument: Invalid public address. (location="[HasAccessControl.renounceAdmin]", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[renounceAdmin] - should renounce admin', async () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.accessControl.renounceAdmin({
      publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
    });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[isAdmin] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    expect(() =>
      eRC721Mintable.accessControl.isAdmin({
        publicAddress: '0xB3C24BB465b682225F8C87b29a031921B764Ed94',
      }),
    ).rejects.toThrow(
      `Contract not deployed. (location="[HasAccessControl.isAdmin]", argument="contractAddress", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[isAdmin] - should return an Error because of bad address', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);
    const admin = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.accessControl.isAdmin({ publicAddress: '' });
    };
    expect(admin).rejects.toThrow(
      `missing argument: Invalid public address. (location="[HasAccessControl.isAdmin]", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[isAdmin] - should renounce admin', async () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.accessControl.isAdmin({
      publicAddress: '0x417C0309d43C27593F8a4DFEC427894306f6CE67',
    });
    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[ApproveTransfer] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    const approveTransfer = async () =>
      eRC721Mintable.baseERC721.approveTransfer({ to: ACCOUNT_ADDRESS_2, tokenId: 1 });
    expect(approveTransfer).rejects.toThrow(
      `Contract not deployed. (location="[BaseERC721.approveTransfer]", argument="contractAddress", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('[ApproveTransfer] - should return an Error if to address is not valid', async () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    const approveTransfer = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'sumbol', contractURI: 'URI' });
      await eRC721Mintable.baseERC721.approveTransfer({ to: '', tokenId: 1 });
    };

    expect(approveTransfer).rejects.toThrow(
      `missing argument: Invalid "to" address. (location="[BaseERC721.approveTransfer]", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('[ApproveTransfer] - should approve transfer nft', async () => {
    eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'sumbol', contractURI: 'URI' });
    await eRC721Mintable.baseERC721.approveTransfer({ to: ACCOUNT_ADDRESS, tokenId: 1 });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  describe('setRoyalties', () => {
    it('[setRoyalties] - should throw if contract not deployed', async () => {
      const contract = new ERC721Mintable(signer as unknown as ethers.Wallet);

      await expect(() =>
        contract.royalty.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 }),
      ).rejects.toThrow(
        `Contract not deployed. (location="[HasRoyalty.setRoyalties]", argument="contractAddress", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('[setRoyalties] - should throw when "fee" is not a number larger than 0 and less than 10000', async () => {
      const contract = new ERC721Mintable(signer as unknown as ethers.Wallet);
      await contract.deploy({ name: 'name', symbol: 'sumbol', contractURI: 'URI' });

      await expect(() =>
        contract.royalty.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 0 }),
      ).rejects.toThrow(
        `Fee must be between 0 and 10000. (location="[HasRoyalty.setRoyalties]", argument="fee", value=0, code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('[setRoyalties] - should set royalties', async () => {
      const contract = new ERC721Mintable(signer as unknown as ethers.Wallet);
      await contract.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      contract.royalty.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });
      await expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('royaltyInfo', () => {
    it('[royaltyInfo] - should not throw if TokenId is 0', async () => {
      const contract = new ERC721Mintable(signer as unknown as ethers.Wallet);
      await contract.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      contract.royalty.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() => contract.royalty.royaltyInfo({ tokenId: 0, sellPrice: 10 })).toBeTruthy();
    });

    it('[royaltyInfo] - should not throw if SalePrice is 0', async () => {
      const contract = new ERC721Mintable(signer as unknown as ethers.Wallet);
      await contract.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      contract.royalty.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() => contract.royalty.royaltyInfo({ tokenId: 1, sellPrice: 0 })).toBeTruthy();
    });
  });
  describe('renounceOwnership', () => {
    it('[renounceOwnership] - should throw if contract not deployed', async () => {
      eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);
      const renounceOwnership = async () => eRC721Mintable.baseERC721.renounceOwnership({});

      expect(renounceOwnership).rejects.toThrow(
        `Contract not deployed. (location="[BaseERC721.renounceOwnership]", argument="contractAddress", value=undefined, code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('[renounceOwnership] - should call renounce ownership', async () => {
      eRC721Mintable = new ERC721Mintable(signer as unknown as ethers.Wallet);

      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.baseERC721.renounceOwnership({});

      expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });
  });
});
