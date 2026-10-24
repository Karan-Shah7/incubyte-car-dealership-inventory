# 🚗 Incubyte OT — Car Dealership Inventory System
## Inspection Findings & Phased Implementation Plan

---

## 1. Inspection Findings

### 1.1 Repository State
| Item | Finding |
|---|---|
| Git repo initialised | ❌ Not yet (`fatal: not a git repository`) |
| Existing source files | ❌ None — only the spec docx |
| Spec document | ✅ `AI_Kata_Car_Dealership_Inventory_System_V2.docx` (read & parsed) |

### 1.2 Host Tool Versions
| Tool | Version |
|---|---|
| Node.js | v22.16.0 |
| npm | 10.9.2 |
| Prisma CLI (global cache) | 7.10.1 |
| TypeScript | Not yet installed locally |

### 1.3 Key Spec Requirements Extracted
**Backend API (Express / TypeScript / PostgreSQL / Prisma / JWT / bcrypt / Zod)**

| Endpoint | Auth | Role |
|---|---|---|
| `POST /api/auth/register` | Public | — |
| `POST /api/auth/login` | Public | — |
| `POST /api/vehicles` | JWT | Any |
| `GET /api/vehicles` | JWT | Any |
| `GET /api/vehicles/search` | JWT | Any |
| `PUT /api/vehicles/:id` | JWT | Any |
| `DELETE /api/vehicles/:id` | JWT | Admin |
| `POST /api/vehicles/:id/purchase` | JWT | Any |
| `POST /api/vehicles/:id/restock` | JWT | Admin |

**Vehicle entity fields**: `id`, `make`, `model`, `category`, `price`, `quantity`

**Frontend**: React + Vite + Tailwind CSS (designed in Google Stitch, integrated later)

**Git discipline**: Red-Green-Refactor commit history; AI co-author trailer on every AI-assisted commit

**Deliverables**: Public GitHub repo, README.md (setup + screenshots + "My AI Usage"), test report, PROMPTS.md (raw AI chat logs)

---

## 2. Proposed Monorepo Folder Structure

```
car-dealership/
├── backend/
│   ├── src/
│   │   ├── app.ts                  # Express app factory
│   │   ├── server.ts               # Entry point
│   │   ├── config/
│   │   │   └── env.ts              # Zod-validated env
│   │   ├── db/
│   │   │   └── client.ts           # Prisma singleton
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.router.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.schema.ts  # Zod schemas
│   │   │   └── vehicles/
│   │   │       ├── vehicles.router.ts
│   │   │       ├── vehicles.controller.ts
│   │   │       ├── vehicles.service.ts
│   │   │       └── vehicles.schema.ts
│   │   └── middleware/
│   │       ├── authenticate.ts     # JWT middleware
│   │       └── requireAdmin.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── tests/
│   │   ├── auth.test.ts
│   │   ├── vehicles.test.ts
│   │   ├── purchase.test.ts
│   │   └── restock.test.ts
│   ├── jest.config.ts
│   ├── tsconfig.json
│   └── package.json
├── frontend/                        # React + Vite + Tailwind (Stitch design)
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/                    # Axios client
│   │   └── store/                  # Auth context / Zustand
│   ├── index.html
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   └── package.json
├── .gitignore
├── README.md
├── PROMPTS.md
└── docker-compose.yml              # Local PostgreSQL (optional)
```

---

## 3. Phased Implementation Plan

### ⚠️ TDD Golden Rule (applied throughout)
> **Every feature follows:** Write a failing test → `git commit` (RED) → implement minimum code to pass → `git commit` (GREEN) → refactor → `git commit` (REFACTOR).  
> Test results are **never fabricated**. Each commit message includes a brief description of AI assistance and the co-author trailer where applicable.

### AI Co-author Trailer (exact format for every AI-assisted commit)
```
Co-authored-by: Antigravity <antigravity@google.com>
```

---

### Phase 0 — Bootstrap & Git Init
**Goal**: Clean project skeleton, git history starts here.

| Step | Action |
|---|---|
| 0.1 | `git init`, create `.gitignore` |
| 0.2 | Create `backend/` and `frontend/` scaffold |
| 0.3 | `npm init` in both, install dev dependencies (TypeScript, Jest, ts-jest, supertest) |
| 0.4 | Configure `tsconfig.json`, `jest.config.ts` |
| 0.5 | `git commit` — `chore: initialise project structure` |

**No tests yet** (no production code to test yet).

---

### Phase 1 — Database & Prisma Schema
**Goal**: Prisma schema with `User` and `Vehicle` models; migrations run cleanly.

