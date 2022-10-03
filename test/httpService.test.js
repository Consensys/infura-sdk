import { HttpService } from '../src/services/httpService';

// Constant
const BASEURL = 'http://base.url.com';
const APIKEY = 'APIKEY';

const mockAxios = {
  get: jest.fn(),
  delete: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
};
jest.mock('axios', () => {
  return {
    create: () => mockAxios,
  };
});

describe('httpService', () => {
  let httpService;

  beforeAll(async () => {
    httpService = new HttpService(BASEURL, APIKEY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should throw when args are missing (baseURL)', async () => {
    expect(() => new HttpService(null, APIKEY)).toThrow(
      '[httpService.constructor] baseURL is missing!',
    );
  });

  it('should throw when args are missing (apiKey)', async () => {
    expect(() => new HttpService(BASEURL, null)).toThrow(
      '[httpService.constructor] apiKey is missing!',
    );
  });

  it('should GET using axios', async () => {
    mockAxios.get.mockResolvedValueOnce({
      status: 200,
    });

    const res = await httpService.get('/api/people/1');
    expect(res.status).toBe(200);
    expect(mockAxios.get).toHaveBeenCalled();
  });

  it('should not  GET using axios for invalid url', async () => {
    mockAxios.get.mockImplementationOnce(() => {
      throw new Error();
    });
    expect(async () => await httpService.get('//test')).rejects.toThrow();
  });

  it('should POST using axios', async () => {
    mockAxios.post.mockResolvedValueOnce({
      status: 200,
    });
    const res = await httpService.post('/api/people/1');

    expect(res.status).toBe(200);
    expect(mockAxios.post).toHaveBeenCalled();
  });

  it('should not POST using axios for invalid url', async () => {
    mockAxios.post.mockImplementationOnce(() => {
      throw new Error();
    });
    expect(async () => await httpService.post('//test')).rejects.toThrow();
  });
});
