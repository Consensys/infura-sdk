import ganache from 'ganache';
let server;

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
