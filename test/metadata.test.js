import { config as loadEnv } from 'dotenv';
import path from 'path';
import Metadata from '../src/lib/Metadata/Metadata.js';

loadEnv();

// Mock Endpoint
const mockedUploadFile = jest.fn();

jest.mock('../src/services/ipfsService.js', () => {
  return function () {
    return {
      uploadFile: mockedUploadFile,
    };
  };
});

describe('Metadata', () => {
  const projectId = process.env.INFURA_IPFS_PROJECT_ID;
  const projectSecret = process.env.INFURA_IPFS_PROJECT_SECRET;
  const ipfsUrl = process.env.INFURA_IPFS_ENDPOINT;
  let met;

  beforeAll(() => {
    met = new Metadata({ ipfsUrl, projectId, projectSecret });
  });

  it('should throw when args are missing (ipfsInfuraProjectId)', () => {
    expect(
      () => new Metadata({ ipfsUrl, projectId: null, projectSecret: projectSecret }),
    ).toThrow();
  });

  it('should throw when args are missing (ipfsInfuraSecreId)', () => {
    expect(() => new Metadata({ ipfsUrl, projectId: projectId, projectSecret: null })).toThrow();
  });

  describe('storeNftMetadata', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw when input is not supported', () => {
      // arrange
      const candidateInput = 12;
      // act
      const hash = async () => await met.storeNftMetadata(candidateInput);
      // assert
      expect(hash).rejects.toThrow();
    });

    it('should throw when input is not valid', () => {
      // arrange
      const candidateInput = '../not-existing-json.json';
      // act
      const hash = async () => await met.storeNftMetadata(candidateInput);
      // assert
      expect(hash).rejects.toThrow();
    });

    it('should upload image & file in IPFS (JSON)', async () => {
      // arrange
      const tokenMetadataImage = {
        description: 'Friendly OpenSea Creature that enjoys long swims in the ocean.',
        external_url: 'https://openseacreatures.io/3',
        image: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
        name: 'Dave Starbelly',
        attributes: [],
      };
      // act
      await met.storeNftMetadata(tokenMetadataImage);
      // assert
      expect(mockedUploadFile).toHaveBeenCalledTimes(2);
    });

    it('should upload image & file in IPFS (file)', async () => {
      // arrange
      const file = path.join(__dirname, 'ipfs-test/nftMetadata.json');
      // act
      await met.storeNftMetadata(file);
      // assert
      expect(mockedUploadFile).toHaveBeenCalledTimes(2);
    });

    it('should upload image & animation_url & file in IPFS', async () => {
      // arrange
      const tokenMetadataImageWithAnimatioUrl = {
        description: 'Friendly OpenSea Creature that enjoys long swims in the ocean.',
        external_url: 'https://openseacreatures.io/3',
        image: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
        animation_url: 'ipfs-test/consensys.png',
        name: 'Dave Starbelly',
        attributes: [],
      };
      // act
      console.log(await met.storeNftMetadata(tokenMetadataImageWithAnimatioUrl));
      // assert
      expect(mockedUploadFile).toHaveBeenCalledTimes(3);
    });
  });
});
