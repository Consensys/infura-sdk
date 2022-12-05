import ganache, { Server } from 'ganache';
let server: Server<'ethereum'>;

const options = {
  wallet: {
    accountKeysPath: 'integration-test/keys.json',
  },
  logging: {
    quiet: true,
  },
};
beforeAll(async () => {
  server = ganache.server(options);
  await server.listen(8545);
});

afterAll(async () => {
  await server.close();
});