| Step | TDD Action |
|---|---|
| 1.1 | Write a failing integration test that connects to the DB and checks tables exist |
| 1.2 | RED commit: `test(db): assert User and Vehicle tables exist (failing)` |
| 1.3 | Define `schema.prisma` (User: id, email, password, role; Vehicle: id, make, model, category, price, quantity) |
| 1.4 | Run `prisma migrate dev` |
| 1.5 | GREEN commit: `feat(db): add Prisma schema and initial migration` |
| 1.6 | Refactor: add indexes on `email`, `make`, `model`, `category` |
| 1.7 | REFACTOR commit: `refactor(db): add search indexes` |

---

### Phase 2 — Auth: Register
**Goal**: `POST /api/auth/register` creates a user with hashed password.

| Step | TDD Action |
|---|---|
| 2.1 | Write failing test: POST register → 201, user in DB, password is bcrypt hash |
| 2.2 | RED commit: `test(auth): register endpoint returns 201 (failing)` |
| 2.3 | Implement `auth.service.ts` (Zod validation, bcrypt hash, Prisma insert) |
| 2.4 | Implement `auth.router.ts` + `auth.controller.ts` |
| 2.5 | GREEN commit: `feat(auth): implement user registration` |
| 2.6 | Add edge-case tests: duplicate email → 409, invalid payload → 400 |
| 2.7 | REFACTOR commit: `refactor(auth): extract validation middleware` |

---

### Phase 3 — Auth: Login & JWT
**Goal**: `POST /api/auth/login` returns a signed JWT.

| Step | TDD Action |
|---|---|
| 3.1 | Failing test: valid credentials → 200 + `{ token }` |
| 3.2 | RED commit: `test(auth): login returns JWT (failing)` |
| 3.3 | Implement login service (bcrypt compare, `jsonwebtoken.sign`) |
| 3.4 | GREEN commit: `feat(auth): implement login and JWT issuance` |
| 3.5 | Edge-case tests: wrong password → 401, unknown email → 401 |
| 3.6 | Implement `authenticate.ts` middleware (verify JWT, attach `req.user`) |
| 3.7 | REFACTOR commit: `refactor(auth): centralise JWT middleware` |

---

### Phase 4 — Vehicle CRUD APIs
**Goal**: `POST`, `GET`, `PUT`, `DELETE /api/vehicles` all behind JWT.

| Step | TDD Action |
|---|---|
| 4.1 | Failing tests for each CRUD operation (unauthenticated → 401) |
| 4.2 | RED commit: `test(vehicles): CRUD endpoints return 401 without token (failing)` |
| 4.3 | Implement `vehicles.service.ts` (Prisma CRUD), router, controller |
| 4.4 | GREEN commit: `feat(vehicles): implement vehicle CRUD endpoints` |
| 4.5 | Test `DELETE` is Admin-only; add `requireAdmin.ts` middleware |
| 4.6 | REFACTOR commit: `refactor(vehicles): add role guard for delete` |

---

### Phase 5 — Vehicle Search
**Goal**: `GET /api/vehicles/search?make=&model=&category=&minPrice=&maxPrice=`

| Step | TDD Action |
|---|---|
| 5.1 | Failing test: search by make returns only matching vehicles |
| 5.2 | RED commit: `test(vehicles): search filters by make (failing)` |
| 5.3 | Implement Prisma `where` builder with optional filters |
| 5.4 | GREEN commit: `feat(vehicles): implement vehicle search endpoint` |
| 5.5 | Add tests for combined filters, empty results, invalid query params |
| 5.6 | REFACTOR commit: `refactor(vehicles): extract query builder utility` |

---

### Phase 6 — Atomic Purchase
**Goal**: `POST /api/vehicles/:id/purchase` decrements quantity by 1 atomically; fails gracefully at 0.

| Step | TDD Action |
|---|---|
| 6.1 | Failing test: purchase on qty > 0 → 200, qty decremented |
| 6.2 | RED commit: `test(purchase): decrement quantity on purchase (failing)` |
| 6.3 | Implement using Prisma `$transaction` with optimistic lock check |
| 6.4 | GREEN commit: `feat(purchase): implement atomic vehicle purchase` |
| 6.5 | Test: purchase on qty = 0 → 409 Conflict |
| 6.6 | REFACTOR commit: `refactor(purchase): isolate inventory service` |

---

### Phase 7 — Admin Restock
**Goal**: `POST /api/vehicles/:id/restock` increments quantity (Admin only).

| Step | TDD Action |
|---|---|
| 7.1 | Failing test: non-admin restock → 403 |
| 7.2 | RED commit: `test(restock): non-admin gets 403 (failing)` |
| 7.3 | Implement restock with `requireAdmin` guard |
| 7.4 | GREEN commit: `feat(restock): implement admin restock endpoint` |
| 7.5 | Test: valid admin restock → qty increases |
| 7.6 | REFACTOR commit: `refactor(restock): merge into inventory service` |

---

