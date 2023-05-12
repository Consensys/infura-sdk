import IpfsServerClient from '../e2e/utils/utils.ts/ipfsServerClient';
import version from '../src/_version';

// Mock Endpoint
const _mock = {
  get: jest.fn(),
  delete: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
};
jest.mock('axios', () => {
  return {
    create: (): unknown => _mock,
  };
});

const BASEURL = 'http://base.url.com';
const projectId = 'ProjectId';
const apiKeySecret = 'ApiKeySecret';
describe('IpfsServerClient', () => {
  it('should throw when args are missing (baseURL)', async () => {
    expect(() => new IpfsServerClient({ baseURL: '', projectId, apiKeySecret })).toThrow(
      `missing argument: No baseURL supplied (location=\"[IPFS.constructor]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('should throw when args are missing (projectId)', async () => {
    expect(() => new IpfsServerClient({ baseURL: BASEURL, projectId: '', apiKeySecret })).toThrow(
      `missing argument: No project id supplied. (location=\"[IPFS.constructor]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('should fail to add file', async () => {
    _mock.post.mockImplementationOnce(() => {
      throw Error('test');
    });

    const instance = new IpfsServerClient({ baseURL: BASEURL, projectId, apiKeySecret });
    const res = async () => await instance.add('test');
    expect(res).rejects.toThrow(
      `An error occured with infura ipfs api (location=\"[IPFS.uploadFile]\", error=\"Error: test\", argument=\"file\", value=\"test\", code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('should succeed to add file', async () => {
    _mock.post.mockImplementationOnce(() => ({
      data: {
        Hash: 'Hash',
      },
    }));

    const instance = new IpfsServerClient({ baseURL: BASEURL, projectId, apiKeySecret });
    const res = await instance.add('test');
    expect(_mock.post).toHaveBeenCalled();
    expect(res).toBe('Hash');
  });

  it('should fail to add all files', async () => {
    _mock.post.mockImplementationOnce(() => {
      throw Error('test');
    });

    const instance = new IpfsServerClient({ baseURL: BASEURL, projectId, apiKeySecret });
    const res = async () => await instance.addAll([{ path: 'test', content: 'test' }]);
    expect(res).rejects.toThrow(
      `An error occured with infura ipfs api (location=\"[IPFS.uploadFile]\", error=\"Error: test\", argument=\"file\", value=[{\"path\":\"test\",\"content\":\"test\"}], code=INVALID_ARGUMENT, version=${version})`,
    );
  });

  it('should succeed to add all files', async () => {
    _mock.post.mockImplementationOnce(() => ({
      data: `{"Hash": "Hash"}`,
    }));

    const instance = new IpfsServerClient({ baseURL: BASEURL, projectId, apiKeySecret });
    const res = await instance.addAll([{ path: 'test', content: 'test' }]);
    expect(_mock.post).toHaveBeenCalled();
    expect(res).toBe('Hash');
  });
});
