import { config as loadEnv } from 'dotenv';
import Metadata from '../src/lib/Metadata/Metadata.js';

loadEnv();

// Mock Endpoint
jest.mock('../src/services/ipfsService.js', () => {
  return function () {
    return {
      uploadFile: jest
        .fn(() => 'default')
        .mockImplementationOnce(() => 'CIDIMGIPFS')
        .mockImplementationOnce(() => 'CIDFILEIPFS'),
    };
  };
});
// ({
//   default: jest.fn(() => 'mock'),
//   uploadFile: jest
//     .fn(() => 'default')
//     .mockImplementationOnce(() => 'CIDIMGIPFS')
//     .mockImplementationOnce(() => 'CIDFILEIPFS'),
// }));

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

    it('should upload image & file in IPFS', async () => {
      // arrange
      const tokenMetadataImage = {
        description: 'Friendly OpenSea Creature that enjoys long swims in the ocean.',
        external_url: 'https://openseacreatures.io/3',
        image: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
        name: 'Dave Starbelly',
        attributes: [],
      };
      // act
      const hash = await met.storeNftMetadata(tokenMetadataImage);
      // assert
      expect(hash.type).toBe('nftMetadata');
      expect(hash.cid).toBe('CIDFILEIPFS');
    });
  });
});
