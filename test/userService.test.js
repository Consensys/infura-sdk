import { UserService } from '../services/userService';

let instance;
describe('userService', () => {
  beforeEach(() => {
    instance = new UserService();
    process.env.PRIVATE_KEY = '';
  });

  it('should return a private key if it is set in env vars', () => {
    process.env.PRIVATE_KEY = 'PKSET';
    const pk = instance.privateKey;
    expect(pk).toBe('PKSET');
  });

  it('should return NULL if private key is not set in env vars', () => {
    const instance = new UserService();
    const pk = instance.privateKey;
    expect(pk).toBeNull();
  });
});
