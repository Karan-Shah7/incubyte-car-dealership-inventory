# Step 1 verification

Date: 25 October 2026 (Asia/Calcutta). Results below were observed during this
inspection and implementation session, not copied from historical reports.

## Database protection

- Created only the approved `incubyte_ot_test_20261025` database and restricted
  `incubyte_test_runner` login on `localhost:5432`.
- Applied only `20261024144718_init_user_and_vehicle` using `prisma migrate deploy`.
  No migration source files were changed and no reset or drop was performed.
- Saved newly generated test-only credentials in ignored `backend/.env.test`.
  Neither development nor test environment files are tracked by Git.
- Verified the live database, login, loopback server address, port and absence of
  superuser, database-creation, role-creation, replication and RLS-bypass powers.
- Verified the login has no application-table privileges or schema-creation
  privileges in `car_dealership` or `car_dealership_test`.
- Verified missing configuration and invalid targets are rejected by safety tests.
  A real Jest run with a conflicting development target failed in setup with
  **zero tests executed**, before test modules and cleanup hooks were loaded.
- Compared both protected databases after testing with a baseline captured before
  provisioning. Public-table inventories, row counts and content fingerprints
  matched. Fingerprints were calculated inside PostgreSQL without exposing rows.

## Observed Red and Green results

| Change | Observed Red | Observed Green |
|---|---|---|
| Isolation safeguards | Safety module missing | 14 safety checks passed |
| Public registration | 2 failures: ADMIN returned instead of USER | 11 auth tests passed |
| Stock-update authorization | 2 failures: 200 returned instead of 403 | 35 vehicle/inventory tests passed |
| JWT secret requirement | 3 failures: missing/blank secrets accepted | 15 config/auth tests passed |
| Strict search prices | 14 failures: malformed ranges returned 200/500 | 43 vehicle tests passed |

Each security fix has a separate failing-test commit followed by a passing
implementation commit. The confirmed trailer is
`Co-authored-by: OpenAI Codex <codex@openai.com>`.
Changes were reviewed for refactoring; shared price validation avoids duplicated
parsing, and quantity authorization reuses the existing admin middleware.

The original 39 tests passed against the isolated database before security fixes.
The pre-existing vehicle quantity-update test now uses an administrator; added
tests preserve ordinary-user detail editing and verify rejected stock edits leave
the entire record unchanged.

## Final commands and results

Run from `backend`:

| Command | Observed result |
|---|---|
| `npm run test:coverage` | 14 safety tests passed; 71 Jest tests passed in 5 suites |
| `node node_modules/typescript/bin/tsc --noEmit` | Exit 0; no diagnostics |
| `node scripts/check-test-database.cjs` | All live identity, permission and migration checks passed |

| Jest coverage metric | Result |
|---|---:|
| Statements | 91.72% |
| Branches | 66.66% |
| Functions | 97.82% |
| Lines | 91.89% |

Coverage applies to the configured `src/**/*.ts` files, excluding `src/server.ts`.
The 14 safety-script tests are counted separately and are not included in these
coverage percentages. Generated HTML/LCOV/JSON artifacts are under the ignored
`backend/coverage` directory. Controller error paths remain the main coverage gap.
Jest retains the pre-existing `forceExit` setting and prints its open-handle
diagnostic suggestion; this session did not investigate graceful test shutdown.

## Purchase concurrency review

The existing transaction retains its conditional `quantity > 0` update and atomic
decrement. The original two-buyers/one-unit test passes. An additional verification
test sends ten simultaneous purchases against three units: exactly three return
200, seven return 409, and final quantity is zero. This test verified existing
behavior; it is not claimed as a Red step for a new implementation. No transaction
isolation or purchase-service change was necessary.

## Scope

No frontend work, Git push, development-user provisioning, or edits to `PROMPTS.md`
were performed. Existing uncommitted handover/status/report files were preserved.
See `backend/TESTING.md` for the safe test workflow and security behavior.
