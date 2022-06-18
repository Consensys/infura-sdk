import { ContractFactory, ethers } from 'ethers';
import ERC721UserMintable from '../src/lib/ContractTemplates/ERC721UserMintable';
import { ACCOUNT_ADDRESS, CONTRACT_ADDRESS, ACCOUNT_ADDRESS_2 } from './__mocks__/utils';

let eRC721UserMintable;
let signer;
let contractAddress;

jest.mock('ethers');

describe('SDK', () => {
  const contractFactoryMock = jest
    .spyOn(ContractFactory.prototype, 'deploy')
    .mockImplementation(() => ({
      deployed: () => ({
        mint: jest.fn(),
        'safeTransferFrom(address,address,uint256)': jest.fn(),
        setBaseURI: jest.fn(),
        setApprovalForAll: jest.fn(),
        approve: jest.fn(),
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
    eRC721UserMintable = new ERC721UserMintable(null, contractAddress);

    const contract = async () =>
      eRC721UserMintable.deploy({ name: 'name', symbol: 'symbol', baseURI: 'URI' });

    expect(contract).rejects.toThrow(
      '[ERC721UserMintable.deploy] Signer instance is required to interact with contract.',
    );
  });

  it('[Deploy] - should return an Error if Name is empty', () => {
    eRC721UserMintable = new ERC721UserMintable(signer, contractAddress);

    const contract = async () =>
      eRC721UserMintable.deploy({ name: '', symbol: 'symbol', baseURI: 'URI' });

    expect(contract).rejects.toThrow('[ERC721UserMintable.deploy] Name cannot be empty');
  });

  it('[Deploy] - should return an Error if symbol is undefined', () => {
    eRC721UserMintable = new ERC721UserMintable(signer, contractAddress);

    const contract = async () => eRC721UserMintable.deploy({ name: 'name', baseURI: 'URI' });

    expect(contract).rejects.toThrow('[ERC721UserMintable.deploy] symbol cannot be undefined');
  });

  it('[Deploy] - should return an Error if baseURI is undefined', () => {
    eRC721UserMintable = new ERC721UserMintable(signer, contractAddress);

    const contract = async () => eRC721UserMintable.deploy({ name: 'name', symbol: 'symbol' });

    expect(contract).rejects.toThrow('[ERC721UserMintable.deploy] baseURI cannot be undefined');
  });

  it('[Deploy] - should return an Error if maxSupply is undefined', () => {
    eRC721UserMintable = new ERC721UserMintable(signer, contractAddress);

    const contract = async () =>
      eRC721UserMintable.deploy({ name: 'name', symbol: 'symbol', baseURI: 'URI' });

    expect(contract).rejects.toThrow('[ERC721UserMintable.deploy] maxSupply cannot be undefined');
  });

  it('[Deploy] - should return an Error if price is undefined', () => {
    eRC721UserMintable = new ERC721UserMintable(signer, contractAddress);

    const contract = async () =>
      eRC721UserMintable.deploy({ name: 'name', symbol: 'symbol', baseURI: 'URI', maxSupply: 10 });

    expect(contract).rejects.toThrow('[ERC721UserMintable.deploy] price cannot be undefined');
  });

  it('[Deploy] - should return a contract', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer, contractAddress);

    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      maxSupply: 10,
      price: ethers.utils.parseEther(1),
    });

    expect(ContractFactory.prototype.deploy).toHaveBeenCalledTimes(1);
  });

  it('[Mint] - should return an Error if contract is not deployed', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const myNFT = async () =>
      eRC721UserMintable.mint({
        quantity: 1,
        value: 100,
      });
    expect(myNFT).rejects.toThrow(
      '[ERC721UserMintable.mint] A contract should be deployed or loaded first',
    );
  });

  it('[Mint] - should return an Error if the quantity is 0', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const myNFT = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
      });
      await eRC721UserMintable.mint({
        quantity: 0,
        value: 100,
      });
    };
    expect(myNFT).rejects.toThrow(
      '[ERC721UserMintable.mint] Quantity as integer value between 1 and 20 is required',
    );
  });

  it('[Mint] - should mint a token', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      maxSupply: 10,
      price: ethers.utils.parseEther(1),
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
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
      });
      await eRC721UserMintable.loadContract({ contractAddress: CONTRACT_ADDRESS });
    };
    expect(contract).rejects.toThrow(
      '[ERC721UserMintable.loadContract] The contract has already been loaded!',
    );
  });

  it('[LoadContract] - should return an Error if the address is empty', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const contract = async () => {
      await eRC721UserMintable.loadContract({ contractAddress: '' });
    };
    expect(contract).rejects.toThrow(
      '[ERC721UserMintable.loadContract] A valid contract address is required to load a contract.',
    );
  });

  it('[LoadContract] - should load the contract', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    await eRC721UserMintable.loadContract({ contractAddress: CONTRACT_ADDRESS });

    expect(ethers.Contract).toHaveBeenCalledTimes(1);
  });

  it('[Transfer] - should return an Error if contract is not deployed', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const transferNft = async () =>
      eRC721UserMintable.transfer({ from: ACCOUNT_ADDRESS, to: ACCOUNT_ADDRESS_2, tokenId: 1 });
    expect(transferNft).rejects.toThrow(
      '[ERC721UserMintable.transfer] A contract should be deployed or loaded first',
    );
  });

  it('[Transfer] - should return an Error if from address is not valid', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const transferNft = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'sumbol',
        baseURI: 'URI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
      });
      await eRC721UserMintable.transfer({
        from: '',
        to: ACCOUNT_ADDRESS_2,
        tokenId: 1,
      });
    };
    expect(transferNft).rejects.toThrow(
      '[ERC721UserMintable.transfer] A valid address "from" is required to transfer.',
    );
  });

  it('[Transfer] - should return an Error if to address is not valid', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const transferNft = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'sumbol',
        baseURI: 'URI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
      });
      await eRC721UserMintable.transfer({
        from: ACCOUNT_ADDRESS,
        to: '',
        tokenId: 1,
      });
    };
    expect(transferNft).rejects.toThrow(
      '[ERC721UserMintable.transfer] A valid address "to" is required to transfer.',
    );
  });

  it('[Transfer] - should return an Error if to tokenID is not valid', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const transferNft = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'sumbol',
        baseURI: 'URI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
      });
      await eRC721UserMintable.transfer({
        from: ACCOUNT_ADDRESS,
        to: ACCOUNT_ADDRESS_2,
        tokenId: 'test',
      });
    };
    expect(transferNft).rejects.toThrow(
      '[ERC721UserMintable.transfer] TokenId should be an integer.',
    );
  });

  it('[Transfer] - should transfer nft', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'sumbol',
      baseURI: 'URI',
      maxSupply: 10,
      price: ethers.utils.parseEther(1),
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
    ).rejects.toThrow(
      '[ERC721UserMintable.setBaseURI] A contract should be deployed or loaded first!',
    );
  });

  it('[SetBaseURI] - should return an Error if the baseURI is empty', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const uri = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
      });
      await eRC721UserMintable.setBaseURI({ baseURI: '' });
    };
    expect(uri).rejects.toThrow('[ERC721UserMintable.setBaseURI] A valid base uri is required!');
  });

  it('[SetBaseURI] - should set the BASEuri', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      maxSupply: 10,
      price: ethers.utils.parseEther(1),
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
    ).rejects.toThrow(
      '[ERC721UserMintable.setApprovalForAll] A contract should be deployed or loaded first.',
    );
  });

  it('[SetApprovalForAll] - should return an Error if the address is empty', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const approval = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
      });
      await eRC721UserMintable.setApprovalForAll({ to: '', approvalStatus: true });
    };
    expect(approval).rejects.toThrow(
      '[ERC721UserMintable.setApprovalForAll] An address is required to setApprovalForAll.',
    );
  });

  it('[SetApprovalForAll] - should return an Error if the approvalStatus is not a boolean', () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const approval = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
      });
      await eRC721UserMintable.setApprovalForAll({ to: ACCOUNT_ADDRESS, approvalStatus: '' });
    };
    expect(approval).rejects.toThrow(
      '[ERC721UserMintable.setApprovalForAll] approvalStatus param should be a boolean.',
    );
  });

  it('[SetApprovalForAll] - should set approval for all when all params are correct', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const approval = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
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
      '[ERC721UserMintable.approveTransfer] A contract should be deployed or loaded first',
    );
  });

  it('[ApproveTransfer] - should return an Error if to address is not valid', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const approveTransfer = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'sumbol',
        baseURI: 'URI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
      });
      await eRC721UserMintable.approveTransfer({ to: '', tokenId: 1 });
    };

    expect(approveTransfer).rejects.toThrow(
      '[ERC721UserMintable.approveTransfer] A valid address "to" is required to transfer.',
    );
  });

  it('[ApproveTransfer] - should return an Error if tokenId is not valid', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    const approveTransfer = async () => {
      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'sumbol',
        baseURI: 'URI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
      });
      await eRC721UserMintable.approveTransfer({ to: ACCOUNT_ADDRESS, tokenId: '' });
    };

    expect(approveTransfer).rejects.toThrow(
      '[ERC721UserMintable.approveTransfer] TokenId should be an integer.',
    );
  });

  it('[ApproveTransfer] - should approve transfer nft', async () => {
    eRC721UserMintable = new ERC721UserMintable(signer);

    await eRC721UserMintable.deploy({
      name: 'name',
      symbol: 'sumbol',
      baseURI: 'URI',
      maxSupply: 10,
      price: ethers.utils.parseEther(1),
    });
    await eRC721UserMintable.approveTransfer({ to: ACCOUNT_ADDRESS, tokenId: 1 });

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  describe('setRoyalties', () => {
    it('[setRoyalties] - should throw if contract not deployed', async () => {
      const contract = new ERC721UserMintable(signer);

      await expect(() =>
        contract.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 }),
      ).rejects.toThrow('[ERC721UserMintable.setRoyalties] Contract needs to be deployed');
    });
    it('[setRoyalties] - should throw when args are missing (address)', async () => {
      const contract = new ERC721UserMintable(signer);
      contract.contractAddress = CONTRACT_ADDRESS;

      await expect(() => contract.setRoyalties({ publicAddress: null, fee: 1 })).rejects.toThrow(
        '[ERC721UserMintable.setRoyalties] Address is required',
      );
    });
    it('[setRoyalties] - should throw when args are missing (fee)', async () => {
      const contract = new ERC721UserMintable(signer);
      contract.contractAddress = CONTRACT_ADDRESS;

      await expect(() =>
        contract.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: null }),
      ).rejects.toThrow(
        '[ERC721UserMintable.setRoyalties] Fee as numeric value between 0 and 10000 is required',
      );
    });
    it('[setRoyalties] - should throw when "fee" is not a number', async () => {
      const contract = new ERC721UserMintable(signer);
      contract.contractAddress = CONTRACT_ADDRESS;

      await expect(() =>
        contract.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 'number' }),
      ).rejects.toThrow(
        '[ERC721UserMintable.setRoyalties] Fee as numeric value between 0 and 10000 is required',
      );
    });
    it('[setRoyalties] - should throw when "fee" is not a number larger than 0 and less than 10000', async () => {
      const contract = new ERC721UserMintable(signer);
      contract.contractAddress = CONTRACT_ADDRESS;

      await expect(() =>
        contract.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 0 }),
      ).rejects.toThrow(
        '[ERC721UserMintable.setRoyalties] Fee as numeric value between 0 and 10000 is required',
      );
    });

    it('[setRoyalties] - should set royalties', async () => {
      const contract = new ERC721UserMintable(signer);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
      });
      contract.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });
      await expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });
  });

  it('[price] - should return mint price per token', async () => {
    const contract = new ERC721UserMintable(signer);
    await contract.deploy({
      name: 'name',
      symbol: 'symbol',
      baseURI: 'URI',
      maxSupply: 10,
      price: ethers.utils.parseEther(1),
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
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
      });
      contract.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() => contract.royaltyInfo({ tokenId: 1, sellPrice: null })).rejects.toThrow(
        '[ERC721UserMintable.royaltyInfo] Sell price is required',
      );
    });
    it('[royaltyInfo] - should throw when args are missing (tokenId)', async () => {
      const contract = new ERC721UserMintable(signer);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
      });
      contract.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() => contract.royaltyInfo({ tokenId: null, sellPrice: null })).rejects.toThrow(
        '[ERC721UserMintable.royaltyInfo] TokenId is required',
      );
    });
    it('[royaltyInfo] - should throw when args are missing (sellPrice)', async () => {
      const contract = new ERC721UserMintable(signer);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
      });
      contract.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() => contract.royaltyInfo({ tokenId: 1, sellPrice: null })).rejects.toThrow(
        '[ERC721UserMintable.royaltyInfo] Sell price is required',
      );
    });
    it('[royaltyInfo] - should not throw if TokenId is 0', async () => {
      const contract = new ERC721UserMintable(signer);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
      });
      contract.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() => contract.royaltyInfo({ tokenId: 0, sellPrice: 10 })).toBeTruthy();
    });
    it('[royaltyInfo] - should not throw if SalePrice is 0', async () => {
      const contract = new ERC721UserMintable(signer);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
      });
      contract.setRoyalties({ publicAddress: ACCOUNT_ADDRESS, fee: 1 });

      await expect(() => contract.royaltyInfo({ tokenId: 1, sellPrice: 0 })).toBeTruthy();
    });
  });
  describe('renounceOwnership', () => {
    it('[renounceOwnership] - should throw if contract not deployed', async () => {
      eRC721UserMintable = new ERC721UserMintable(signer);
      const renounceOwnership = async () => eRC721UserMintable.renounceOwnership();

      expect(renounceOwnership).rejects.toThrow(
        '[ERC721UserMintable.renounceOwnership] Contract needs to be deployed',
      );
    });

    it('[renounceOwnership] - should call renounce ownership', async () => {
      eRC721UserMintable = new ERC721UserMintable(signer);

      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
      });
      await eRC721UserMintable.renounceOwnership();

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
        '[ERC721UserMintable.reserve] A contract should be deployed or loaded first',
      );
    });
    it('[reserve] - should throw error because of invalid quantity', async () => {
      const contract = new ERC721UserMintable(signer);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
      });
      const reserve = async () =>
        contract.reserve({
          quantity: 0,
        });
      expect(reserve).rejects.toThrow(
        '[ERC721UserMintable.reserve] Quantity as integer value between 1 and 20 is required',
      );
    });

    it('[reserve] - should reserve a token', async () => {
      eRC721UserMintable = new ERC721UserMintable(signer);

      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
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
        '[ERC721UserMintable.reveal] A contract should be deployed or loaded first',
      );
    });
    it('[reveal] - should throw error because of invalid URI', async () => {
      const contract = new ERC721UserMintable(signer);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
      });
      const reveal = async () =>
        contract.reveal({
          baseURI: '',
        });
      expect(reveal).rejects.toThrow('[ERC721UserMintable.reveal] A valid base uri is required!');
    });

    it('[reveal] - should reveal the contract', async () => {
      eRC721UserMintable = new ERC721UserMintable(signer);

      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
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
      expect(setPrice).rejects.toThrow(
        '[ERC721UserMintable.setPrice] A contract should be deployed or loaded first',
      );
    });
    it('[setPrice] - should throw error because of invalid URI', async () => {
      const contract = new ERC721UserMintable(signer);
      await contract.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
      });
      const setPrice = async () =>
        contract.setPrice({
          price: undefined,
        });
      expect(setPrice).rejects.toThrow('[ERC721UserMintable.setPrice] price cannot be undefined');
    });

    it('[setPrice] - should setPrice of the mint per token', async () => {
      eRC721UserMintable = new ERC721UserMintable(signer);

      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
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
      expect(toggleSale).rejects.toThrow(
        '[ERC721UserMintable.toggleSale] A contract should be deployed or loaded first',
      );
    });

    it('[toggleSale] - should toggleSale of the mint per token', async () => {
      eRC721UserMintable = new ERC721UserMintable(signer);

      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
      });
      await eRC721UserMintable.toggleSale();

      expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('withdraw', () => {
    it('[withdraw] - should return an Error if contract is not deployed', () => {
      eRC721UserMintable = new ERC721UserMintable(signer);

      const withdraw = async () => eRC721UserMintable.withdraw();
      expect(withdraw).rejects.toThrow(
        '[ERC721UserMintable.withdraw] A contract should be deployed or loaded first',
      );
    });

    it('[withdraw] - should toggleSale of the mint per token', async () => {
      eRC721UserMintable = new ERC721UserMintable(signer);

      await eRC721UserMintable.deploy({
        name: 'name',
        symbol: 'symbol',
        baseURI: 'URI',
        maxSupply: 10,
        price: ethers.utils.parseEther(1),
      });
      await eRC721UserMintable.withdraw();

      expect(contractFactoryMock).toHaveBeenCalledTimes(1);
    });
  });
});
