import { ethers } from 'ethers';

export class Signer {
  static fromPrivateKeyAndProvider(privateKey, provider) {
    return new ethers.Wallet(privateKey, provider);
  }
}
