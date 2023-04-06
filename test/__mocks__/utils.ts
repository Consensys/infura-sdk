import { randomBytes } from 'crypto';

export const ACCOUNT_ADDRESS = '0x11d8d42e8dd3b9954bb7138b0f0b2e9214827002';
export const CONTRACT_ADDRESS = '0x97ed63533c9f4f50521d78e58caeb94b175f5d35';
export const CONTRACT_ADDRESS_2 = '0x1A92f7381B9F03921564a437210bB9396471050C';

export const generateTestPrivateKeyOrHash = (): string => {
  return `0x${randomBytes(32).toString('hex')}`;
};
export const ACCOUNT_ADDRESS_2 = '0x077f655630329c0de9fe02e715d9d4ddacaa2cbc';
