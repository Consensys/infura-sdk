import HttpService from '../services/httpService';
// Mock Post Endpoint
const pushHttpService = jest.spyOn(HttpService.prototype, 'post').mockImplementation(() => {});

let instance;
describe('httpService', () => {
  beforeAll(() => {
    instance = new HttpService();
  });

  it('should GET using axios', async () => {
    const res = await instance.get('https://swapi.dev/api/people/1');
    expect(res.status).toBe(200);
  });

  it('should POST using axios', async () => {
    const res = await instance.post('https://swapi.dev/api/people/1');
    expect(pushHttpService).toHaveBeenCalled();
  });
});
