import { errorLogger, ERROR_LOG } from '../error/handler.js';
import {
  contractMetadataSchema,
  freeMetadataSchema,
  tokenMetadataSchema,
} from './metadata.schema.js';

export default class Metadata {
  /**
   * Create token metadata
   * @param {string} name Name of the token
   * @param {string} description description of the token
   * @param {string} image link to the image URL
   * @param {Array} attributes The attributes of the token
   * @param {string} external_url The external link of the token
   * @param {string} animation_url Link to the animation such as music, video
   * @param {string} background_color The background color of the token
   * @param {string} youtube_url The youtube url of the token
   * @returns string
   */
  static openSeaTokenLevelStandard({
    name,
    description,
    image,
    attributes,
    external_url = null,
    animation_url = null,
    background_color = null,
    youtube_url = null,
  }) {
    const tokenMetadata = {
      name,
      description,
      image,
      attributes,
    };

    if (animation_url) {
      tokenMetadata.animation_url = animation_url;
    }

    if (background_color) {
      tokenMetadata.background_color = background_color;
    }

    if (external_url) {
      tokenMetadata.external_url = external_url;
    }

    if (youtube_url) {
      tokenMetadata.youtube_url = youtube_url;
    }

    const result = tokenMetadataSchema.validate(tokenMetadata);

    if (result.error) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Metadata_token_creation,
          message: result.error.details[0].message,
        }),
      );
    }

    return JSON.stringify(tokenMetadata);
  }

  /**
   * Create contract metadata
   * @param {string} name Name of the contract
   * @param {string} description description of the contract
   * @param {string} image link to the image URL
   * @param {string} external_link The external link of the contract
   * @param {number} seller_fee_basis_points basis point for royalty
   * @param {number} fee_recipient free to for royalty recipient
   * @returns string
   */
  static openSeaCollectionLevelStandard({
    name,
    description,
    image,
    external_link = null,
    seller_fee_basis_points = null,
    fee_recipient = null,
  }) {
    const contractmetadata = {
      name,
      description,
      image,
    };

    if (external_link) {
      contractmetadata.external_link = external_link;
    }

    if (seller_fee_basis_points) {
      contractmetadata.seller_fee_basis_points = seller_fee_basis_points;
    }

    if (fee_recipient) {
      contractmetadata.fee_recipient = fee_recipient;
    }

    const result = contractMetadataSchema.validate(contractmetadata);

    if (result.error) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Metadata_contract_creation,
          message: result.error.details[0].message,
        }),
      );
    }
    return JSON.stringify(contractmetadata);
  }

  /**
   * Create free metadata
   * @param {object} metadata object of free metadata
   * @returns string
   */
  static freeLevelMetadata(metadata) {
    const result = freeMetadataSchema.validate(metadata);

    if (result.error) {
      throw new Error(
        errorLogger({
          location: ERROR_LOG.location.Metadata_token_creation,
          message: result.error.details[0].message,
        }),
      );
    }

    return JSON.stringify(metadata);
  }
}
