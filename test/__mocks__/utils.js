import { randomBytes } from 'crypto';

export const ACCOUNT_ADDRESS = '0xE26a682fa90322eC48eB9F3FA66E8961D799177C';
export const CONTRACT_ADDRESS = '0x97ed63533c9f4f50521d78e58caeb94b175f5d35';

export const generateTestPrivateKey = () => {
  return `0x${randomBytes(32).toString('hex')}`;
};
