# AutoVault India — Car Dealership Inventory System

AutoVault India is a full-stack dealership inventory application built for the Incubyte OT TDD kata. It provides secure authentication, searchable vehicle inventory, concurrency-safe purchasing, and role-restricted administration in a responsive Stitch-based interface.

## Features

- Registration and JWT login with protected routes
- Responsive inventory dashboard with live, derived statistics
- Make, model, category, and price-range search
- Indian Rupee price formatting
- Confirmed purchasing with atomic stock decrement and sold-out handling
- Admin-only add, edit, delete, and restock workflows
- Accessible forms, dialogs, keyboard behavior, and loading/empty/error states
- Isolated PostgreSQL test environment with fail-closed identity safeguards
- Genuine Red → Green TDD commit history

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router |
| Frontend testing | Vitest, React Testing Library, User Event, MSW |
| Backend | Node.js, Express, TypeScript, Zod |
| Authentication | JWT, bcrypt |
| Data | PostgreSQL 17, Prisma ORM |
| Backend testing | Jest, Supertest |

## Architecture

```text
frontend/                       React SPA
  src/api/                      Centralized authenticated API clients
  src/auth/                     Session provider and authorization state
  src/components/               Reusable layouts, forms, dialogs, vehicle UI
  src/pages/                    Login, registration, dashboard, administration
  src/*.test.tsx                Behavior-driven frontend tests

backend/
  src/config/                   Validated environment configuration
  src/db/                       Guarded Prisma singleton
  src/middleware/               Authentication, authorization, validation
  src/modules/auth/             Registration, login, current user
  src/modules/vehicles/         CRUD, search, purchase, restock
  prisma/                       Schema and existing migration
  scripts/                      Isolated-test database safeguards
```

The browser stores the current JWT session in `sessionStorage`, which limits persistence to the browser tab but remains accessible to JavaScript. Production deployments should additionally use a strong Content Security Policy and consider an HTTP-only secure-cookie design if the backend contract is changed.

## Local setup

Requirements: Node.js 22+, npm, and PostgreSQL 17.

```powershell
git clone <your-repository-url>
cd <repository-folder>
cd backend
npm install
cd ..\frontend
npm install
```

### PostgreSQL and Prisma

Create a PostgreSQL database and configure `backend/.env`. Never commit this file.

```dotenv
DATABASE_URL="postgresql://APP_USER:APP_PASSWORD@localhost:5432/car_dealership?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
PORT="4000"
```

Generate the Prisma client and apply the existing migration:

```powershell
cd backend
npx prisma generate
npx prisma migrate deploy
```

Automated tests require a separately provisioned database. Copy variable names—not credentials—from `backend/.env.test.example`. The checked-in safeguards accept only the approved isolated target described in [backend/TESTING.md](backend/TESTING.md). Test commands never create, reset, migrate, or drop a database automatically.

Frontend configuration is optional when the backend runs at port 4000:

```dotenv
# frontend/.env.local
VITE_API_URL="http://localhost:4000"
```

### Start the application

In separate terminals:

```powershell
cd backend
npm run dev
```

```powershell
cd frontend
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Health check: `GET http://localhost:4000/api/health`

## REST API

All vehicle routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a regular user |
| POST | `/api/auth/login` | Authenticate and return a JWT |
| GET | `/api/auth/me` | Validate token and return current user |
| GET | `/api/vehicles` | List inventory |
| GET | `/api/vehicles/search` | Filter by `make`, `model`, `category`, `minPrice`, `maxPrice` |
| GET | `/api/vehicles/:id` | Get one vehicle |
| POST | `/api/vehicles` | Add a vehicle |
| PUT | `/api/vehicles/:id` | Edit vehicle details; stock edits require admin authority |
| DELETE | `/api/vehicles/:id` | Delete a vehicle (admin) |
| POST | `/api/vehicles/:id/purchase` | Atomically purchase one unit |
| POST | `/api/vehicles/:id/restock` | Add a positive stock amount (admin) |

## Testing

```powershell
cd backend
npm run test:safety
npm run test:database
npm test
npm run test:coverage
node node_modules/typescript/bin/tsc --noEmit

cd ..\frontend
npm test
npm run typecheck
npm run lint
npm run build
```

### Previously verified results

These results were recorded on **25 October 2026**; they are evidence from the completed verification run, not a claim that every command runs on each README view.

| Check | Result |
|---|---|
| Backend database-safety tests | 14/14 passed |
| Backend tests | 71/71 passed |
| Frontend tests | 29/29 passed |
| Backend coverage | 91.72% statements, 66.66% branches, 97.82% functions, 91.89% lines |
| Backend/frontend TypeScript | Passed |
| Frontend lint and production build | Passed |
| Real browser/API isolated-database integration | Passed |

See [test-report/TEST_REPORT.md](test-report/TEST_REPORT.md) for the verification record.

## Screenshots

### Login

![AutoVault login](screenshots/01-login.png)

### Registration

![AutoVault registration](screenshots/02-registration.png)

### Inventory dashboard

![Inventory dashboard](screenshots/03-inventory-dashboard.png)

### Search results

![Filtered vehicle results](screenshots/04-search-results.png)

### Purchase confirmation

![Purchase confirmation dialog](screenshots/05-purchase-confirmation.png)

### Admin inventory management

![Admin inventory management](screenshots/06-admin-inventory.png)

## My AI Usage

- **Google Antigravity:** Assisted with project planning and backend development.
- **Google Stitch:** Produced the visual design references used for the frontend UI.
- **OpenAI Codex:** Assisted with security fixes, isolated-test safeguards, TDD tests, React implementation, verification, and integration.
- **ChatGPT:** Assisted with planning, prompt preparation, review, and development guidance.

All generated work was reviewed and verified against the repository and actual test results. AI-assisted commits use explicit co-author trailers where required. Raw prompts and available interaction evidence are recorded in `PROMPTS.md`; missing raw transcripts must not be reconstructed from summaries.

> **Personal reflection placeholder:** Add your own brief reflection describing what you learned, which AI suggestions you accepted or rejected, and how you verified the final work before submission.

## Security and submission notes

- `.env`, `.env.test`, credentials, `node_modules`, coverage, and build output are excluded from Git.
- Public registration cannot assign the ADMIN role.
- Automated cleanup is guarded to the dedicated isolated test database.
- Publish the repository manually only after reviewing `git status`, completing the personal AI reflection, and supplying any missing raw AI logs or public chat links.
