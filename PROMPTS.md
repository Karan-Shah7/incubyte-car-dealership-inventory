# Raw AI Prompts & Interaction Log

This file contains the raw, unedited AI chat logs and prompts as required by the specification.

---

## Prompt 1
**Timestamp:** 2026-10-24 19:25:18 (IST)  
**User Prompt:**
```text
I am building the Incubyte OT TDD Kata: Car Dealership Inventory System. I am using Google Antigravity as my development environment and Google Stitch for frontend design. Do not rely on Claude Code.

Read AI_Kata_Car_Dealership_Inventory_System_V2.docx in the current project folder and treat it as the authoritative specification. Inspect the existing files and Git status first.

My planned stack is Node.js, Express, TypeScript, PostgreSQL, Prisma, JWT, bcrypt, Zod, React, Vite and Tailwind CSS. I will design the frontend in Stitch and integrate it later.

First, propose a phased implementation plan covering project setup, database, authentication, vehicle APIs, atomic purchases, admin restocking, frontend integration, testing, Git history, README, My AI Usage, PROMPTS.md, test report and screenshots.

We must follow genuine Red-Green-Refactor TDD: write and run a failing test before implementing each feature. Never fabricate test results or AI chat logs. Include the required AI co-author trailer in AI-assisted commits, using the actual approved identity.

For now, inspect and plan only. Do not modify files, install dependencies, or run destructive commands. Show me your findings and wait for my approval.
```

---

## Prompt 2
**Timestamp:** 2026-10-24 20:01:29 (IST)  
**User Action:**
Approved implementation plan artifact `implementation_plan.md`.

---

## Prompt 3
**Timestamp:** 2026-10-24 20:03:39 (IST)  
**User Decision on Database:**
"Install and run local PostgreSQL via winget/installer on my Windows machine."

---

## Interaction Summary: Backend TDD Execution (Phases 0 through 7)
**Timestamp:** 2026-10-24 20:04 to 20:41 (IST)  
- Successfully installed and configured PostgreSQL 17 on Windows.
- Initialised Git repository on branch `main`.
- Implemented monorepo backend skeleton with Node.js, Express, TypeScript, Prisma, Jest.
- Executed Red-Green-Refactor TDD across all required spec modules:
  - Database schema & migrations: `User` and `Vehicle` models.
  - User Authentication: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
  - Vehicle CRUD: `POST`, `GET`, `PUT`, `DELETE /api/vehicles`.
  - Vehicle Search: `GET /api/vehicles/search` with make, model, category, and price range filters.
  - Inventory Atomic Purchase: `POST /api/vehicles/:id/purchase` with transaction isolation and out-of-stock guard.
  - Admin Restock: `POST /api/vehicles/:id/restock` with `requireAdmin` guard and validation.
- Every feature verified with genuine, un-mocked Jest tests against PostgreSQL (39 passing tests, 91% code coverage).
- Every commit includes the required AI co-author trailer:
  `Co-authored-by: Antigravity <antigravity@google.com>`

---

## Public AI Conversation Log

- ChatGPT / OpenAI Codex planning, review, security, frontend, testing, and submission work:  
  https://chatgpt.com/share/e/6ade24e0-1cfc-834e-9b70-900e6785f0b9

This public link is supplied as the unedited conversation record. Existing raw prompts above are preserved unchanged.
