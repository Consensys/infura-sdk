import { config as loadEnv } from 'dotenv';
import Metadata from '../src/lib/Metadata/Metadata.js';

loadEnv();

// Mock Endpoint
jest.mock('../src/services/ipfsService.js');

describe('Metadata', () => {
  const projectId = process.env.INFURA_IPFS_PROJECT_ID;
  const projectSecret = process.env.INFURA_IPFS_PROJECT_SECRET;
  const ipfsUrl = process.env.INFURA_IPFS_ENDPOINT;

  it('should throw when args are missing (ipfsInfuraProjectId)', async () => {
    expect(
      () => new Metadata({ ipfsInfuraProjectId: null, ipfsInfuraSecetKey: projectSecret }),
    ).toThrow();
  });

  it('should throw when args are missing (ipfsInfuraSecreId)', async () => {
    expect(
      () => new Metadata({ ipfsInfuraProjectId: projectId, ipfsInfuraSecetKey: null }),
    ).toThrow();
  });
});
