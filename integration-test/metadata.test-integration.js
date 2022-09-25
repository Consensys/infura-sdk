import { config as loadEnv } from 'dotenv';
import path from 'path';

import Metadata from '../src/lib/Metadata/Metadata';

const imageFile = path.join(__dirname, 'ipfs-test/infura.png');
const animFile = path.join(__dirname, 'ipfs-test/metamask.jpeg');

loadEnv();
describe('E2E Test: Metadata', () => {
  jest.setTimeout(120 * 1000);
  const projectId = process.env.INFURA_IPFS_PROJECT_ID;
  const projectSecret = process.env.INFURA_IPFS_PROJECT_SECRET;
  let met;

  beforeAll(() => {
    met = new Metadata({ projectId, projectSecret });
  });

  it('should create token URI from JSON (img + animation_url)', async () => {
    // Arrange
    const tokenMetadata = {
      name: 'My awesome image',
      description: "This awesome image has been created manually, and it's gorgeous",
      external_url: 'https://infura.io',
      image: imageFile,
      animation_url: animFile,
      attributes: [
        {
          traitType: 'Background',
          value: 'Orange',
        },
      ],
    };
    // Act
    const res = await met.createTokenURI(tokenMetadata);
    // Assert
    expect(res.type).toBe('nftMetadata');
    expect(res.cid).not.toBe(null);
    expect(res.image.startsWith('https://')).toBe(true);
    expect(res.animation_url.startsWith('https://')).toBe(true);
  });

  it('should create token URI from FILE (img + animation_url)', async () => {
    // Arrange
    const metadataFile = path.join(__dirname, 'ipfs-test/nftMetadata.json');
    // Act
    const res = await met.createTokenURI(metadataFile);
    // Assert
    expect(res.type).toBe('nftMetadata');
    expect(res.cid).not.toBe(null);
    expect(res.image.startsWith('https://')).toBe(true);
    expect(res.animation_url.startsWith('https://')).toBe(true);
  });

  it('should create contract URI from JSON (local img)', async () => {
    // Arrange
    const contractMetadata = {
      name: 'My Summer Collection',
      description: 'A carefully-chosen set of pictures from my 2022 summer holidays.',
      image: imageFile,
      external_link: 'https://my-summer-holidays.blogspot.com',
    };
    // Act
    const res = await met.createContractURI(contractMetadata);
    // Assert
    expect(res.type).toBe('collectionMetadata');
    expect(res.cid).not.toBe(null);
    expect(res.image.startsWith('https://')).toBe(true);
  });

  it('should create contract URI from FILE (online img)', async () => {
    // Arrange
    const metadataFile = path.join(__dirname, 'ipfs-test/contractMetadata.json');
    // Act
    const res = await met.createContractURI(metadataFile);
    // Assert
    expect(res.type).toBe('collectionMetadata');
    expect(res.cid).not.toBe(null);
    expect(res.image.startsWith('https://')).toBe(true);
  });
});
