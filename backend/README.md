# Backend (Venue Vendors REST API)

Node + Express + TypeORM, talking to a Cloud MS SQL Server.

## Run it locally

```bash
npm install
npm run dev   # nodemon + ts-node, port 3001
```

You need a `.env` file at `backend/.env` with:

```
DB_HOST=dipto-database.cn2ems8y2mfe.ap-southeast-2.rds.amazonaws.com
DB_USERNAME=...
DB_PASSWORD=...
DB_NAME=...
JWT_SECRET=...
```

`.env` is gitignored — get the values from a teammate.

## Production build

```bash
npm run build   # compiles TypeScript to dist/
npm start       # node dist/index.js
```

## Entry-point split (HD test requirement)

- `src/app.ts` exports the Express app **without** opening a port or
  initialising the database. The HD tests `import app from "../app"` and
  feed it requests through `supertest`.
- `src/index.ts` is a 4-line bootstrapper: imports `app`, initialises the
  data source, calls `app.listen()`.

This split is the week 9 `example3` pattern.

---

## HD — contextual unit tests

Three tests live in `src/__tests__/`. Each one starts with a **CONTEXT**
comment block explaining *why* the test exists (the markers look for this
"contextual" framing per the assignment spec):

| File | Endpoint / module | What it pins down |
| --- | --- | --- |
| `auth.signup.test.ts` | `POST /api/register` | OWASP A07 — the API refuses weak passwords even when the React form is bypassed by a direct curl call. |
| `booking.create.test.ts` | `POST /api/bookings` | Race-condition guard — a hirer cannot book a date the vendor has blocked, even if a stale frontend still shows it free. Returns **`409 timeslot blocked`**. |
| `reputation.compute.test.ts` | `utils/reputation.ts` | Edge cases for the average-reputation maths: zero ratings → `null` (so the UI can show "Not yet rated"), single rating → that exact value, many → arithmetic mean rounded to 1 decimal place. |

The stack used (per the FAQ — combining all three earns "beyond HD"):

- **Jest + ts-jest** — runner + TypeScript loader.
- **supertest** — fires HTTP requests at the Express app from `app.ts`
  without opening a TCP port.
- **node:assert/strict** — used inside the reputation test alongside Jest's
  `expect`, so at least one assertion is checked by Node's stdlib.

### Run them

```bash
npm test
```

Test 2 mocks `AppDataSource` (`jest.mock("../data-source", ...)`) so it
runs offline. Test 1 also runs offline because the API returns 400 on the
weak-password check **before** it touches the database. Test 3 is a pure
unit test on a function — no app, no DB.

### Why a 4th and 5th test file isn't here

The remaining three HD tests (vendor CRUD IDOR, timeslot block while
booking active, empty-stats safety) belong to the **vendor / Stream B**
side of the assignment, owned by Emma.

---

## Route map

The whole API is mounted from `app.ts`:

| Prefix | File | Owner | Notes |
| --- | --- | --- | --- |
| `/api` (`/register`, `/signin`, `/users/:id/profile`) | `routes/auth.routes.ts` | Emma (S5) | argon2 password hash, JWT issued on sign-in |
| `/api/venues` | `routes/venue.routes.ts` | Aleeya (A1) | Public browse (list, one, suitability score) |
| `/api/hirer` | `routes/hirer.routes.ts` | Aleeya (A1) | Saved venues, bookings, reputation, compliance, profile |
| `/api/bookings` | `routes/booking.routes.ts` | Aleeya (A1) | Hirer applies — server-side blocked-date check |
| `/api/vendor/stats` | `routes/vendor-stats.routes.ts` | Aleeya (DI) | Infographic Report — bar / stacked / pie / line data |
| `/api/vendor/...` | `routes/vendor.routes.ts` | Emma (B1–B2) | Venue CRUD, applications, bookings, comments |

Every protected route goes through `middlewares/auth.ts`:

- `requireAuth` verifies the JWT and attaches `req.user`.
- `requireRole("hirer" | "vendor")` enforces the role from the token.
- `validateDto(SomeDto)` runs the class-validator rules on the body
  before the controller sees it.
