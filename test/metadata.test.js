import { config as loadEnv } from 'dotenv';
import path from 'path';
import Metadata from '../src/lib/Metadata/Metadata.js';

loadEnv();

// Mock Endpoint
const mockedUploadFile = jest.fn().mockImplementation(() => 'mockedFile');
const mockedUploadObject = jest.fn().mockImplementation(() => 'mockedObject');

jest.mock('../src/services/ipfsService.js', () => {
  return function () {
    return {
      uploadFile: mockedUploadFile,
      uploadObject: mockedUploadObject,
    };
  };
});

describe('Metadata', () => {
  const projectId = process.env.INFURA_IPFS_PROJECT_ID;
  const projectSecret = process.env.INFURA_IPFS_PROJECT_SECRET;
  let met;

  beforeAll(() => {
    met = new Metadata({ projectId, projectSecret });
  });

  it('should throw when args are missing (ipfsInfuraProjectId)', () => {
    expect(() => new Metadata({ projectId: null, projectSecret: projectSecret })).toThrow();
  });

  it('should throw when args are missing (ipfsInfuraSecreId)', () => {
    expect(() => new Metadata({ projectId: projectId, projectSecret: null })).toThrow();
  });

  describe('createTokenURI', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw when input is not supported', () => {
      // arrange
      const candidateInput = 12;
      // act
      const hash = async () => await met.createTokenURI(candidateInput);
      // assert
      expect(hash).rejects.toThrow();
    });

    it('should throw when input is not valid', () => {
      // arrange
      const candidateInput = '../not-existing-json.json';
      // act
      const hash = async () => await met.createTokenURI(candidateInput);
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
      const res = await met.createTokenURI(tokenMetadataImage);
      // assert
      expect(mockedUploadFile).toHaveBeenCalledTimes(1);
      expect(mockedUploadObject).toHaveBeenCalledTimes(1);
      expect(res.image.startsWith('https://')).toBe(true);
      expect(res.cid).toBe('mockedObject');
    });

    it('should upload image & file in IPFS (file)', async () => {
      // arrange
      const file = path.join(__dirname, 'ipfs-test/nftMetadata.json');
      // act
      const res = await met.createTokenURI(file);
      // assert
      expect(mockedUploadFile).toHaveBeenCalledTimes(1);
      expect(mockedUploadObject).toHaveBeenCalledTimes(1);
      expect(res.image.startsWith('https://')).toBe(true);
      expect(res.cid).toBe('mockedObject');
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
      const res = await met.createTokenURI(tokenMetadataImageWithAnimatioUrl);
      // assert
      expect(mockedUploadFile).toHaveBeenCalledTimes(2);
      expect(mockedUploadObject).toHaveBeenCalledTimes(1);
      expect(res.image.startsWith('https://')).toBe(true);
      expect(res.animation_url.startsWith('https://')).toBe(true);
      expect(res.cid).toBe('mockedObject');
    });
  });

  describe('createContractURI', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should upload image & file in IPFS (JSON)', async () => {
      // arrange
      const collectionMetadata = {
        name: 'OpenSea Creatures',
        description:
          'OpenSea Creatures are adorable aquatic beings primarily for demonstrating what can be done using the OpenSea platform. Adopt one today to try out all the OpenSea buying, selling, and bidding feature set.',
        image: '/full/path/to/0.jpg',
        external_link: 'external-link-url',
      };
      // act
      const res = await met.createContractURI(collectionMetadata);
      // assert
      expect(mockedUploadFile).toHaveBeenCalledTimes(1);
      expect(mockedUploadObject).toHaveBeenCalledTimes(1);
      expect(res.image.startsWith('https://')).toBe(true);
      expect(res.cid).toBe('mockedObject');
    });

    it('should upload image & file in IPFS (file)', async () => {
      // arrange
      const file = path.join(__dirname, 'ipfs-test/collectionMetadata.json');
      // act
      const res = await met.createContractURI(file);
      // assert
      expect(mockedUploadFile).toHaveBeenCalledTimes(1);
      expect(mockedUploadObject).toHaveBeenCalledTimes(1);
      expect(res.image.startsWith('https://')).toBe(true);
      expect(res.cid).toBe('mockedObject');
    });
  });
});
