import Joi from 'joi';
import { TEMPLATES } from '../NFT/constants';

export const deployOptions = Joi.object({
  template: Joi.string().valid(...Object.values(TEMPLATES)),
  params: Joi.object({
    name: Joi.string().required(),
    symbol: Joi.string().required(),
    contractURI: Joi.string()
      .uri({
        scheme: ['ipfs', /https?/],
      })
      .required(),
    gas: Joi.string().optional(),
  }),
}).required();

export const loadContractOptions = Joi.object({
  template: Joi.string().valid(...Object.values(TEMPLATES)),
  contractAddress: Joi.string().required(),
}).required();

export const metadataSchema = Joi.object({
  metadata: Joi.string().required(),
}).required();

export const metadataFolderSchema = Joi.object({
  metadata: Joi.array().items(Joi.string()).required(),
}).required();
