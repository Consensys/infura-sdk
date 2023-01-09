import Joi from 'joi';

export const tokenMetadataSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.string()
    .uri({
      scheme: ['ipfs', /https?/],
    })
    .required(),
  attributes: Joi.array()
    .items(
      Joi.object({
        display_type: Joi.string().optional(),
        trait_type: Joi.string().required(),
        value: [Joi.number().required(), Joi.string().required()],
      }).optional(),
    )
    .required(),
  external_url: Joi.string()
    .uri({
      scheme: ['ipfs', /https?/],
    })
    .optional(),
  animation_url: Joi.string()
    .uri({
      scheme: ['ipfs', /https?/],
    })
    .optional(),
  background_color: Joi.string().optional(),
  youtube_url: Joi.string()
    .uri({
      scheme: [/https?/],
    })
    .optional(),
}).required();

export const contractMetadataSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.string()
    .uri({
      scheme: ['ipfs', /https?/],
    })
    .required(),
  external_link: Joi.string()
    .uri({
      scheme: ['ipfs', /https?/],
    })
    .optional(),
  seller_fee_basis_points: Joi.number().optional(),
  fee_recipient: Joi.number().optional(),
}).required();

export const freeMetadataSchema = Joi.object().required();
