import Joi from 'joi';

export default Joi.object({
  privateKey: Joi.string().optional(),
  apiKey: Joi.string().required(),
  rpcUrl: Joi.string()
    .uri({
      scheme: [/https?/],
    })
    .optional(),
  chainId: Joi.number().required(),
  provider: Joi.any().optional(),
  ipfs: Joi.object({
    projectId: Joi.string().optional(),
    apiKeySecret: Joi.string().optional(),
  }).optional(),
});
