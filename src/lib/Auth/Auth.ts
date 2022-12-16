/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */
import { ethers } from 'ethers';
import { availableChains } from './availableChains';
import Signer from '../Signer/Signer';
import Provider from '../Provider/Provider';
import { isValidString, formatRpcUrl } from '../utils';
import { Logger, log } from '../Logger';
import authSchema from './auth.schema';
import IPFS from '../../services/ipfsService';

type IPFSType = {
  projectId: string | undefined;
  apiKeySecret: string | undefined;
};
type AuthOptions = {
  privateKey?: string | undefined;
  projectId: string | undefined;
  secretId: string | undefined;
  rpcUrl?: string | undefined;
  chainId: number | undefined;
  provider?: ethers.providers.ExternalProvider | ethers.providers.JsonRpcFetchFunc;
  ipfs?: IPFSType;
};

export default class Auth {
  private privateKey;

  private projectId;

  private secretId;

  private rpcUrl;

  private provider: ethers.providers.BaseProvider | ethers.providers.Web3Provider;

  private chainId;

  private ipfs: IPFS;

  constructor(opts: AuthOptions) {
    if (!opts.privateKey && !opts.provider) {
      log.throwMissingArgumentError(Logger.message.no_pk_or_provider, {
        location: Logger.location.AUTH_CONSTRUCTOR,
      });
    }
    if (opts.privateKey && opts.provider) {
      log.throwTooManyArgumentError(Logger.message.only_privateKey_or_provider_required, {
        location: Logger.location.AUTH_CONSTRUCTOR,
      });
    }
    if (!availableChains.includes(<number>opts.chainId)) {
      log.throwArgumentError(Logger.message.chain_not_supported, 'chainId', opts.chainId, {
        location: Logger.location.AUTH_CONSTRUCTOR,
      });
    }

    const result = authSchema.validate(opts);

    if (result.error) {
      log.throwMissingArgumentError(result.error.details[0].message, {
        location: Logger.location.AUTH_CONSTRUCTOR,
      });
    }

    this.privateKey = opts.privateKey;
    this.projectId = opts.projectId;
    this.secretId = opts.secretId;
    this.chainId = opts.chainId;
    this.rpcUrl = opts.rpcUrl;

    if (!isValidString(this.rpcUrl)) {
      this.rpcUrl = formatRpcUrl({
        chainId: <number>this.chainId,
        projectId: <string>this.projectId,
      });
    }

    if (opts.ipfs) {
      this.ipfs = new IPFS({
        projectId: opts.ipfs?.projectId,
        apiKeySecret: opts.ipfs?.apiKeySecret,
      });
    }

    this.setProvider(opts.provider);
  }

  getChainId() {
    return this.chainId;
  }

  getRpcUrl() {
    return this.rpcUrl;
  }

  getApiAuthHeader() {
    return {
      Authorization: `Basic ${this.base64encode()}`,
    };
  }

  private base64encode() {
    return Buffer.from(`${this.projectId}:${this.secretId}`).toString('base64');
  }

  getIpfsClient() {
    return this.ipfs;
  }

  getApiAuth() {
    return this.base64encode();
  }

  getSigner(): ethers.Wallet | ethers.providers.JsonRpcSigner {
    if (this.privateKey) {
      return Signer.getWallet(this.privateKey, this.provider);
    }
    return (this.provider as ethers.providers.Web3Provider).getSigner();
  }

  setProvider(
    provider: ethers.providers.ExternalProvider | ethers.providers.JsonRpcFetchFunc | undefined,
  ) {
    if (provider instanceof ethers.providers.InfuraProvider) {
      log.throwArgumentError(
        Logger.message.unsupported_provider,
        'provider',
        'ethers.providers.InfuraProvider',
        {
          location: Logger.location.AUTH_SET_PROVIDER,
          error: Logger.message.unsupported_provider,
        },
      );
      return;
    }
    if (this.privateKey) {
      this.provider = Provider.getProvider(this.rpcUrl);
      return;
    }
    if (provider) {
      this.provider = Provider.getInjectedProvider(provider);
    }
  }
}
