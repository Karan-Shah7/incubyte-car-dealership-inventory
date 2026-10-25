const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { loadTestEnvironment, verifyTestDatabase } = require('./test-environment.cjs');

async function main() {
  const config = loadTestEnvironment();
  const { PrismaClient } = require('@prisma/client');
  const testDb = new PrismaClient({ datasourceUrl: config.DATABASE_URL });
  try {
    await verifyTestDatabase(testDb);
    console.log('PASS: live test database, localhost address, port and restricted login verified.');
    for (const name of ['car_dealership', 'car_dealership_test']) {
      const url = new URL(config.DATABASE_URL);
      url.pathname = `/${name}`;
      const protectedDb = new PrismaClient({ datasourceUrl: url.toString() });
      try {
        // Read PostgreSQL permission metadata only, never application records.
        const grants = await protectedDb.$queryRawUnsafe(`SELECT
          has_database_privilege(current_user, current_database(), 'CREATE') AS can_create,
          has_schema_privilege(current_user, 'public', 'CREATE') AS can_create_in_schema,
          EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') AND
            has_table_privilege(current_user, c.oid,
            'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')) AS can_access_tables`);
        if (grants.some(row => Object.values(row).some(Boolean))) throw new Error('Protected database privileges are too broad');
        console.log(`PASS: test login has no application-table privileges or schema creation privileges in ${name}.`);
      } finally { await protectedDb.$disconnect(); }
    }
    if (process.argv.includes('--migrate')) {
      const result = spawnSync(process.execPath, [path.resolve(__dirname, '../node_modules/prisma/build/index.js'),
        'migrate', 'deploy', '--schema', 'prisma/schema.prisma'], {
        cwd: path.resolve(__dirname, '..'), env: process.env, encoding: 'utf8',
      });
      if (result.status !== 0) throw new Error('Approved test migration failed');
      console.log('PASS: migrate deploy completed against the verified test target.');
    }
    const migrations = await testDb.$queryRawUnsafe('SELECT migration_name, finished_at IS NOT NULL AS applied FROM _prisma_migrations');
    if (migrations.length !== 1 || migrations[0].migration_name !== '20261024144718_init_user_and_vehicle' || !migrations[0].applied) {
      throw new Error('Unexpected test migration state');
    }
    console.log('PASS: only the existing migration is applied.');
  } finally { await testDb.$disconnect(); }
}
main().catch(() => { console.error('Test database verification failed; no tests should run. Connection details suppressed.'); process.exitCode = 1; });
