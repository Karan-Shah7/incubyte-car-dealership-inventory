const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

const configPath = path.resolve(__dirname, '../.env.test');
function validateTestConfig(config) {
  try {
    const url = new URL(config.DATABASE_URL);
    if (config.NODE_ENV !== 'test' || !config.JWT_SECRET || config.JWT_SECRET.length < 32 ||
        url.protocol !== 'postgresql:' || url.hostname !== 'localhost' || url.port !== '5432' ||
        url.pathname !== '/incubyte_ot_test_20261025' || url.username !== 'incubyte_test_runner' ||
        !url.password || url.search !== '?schema=public' || url.hash) throw new Error();
  } catch {
    // Never echo connection strings, passwords or parsing errors.
    throw new Error('Unsafe test database configuration');
  }
  return config;
}

function loadTestEnvironment(file = configPath, target = process.env, readConfig = p => dotenv.parse(fs.readFileSync(p))) {
  let config;
  try { config = readConfig(file); } catch { throw new Error('Test configuration unavailable'); }
  validateTestConfig(config);
  if (target.DATABASE_URL && target.DATABASE_URL !== config.DATABASE_URL) {
    throw new Error('Conflicting database configuration');
  }
  for (const key of ['DATABASE_URL', 'JWT_SECRET', 'JWT_EXPIRES_IN', 'NODE_ENV']) {
    if (config[key] !== undefined) target[key] = config[key];
  }
  return config;
}

async function verifyTestDatabase(prisma) {
  const rows = await prisma.$queryRawUnsafe(`SELECT current_database() AS database,
    current_user AS username, inet_server_port() AS port, host(inet_server_addr()) AS address,
    rolsuper AS superuser, rolcreatedb AS createdb, rolcreaterole AS createrole,
    rolreplication AS replication, rolbypassrls AS bypassrls
    FROM pg_roles WHERE rolname = current_user`);
  const row = rows[0];
  if (rows.length !== 1 || row.database !== 'incubyte_ot_test_20261025' ||
      row.username !== 'incubyte_test_runner' || row.port !== 5432 ||
      !['127.0.0.1', '::1'].includes(row.address) ||
      [row.superuser, row.createdb, row.createrole, row.replication, row.bypassrls].some(value => value !== false)) {
    throw new Error('Unsafe live test database');
  }
}

module.exports = { validateTestConfig, loadTestEnvironment, verifyTestDatabase };
