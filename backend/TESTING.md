# Backend test safety

Automated tests use only `incubyte_ot_test_20261025` on `localhost:5432`, schema
`public`, with the restricted PostgreSQL login `incubyte_test_runner`.
The development databases `car_dealership` and `car_dealership_test` are not test
targets. Do not point automated tests or cleanup at them.

The approved test database is already provisioned on this machine. Its private
configuration is in `.env.test`, which Git ignores. `.env.test.example` documents
the required variables using placeholders; it is not a working configuration.
Do not copy development credentials into the test configuration. Provisioning a
database on another machine requires a deliberate setup step; test commands never
create, reset, migrate, or drop databases automatically.

From this directory:

```powershell
npm run test:safety
npm run test:database
npm test
npm run test:coverage
node node_modules/typescript/bin/tsc --noEmit
```

`test:safety` runs configuration and live-identity guard tests without database
access. `test:database` checks the real test identity, restricted role, existing
migration, and lack of application-table privileges in both protected databases.
It reads permission metadata only in those protected databases.

Jest awaits `scripts/jest-setup.cjs` before importing any test module. That setup
loads and validates `.env.test`, creates a client with an explicit test datasource,
and verifies the server address, port, database and login against the approved
target. A missing file, invalid target, conflicting inherited `DATABASE_URL`, or
unsafe live identity stops execution before test cleanup hooks are registered.
The application Prisma singleton independently validates and pins the same test
datasource before initialization. Tests do not load the development `.env`.

Existing cleanup hooks delete disposable test records. They are safe only behind
these guards and the restricted database login. Do not bypass the setup or switch
tests to an administrative connection. The safety scripts are measured separately
from Jest's `src/**/*.ts` coverage report.

`check-test-database.cjs --migrate` is a manual, guarded wrapper for applying
existing migrations. It must only be run after explicit approval of the database
target and migration action. Do not use it as a routine test command.

## Security behavior

- Public registration ignores client-supplied roles. The service always creates
  `USER` accounts, including when called directly with an unvalidated payload.
- No public administrator-provisioning endpoint exists. An authorized database
  administrator can intentionally provision an administrator through a separately
  reviewed database operation. Tests provision admin fixtures only in the isolated
  database. No development users were promoted by this work.
- An ordinary user may update vehicle details but cannot include `quantity` in
  an update. That operation requires an administrator and valid integer stock.
- `JWT_SECRET` must be explicitly configured and nonblank. There is no fallback.
- Search prices accept finite nonnegative decimal strings, including zero and
  fractional values. Invalid strings and reversed ranges return validation errors.
- Purchases retain the existing transaction and conditional decrement. Tests
  cover two buyers competing for one unit and ten buyers competing for three.
