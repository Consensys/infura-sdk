import { config as loadEnv } from 'dotenv';

import axios from 'axios';

loadEnv();

describe('E2E Test: Sdk (read)', () => {
  // fix to avoid axios open handle
  beforeEach(async () => {
    await process.nextTick(() => {});
  });

  describe('It should get gas price from gasstation', () => {
    it('Should resolve gassation url correctly', async () => {
      const { data } = await axios({
        method: 'get',
        url: 'https://gasstation.polygon.technology/v2',
      });
      const gas = data.fast;
      expect(gas).toBeDefined;
      expect(gas).toMatchObject({
        maxPriorityFee: expect.anything(),
        maxFee: expect.anything(),
      });
    });
  });
});
