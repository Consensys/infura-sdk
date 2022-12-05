import HttpService from '../src/services/httpService';
import version from '../src/_version';

// Constant
const BASEURL = 'http://base.url.com';
const APIKEY = 'APIKEY';

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

describe('httpService', () => {
  it('should throw when args are missing (baseURL)', async () => {
    expect(() => new HttpService('', APIKEY)).toThrow(
      `missing argument: No baseURL supplied (location=\"[httpService.constructor]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('should throw when args are missing (apiKey)', async () => {
    expect(() => new HttpService(BASEURL, '')).toThrow(
      `missing argument: No API Key supplied (location=\"[httpService.constructor]\", code=MISSING_ARGUMENT, version=${version})`,
    );
  });

  it('should throw GET using axios', async () => {
    _mock.get.mockImplementationOnce(() => {
      throw Error('test');
    });

    const instance = new HttpService(BASEURL, APIKEY);
    const res = async () => await instance.get('/api/people/1');
    expect(res).rejects.toThrow(
      `An Axios error occured (location=\"[httpService.get]\", error={}, code=[API.ERROR], version=${version})`,
    );
  });

  it('should GET using axios', async () => {
    const instance = new HttpService(BASEURL, APIKEY);
    const res = await instance.get('/api/people/1');
    expect(_mock.get).toHaveBeenCalled();
  });

  it('should POST using axios', async () => {
    const instance = new HttpService(BASEURL, APIKEY);
    await instance.post('/api/people/1');
    expect(_mock.post).toHaveBeenCalled();
  });

  it('should throw POST using axios', async () => {
    _mock.post.mockImplementationOnce(() => {
      throw Error('test');
    });

    const instance = new HttpService(BASEURL, APIKEY);
    const res = async () => await instance.post('/api/people/1');
    expect(res).rejects.toThrow(
      `An Axios error occured (location=\"[httpService.post]\", error={}, code=[API.ERROR], version=${version})`,
    );
  });
});