### Phase 8 — Frontend Design (Google Stitch)
**Goal**: Design all screens in Stitch; export and integrate into React + Vite + Tailwind.

| Step | Action |
|---|---|
| 8.1 | Use Stitch MCP to create a project and design screens: Login, Register, Dashboard (vehicle grid), Search/Filter, Vehicle Detail + Purchase, Admin Panel (add/edit/delete/restock) |
| 8.2 | Download Stitch design assets |
| 8.3 | Bootstrap `frontend/` with `npx create-vite@latest` (React + TypeScript) |
| 8.4 | Install Tailwind CSS |
| 8.5 | Implement React components matching Stitch designs |
| 8.6 | Set up Axios API client, React Router, auth context |
| 8.7 | Connect all pages to backend endpoints |
| 8.8 | Commit: `feat(frontend): integrate Stitch UI design with React` |

---

### Phase 9 — End-to-End & Coverage
**Goal**: Comprehensive test suite, coverage ≥ 80 %, test report generated.

| Step | Action |
|---|---|
| 9.1 | Run `jest --coverage` and review gaps |
| 9.2 | Add missing unit tests for services, edge-cases |
| 9.3 | Generate HTML/text test report (`jest-html-reporter` or `--json`) |
| 9.4 | Save report to `test-report/` |
| 9.5 | Commit: `test: finalise test suite and generate coverage report` |

---

### Phase 10 — Screenshots
**Goal**: Capture application screenshots for README.

| Step | Action |
|---|---|
| 10.1 | Start backend (`npm run dev`) and frontend (`npm run dev`) |
| 10.2 | Take screenshots of: Login, Register, Dashboard, Search, Purchase, Admin Panel |
| 10.3 | Save to `screenshots/` |
| 10.4 | Commit: `docs: add application screenshots` |

---

### Phase 11 — README.md
**Goal**: Professional README covering all required sections.

Sections:
- Project overview
- Tech stack
- Local setup (prerequisites, env vars, DB setup, run backend, run frontend)
- API reference table
- Screenshots
- **My AI Usage** (which tools, how used, reflection)
- Test report link
- (Optional) Live deployment link

Commit: `docs: write comprehensive README`

---

### Phase 12 — PROMPTS.md & AI Usage
**Goal**: Log all raw, unedited AI interactions (spec requirement).

- Maintain `PROMPTS.md` as a running log throughout development
- Include every actual prompt sent to Antigravity (this session) and any other AI tools
- Include links to any public chat sessions
- No AI-generated summaries — raw logs only
- Final commit: `docs: add PROMPTS.md with raw AI chat logs`

---

### Phase 13 — Final Git Hygiene & GitHub Push
**Goal**: Clean, readable commit graph; push to public repository.

| Step | Action |
|---|---|
| 13.1 | Review `git log --oneline` — ensure RED→GREEN→REFACTOR pattern is visible |
| 13.2 | Verify every AI-assisted commit has the co-author trailer |
| 13.3 | Push to GitHub (public repo) |
| 13.4 | (Optional) Deploy backend to Railway/Render, frontend to Vercel |

---

## 4. Environment Variables Required

```env
# backend/.env
DATABASE_URL="postgresql://user:password@localhost:5432/car_dealership"
JWT_SECRET="super-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"
PORT=4000
NODE_ENV=development
```

---

## 5. Testing Strategy

| Layer | Tool | Scope |
|---|---|---|
| Unit | Jest + ts-jest | Service functions in isolation (mocked Prisma) |
| Integration | Jest + Supertest | HTTP endpoints against a test DB |
| Coverage | `jest --coverage` | Target ≥ 80% lines/branches |
| Report format | `jest-html-reporter` or `--json` | Saved to `test-report/` |

**Test database**: Separate `DATABASE_URL` in `.env.test`; reset with `prisma migrate reset --force` before each test run.

---

## 6. Commit Message Convention

```
<type>(<scope>): <short description>

[body: optional AI assistance note]

Co-authored-by: Antigravity <antigravity@google.com>
```

Types: `chore`, `feat`, `test`, `refactor`, `fix`, `docs`

---

## 7. Deliverables Checklist

- [ ] Public GitHub repository
- [ ] Backend API (all 9 endpoints, JWT-secured, Admin guards)
- [ ] Frontend SPA (React + Vite + Tailwind, Stitch design)
- [ ] Red-Green-Refactor visible in git history
- [ ] AI co-author trailer on all AI-assisted commits
- [ ] `README.md` with setup guide, screenshots, **My AI Usage**
- [ ] `PROMPTS.md` with raw AI chat logs
- [ ] Test report (coverage ≥ 80%)
- [ ] Screenshots in `screenshots/`
- [ ] (Optional) Live deployment link

---

> **Awaiting your approval to begin Phase 0.**
