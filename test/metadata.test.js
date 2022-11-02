import Metadata from '../src/lib/Metadata/Metadata.js';
import { faker } from '@faker-js/faker';

describe('Metadata', () => {
  describe('createTokenMetadata', () => {
    it('should throw error if name not provided', () => {
      expect(() => Metadata.OpenSeaTokenLevelStandard({})).toThrow(
        '[Metadata.tokenLevelMetadata] "name" is required',
      );
    });
    it('should throw error if description is not provided', () => {
      expect(() => Metadata.OpenSeaTokenLevelStandard({ name: faker.datatype.string() })).toThrow(
        '[Metadata.tokenLevelMetadata] "description" is required',
      );
    });

    it('should throw error if image is not provided', () => {
      expect(() =>
        Metadata.OpenSeaTokenLevelStandard({
          name: faker.datatype.string(),
          description: faker.datatype.string(),
        }),
      ).toThrow('[Metadata.tokenLevelMetadata] "image" is required');
    });

    it('should throw error if image is not url', () => {
      expect(() =>
        Metadata.OpenSeaTokenLevelStandard({
          name: faker.datatype.string(),
          description: faker.datatype.string(),
          image: faker.datatype.string(),
        }),
      ).toThrow(
        '[Metadata.tokenLevelMetadata] "image" must be a valid uri with a scheme matching the ipfs|https? pattern',
      );
    });

    it('should not throw error if image is url', () => {
      const data = Metadata.OpenSeaTokenLevelStandard({
        name: faker.datatype.string(),
        description: faker.datatype.string(),
        image: faker.internet.url(),
        attributes: [],
      });

      expect(data).not.toBe(null);
    });

    it('should not throw error if image is ipfs link', () => {
      const data = Metadata.OpenSeaTokenLevelStandard({
        name: faker.datatype.string(),
        description: faker.datatype.string(),
        image: `ipfs://${faker.datatype.uuid()}`,
        attributes: [],
      });
      expect(data).not.toBe(null);
    });

    it('should throw error if attributes doesnt contains trait_type property', () => {
      expect(() =>
        Metadata.OpenSeaTokenLevelStandard({
          name: faker.datatype.string(),
          description: faker.datatype.string(),
          image: `ipfs://${faker.datatype.uuid()}`,
          attributes: [{ value: faker.datatype.number() }],
        }),
      ).toThrow('[Metadata.tokenLevelMetadata] "attributes[0].trait_type" is required');
    });

    it('should throw error if attributes doesnt contains value property', () => {
      expect(() =>
        Metadata.OpenSeaTokenLevelStandard({
          name: faker.datatype.string(),
          description: faker.datatype.string(),
          image: `ipfs://${faker.datatype.uuid()}`,
          attributes: [{ trait_type: faker.datatype.string() }],
        }),
      ).toThrow('[Metadata.tokenLevelMetadata] "attributes[0].value" is required');
    });

    it('should throw error if animation_url is not an url', () => {
      expect(() =>
        Metadata.OpenSeaTokenLevelStandard({
          name: faker.datatype.string(),
          description: faker.datatype.string(),
          image: `ipfs://${faker.datatype.uuid()}`,
          attributes: [{ value: faker.datatype.number(), trait_type: faker.datatype.string() }],
          animation_url: faker.datatype.string(),
        }),
      ).toThrow(
        '[Metadata.tokenLevelMetadata] "animation_url" must be a valid uri with a scheme matching the ipfs|https? pattern',
      );
    });
  });

  describe('createContractMetadata', () => {
    it('should throw error if name not provided', () => {
      expect(() => Metadata.OpenSeaCollectionLevelStandard({})).toThrow(
        '[Metadata.contractLevelMetadata] "name" is required',
      );
    });

    it('should throw error if description is not provided', () => {
      expect(() =>
        Metadata.OpenSeaCollectionLevelStandard({ name: faker.datatype.string() }),
      ).toThrow('[Metadata.contractLevelMetadata] "description" is required');
    });

    it('should throw error if image is not provided', () => {
      expect(() =>
        Metadata.OpenSeaCollectionLevelStandard({
          name: faker.datatype.string(),
          description: faker.datatype.string(),
        }),
      ).toThrow('[Metadata.contractLevelMetadata] "image" is required');
    });

    it('should throw error if external_link is not an url', () => {
      expect(() =>
        Metadata.OpenSeaCollectionLevelStandard({
          name: faker.datatype.string(),
          description: faker.datatype.string(),
          image: faker.internet.url(),
          external_link: faker.datatype.string(),
        }),
      ).toThrow(
        '[Metadata.contractLevelMetadata] "external_link" must be a valid uri with a scheme matching the ipfs|https? pattern',
      );
    });

    it('should throw error if external_link is not an url', () => {
      expect(() =>
        Metadata.OpenSeaCollectionLevelStandard({
          name: faker.datatype.string(),
          description: faker.datatype.string(),
          image: faker.internet.url(),
          external_link: faker.datatype.string(),
        }),
      ).toThrow(
        '[Metadata.contractLevelMetadata] "external_link" must be a valid uri with a scheme matching the ipfs|https? pattern',
      );
    });

    it('should throw error if fee_recipient is not a number', () => {
      expect(() =>
        Metadata.OpenSeaCollectionLevelStandard({
          name: faker.datatype.string(),
          description: faker.datatype.string(),
          image: faker.internet.url(),
          external_link: faker.internet.url(),
          fee_recipient: faker.datatype.string(),
        }),
      ).toThrow('[Metadata.contractLevelMetadata] "fee_recipient" must be a number');
    });
  });

  describe('createFreeMetadata', () => {
    it('should throw error if metadata is not an object', () => {
      expect(() => Metadata.freeLevelMetadata(1)).toThrow(
        '[Metadata.tokenLevelMetadata] "value" must be of type object',
      );
    });

    it('should throw error if free metadata is not an object', () => {
      expect(() => Metadata.freeLevelMetadata('test')).toThrow(
        '[Metadata.tokenLevelMetadata] "value" must be of type object',
      );
    });

    it('should create free metadata', () => {
      const metadata = Metadata.freeLevelMetadata({ key: 'test' });
      expect(metadata).not.toBe(null);
    });
  });
});
