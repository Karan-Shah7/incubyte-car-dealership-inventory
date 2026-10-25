const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateTestConfig, loadTestEnvironment, verifyTestDatabase } = require('./test-environment.cjs');

const valid = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://incubyte_test_runner:test-only@localhost:5432/incubyte_ot_test_20261025?schema=public',
  JWT_SECRET: 'a-test-only-secret-with-at-least-32-characters',
};
test('accepts only the approved test target', () => assert.doesNotThrow(() => validateTestConfig(valid)));
for (const [label, url] of Object.entries({
  development: valid.DATABASE_URL.replace('incubyte_ot_test_20261025', 'car_dealership'),
  existingTest: valid.DATABASE_URL.replace('incubyte_ot_test_20261025', 'car_dealership_test'),
  host: valid.DATABASE_URL.replace('localhost', 'remote.example'),
  port: valid.DATABASE_URL.replace('5432', '5433'),
  user: valid.DATABASE_URL.replace('incubyte_test_runner', 'postgres'),
  schema: valid.DATABASE_URL.replace('public', 'other'),
  options: valid.DATABASE_URL + '&host=remote.example',
  malformed: 'not-a-url',
})) {
  test(`rejects incorrect ${label} without exposing connection details`, () => {
    assert.throws(() => validateTestConfig({ ...valid, DATABASE_URL: url }), error =>
      error.message === 'Unsafe test database configuration');
  });
}
test('rejects missing required configuration', () => {
  for (const key of Object.keys(valid)) {
    const config = { ...valid }; delete config[key];
    assert.throws(() => validateTestConfig(config));
  }
});
test('fails closed when the test configuration file is missing', () => {
  assert.throws(() => loadTestEnvironment('does-not-exist.env', {}), /Test configuration unavailable/);
});
test('refuses an inherited development connection', () => {
  assert.throws(() => loadTestEnvironment(undefined, { DATABASE_URL: 'postgresql://postgres:secret@localhost:5432/car_dealership' }, () => valid), /Conflicting database configuration/);
});
test('loads validated configuration before the caller initializes Prisma', () => {
  const target = {};
  loadTestEnvironment(undefined, target, () => valid);
  assert.equal(target.DATABASE_URL, valid.DATABASE_URL);
  assert.equal(target.NODE_ENV, 'test');
});
test('requires the live database identity and restricted role before cleanup', async () => {
  const identity = { database: 'incubyte_ot_test_20261025', username: 'incubyte_test_runner', port: 5432, address: '127.0.0.1', superuser: false, createdb: false, createrole: false, replication: false, bypassrls: false };
  await verifyTestDatabase({ $queryRawUnsafe: async () => [identity] });
  for (const patch of [{ database: 'car_dealership' }, { username: 'postgres' }, { port: 5433 }, { address: '192.0.2.1' }, { superuser: true }, { createdb: true }, { createrole: true }, { replication: true }, { bypassrls: true }]) {
    await assert.rejects(verifyTestDatabase({ $queryRawUnsafe: async () => [{ ...identity, ...patch }] }), /Unsafe live test database/);
  }
});
