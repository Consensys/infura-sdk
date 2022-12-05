import Metadata from '../src/lib/Metadata/Metadata';
import { faker } from '@faker-js/faker';
import version from '../src/_version';

describe('Metadata', () => {
  describe('createTokenMetadata', () => {
    it('should throw error if image is not url', () => {
      expect(() =>
        Metadata.openSeaTokenLevelStandard({
          name: faker.datatype.string(),
          description: faker.datatype.string(),
          image: faker.datatype.string(),
        }),
      ).toThrow(
        `"image" must be a valid uri with a scheme matching the ipfs|https? pattern (location=\"[Metadata.tokenLevelMetadata]\", error=\"\\\"image\\\" must be a valid uri with a scheme matching the ipfs|https? pattern\", code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('should not throw error if image is url', () => {
      const data = Metadata.openSeaTokenLevelStandard({
        name: faker.datatype.string(),
        description: faker.datatype.string(),
        image: faker.internet.url(),
        attributes: [],
      });

      expect(data).not.toBe(null);
    });

    it('should not throw error if image is ipfs link', () => {
      const data = Metadata.openSeaTokenLevelStandard({
        name: faker.datatype.string(),
        description: faker.datatype.string(),
        image: `ipfs://${faker.datatype.uuid()}`,
        attributes: [],
      });
      expect(data).not.toBe(null);
    });

    it('should throw error if animation_url is not an url', () => {
      expect(() =>
        Metadata.openSeaTokenLevelStandard({
          name: faker.datatype.string(),
          description: faker.datatype.string(),
          image: `ipfs://${faker.datatype.uuid()}`,
          attributes: [{ value: faker.datatype.number(), trait_type: faker.datatype.string() }],
          animation_url: faker.datatype.string(),
        }),
      ).toThrow(
        `"animation_url" must be a valid uri with a scheme matching the ipfs|https? pattern (location=\"[Metadata.tokenLevelMetadata]\", error=\"\\\"animation_url\\\" must be a valid uri with a scheme matching the ipfs|https? pattern\", code=INVALID_ARGUMENT, version=${version})`,
      );
    });
  });

  describe('createContractMetadata', () => {
    it('should throw error if external_link is not an url', () => {
      expect(() =>
        Metadata.openSeaCollectionLevelStandard({
          name: faker.datatype.string(),
          description: faker.datatype.string(),
          image: faker.internet.url(),
          external_link: faker.datatype.string(),
        }),
      ).toThrow(
        `"external_link" must be a valid uri with a scheme matching the ipfs|https? pattern (location=\"[Metadata.contractLevelMetadata]\", error=\"\\\"external_link\\\" must be a valid uri with a scheme matching the ipfs|https? pattern\", code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('should throw error if external_link is not an url', () => {
      expect(() =>
        Metadata.openSeaCollectionLevelStandard({
          name: faker.datatype.string(),
          description: faker.datatype.string(),
          image: faker.internet.url(),
          external_link: faker.datatype.string(),
        }),
      ).toThrow(
        `"external_link" must be a valid uri with a scheme matching the ipfs|https? pattern (location=\"[Metadata.contractLevelMetadata]\", error=\"\\\"external_link\\\" must be a valid uri with a scheme matching the ipfs|https? pattern\", code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('should throw error if fee_recipient is not a number', () => {
      expect(() =>
        Metadata.openSeaCollectionLevelStandard({
          name: faker.datatype.string(),
          description: faker.datatype.string(),
          image: faker.internet.url(),
          external_link: faker.internet.url(),
          fee_recipient: faker.datatype.string(),
        }),
      ).toThrow(
        `"fee_recipient" must be a number (location=\"[Metadata.contractLevelMetadata]\", error=\"\\\"fee_recipient\\\" must be a number\", code=INVALID_ARGUMENT, version=${version})`,
      );
    });
  });

  describe('createFreeMetadata', () => {
    it('should throw error if metadata is not an object', () => {
      expect(() => Metadata.freeLevelMetadata(1)).toThrow(
        `"value" must be of type object (location=\"[Metadata.freeLevelMetadata]\", error=\"\\\"value\\\" must be of type object\", code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('should throw error if free metadata is not an object', () => {
      expect(() => Metadata.freeLevelMetadata('test')).toThrow(
        `"value" must be of type object (location=\"[Metadata.freeLevelMetadata]\", error=\"\\\"value\\\" must be of type object\", code=INVALID_ARGUMENT, version=${version})`,
      );
    });

    it('should create free metadata', () => {
      const metadata = Metadata.freeLevelMetadata({ key: 'test' });
      expect(metadata).not.toBe(null);
    });
  });
});
