# Assignment 2 — Full Task Allocation Plan (HD target)

**Team**
- **Aleeya Ahmad (s4093344)** — Hirer pages + User Story list
- **Emma Daujat (s4151401)** — Vendor pages + Database schema + Sign-up/Sign-in + Profile + Admin Figma designs

**HD extension chosen:** Option B — **6 contextual unit tests in the backend (Node & Express)**. Each member writes **3 tests** for their own side (Hirer / Vendor) = 6 total.

**Tech stack (locked in by spec — using any other stack = 0)**
- Frontend: React **TS** (functional components + hooks only — no class components)
- Backend: Node + Express + **TypeORM**
- Database: Cloud **MS SQL Server** (`dipto-database.cn2ems8y2mfe.ap-southeast-2.rds.amazonaws.com`)
- Admin backend: **GraphQL** (Apollo Server — see week10LECTURE/example1/backend)
- Communication: Axios from frontend → REST backend
- Deployment: **Render** (4 web services)

---

## The 4 Separate Applications

The tutor confirmed you must have **4 completely separate projects**. Each is its own Node/npm project with its own `package.json`, its own `node_modules`, and its own deployment on Render. They communicate over HTTP/GraphQL — they do **not** share source files at runtime.

```
/frontend            ← App 1: VV React TS website (Hirer + Vendor UI)
                          - Framework: Next.js or Vite React TS
                          - Talks to: /backend via Axios
                          - Deployed as: Render static / web service

/backend             ← App 2: VV REST API (Node + Express + TypeORM)
                          - Framework: Node + Express
                          - ORM: TypeORM → Cloud MS SQL Server
                          - Deployed as: Render web service

/admin-frontend      ← App 3: Admin Dashboard React TS site
                          - Framework: Vite React TS (lighter than Next for admin)
                          - Talks to: /admin-backend via Apollo Client (GraphQL)
                          - Deployed as: Render static site
                          - MUST NOT be linked to the VV website

/admin-backend       ← App 4: Admin GraphQL API (Apollo Server + TypeORM)
                          - Framework: Apollo Server + Express
                          - ORM: TypeORM → same Cloud MS SQL Server DB
                          - Deployed as: Render web service
                          - MUST use GraphQL — no REST allowed here
```

Each app is scaffolded independently. The only thing they share is the **database** (same MS SQL Server, same tables). They never import from each other.

### How they talk to each other

```
Browser (Hirer/Vendor)
    │
    │  HTTP + Axios
    ▼
/frontend  (App 1)  ──── Axios ──────────► /backend (App 2) ──── TypeORM ──► MS SQL DB
                                                                                  ▲
Browser (Admin)                                                                   │
    │                                                                             │
    │  Apollo Client (GraphQL)                                                    │
    ▼                                                                             │
/admin-frontend (App 3) ── GraphQL ──► /admin-backend (App 4) ── TypeORM ────────┘
```

### Submission zip structure

```
A2_TeamName.zip
├── frontend/          ← no node_modules
├── backend/           ← no node_modules
├── admin-frontend/    ← no node_modules
├── admin-backend/     ← no node_modules
├── docs/
│   ├── ERD.pdf
│   ├── UserStoryList.xlsx
│   └── GroupContributionForm.pdf
└── README.md          ← GitHub URL + 4 Render URLs
```

---

## How to read this plan
- Sections marked **[SHARED]** must be finished by the named person **before** the other can start their stream.
- After **Day 4** of the plan, Aleeya and Emma work in fully independent folders. No file is touched by both people.
- Every code task includes a **step-by-step "how"** and links to the week example that already shows the pattern.

---

## Shared Foundation Files (one person creates, both use)

These are the **only** files that block both streams. Everything after this is parallel.

### S1. New GitHub repo + project scaffolding — **Aleeya (Day 1, ~1 hr)**
1. Accept the GitHub Classroom invite for A2.
2. Clone the new empty repo locally.
3. Create the 4 sub-folders: `frontend`, `backend`, `admin-frontend`, `admin-backend`.
4. Copy `/assignment2/my-app/*` (A1 code) into `/frontend` (rename `my-app` → `frontend`). Do **not** copy `node_modules`.
5. In `/backend`: run `npm init -y`, then install:
   ```
   npm i express typeorm reflect-metadata mssql cors dotenv class-validator class-transformer bcrypt jsonwebtoken
   npm i -D typescript ts-node-dev @types/express @types/cors @types/bcrypt @types/jsonwebtoken jest ts-jest @types/jest supertest @types/supertest
   ```
6. Copy `tsconfig.json` and the folder shape (`src/entity`, `src/controller`, `src/routes`, `src/middlewares`, `src/dtos`, `src/data-source.ts`, `src/index.ts`) from week9LECTURE/example1/backend/src.
7. In `/admin-backend`: run `npm init -y`, then install:
   ```
   npm i apollo-server-express express graphql typeorm reflect-metadata mssql dotenv jsonwebtoken cors
   npm i -D typescript ts-node-dev @types/node @types/express @types/jsonwebtoken
   ```
8. In `/admin-frontend`: scaffold with Vite React TS:
   ```
   npm create vite@latest admin-frontend -- --template react-ts
   cd admin-frontend
   npm i @apollo/client graphql axios
   ```
9. Commit: `chore: scaffold 4 separate apps (frontend/backend/admin-frontend/admin-backend)`.
10. Push and add Emma as collaborator if not auto-added.

### S2. Database connection + `data-source.ts` — **Emma (Day 1, ~1 hr)**

Why Emma: she owns the schema. This file is needed in **both** `/backend` and `/admin-backend` (each app has its own copy — they are independent).

1. In `/backend/src/data-source.ts`, configure TypeORM for MS SQL using the pattern in week9LECTURE/example1/backend/src/data-source.ts, but with:
   ```ts
   type: "mssql",
   host: "dipto-database.cn2ems8y2mfe.ap-southeast-2.rds.amazonaws.com",
   port: 1433,
   username: process.env.DB_USER,
   password: process.env.DB_PASS,
   database: process.env.DB_NAME,   // Emma's DB name
   options: { encrypt: true, trustServerCertificate: true },
   synchronize: true,                // true ONLY during dev
   entities: [__dirname + "/entity/*.ts"],
   ```
2. Repeat the same `data-source.ts` in `/admin-backend/src/data-source.ts` (same config — both apps read the same DB).
3. Add `.env.example` (committed) and `.env` (gitignored). Add `.env` to `.gitignore` in both `/backend` and `/admin-backend`.
4. Test connection in `/backend`: `npm run dev` should print "Data Source has been initialized."
5. Commit.

### S3. Database schema (all entities) + ER diagram — **Emma (Day 1–2, ~4 hrs)** [SHARED, BLOCKING]

Emma has already designed the ERD on Miro. Aleeya cannot wire bookings/applications APIs until these entity classes exist. Convert the Miro ERD into TypeORM entity files in `/backend/src/entity/` — then **copy the same files** into `/admin-backend/src/entity/` (they read the same DB; keeping them separate ensures the 2 apps stay independent).

**Tables to create** (7 entities — based on Emma's Miro design):

| Entity               | Key fields                                                                                                                                               | Relationships                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `User`               | id, email (unique), passwordHash, role (`hirer`/`vendor`/`admin`), name, phone, dateJoined, avatarUrl?, reputationStars (hirer), complianceScore (hirer) | 1 user → many bookings (if hirer); 1 user → many venues (if vendor)    |
| `Venue`              | id, name, location, capacity, description, imageUrl, suitabilityKeywords (csv or JSON), isFeatured (bool, default false)                                 | ManyToOne → User (vendor); OneToMany → Timeslots; OneToMany → Bookings |
| `Timeslot`           | id, venueId, date, startTime, endTime, isBlocked (bool), blockReason?                                                                                    | ManyToOne → Venue                                                      |
| `Booking`            | id, hirerId, venueId, timeslotId, eventName, expectedGuests, status (`pending`/`approved`/`rejected`), createdAt                                         | ManyToOne → User (hirer), Venue, Timeslot                              |
| `ComplianceDocument` | id, hirerId, type (ID/Proof/ABN/etc.), fileUrl, uploadedAt                                                                                               | ManyToOne → User                                                       |
| `Review`             | id, hirerId, vendorId, bookingId, stars (0–5), comment                                                                                                   | ManyToOne → User x2, Booking                                           |
| `SavedVenue`         | id, hirerId, venueId, rank                                                                                                                               | ManyToOne → User, Venue                                                |

**Steps:**
1. Create one file per entity in `/backend/src/entity/` using decorators (`@Entity`, `@PrimaryGeneratedColumn`, `@Column`, `@ManyToOne`, `@OneToMany`, `@JoinColumn`). Mirror the style of week9 Pet.ts and Profile.ts.
2. Copy all entity files to `/admin-backend/src/entity/` — same files, both apps read the same DB.
3. Draw the ER diagram in **dbdiagram.io** or **Lucidchart**. Export as **PDF** → `/docs/ERD.pdf`.
4. Run the backend once with `synchronize: true` so tables are auto-created in MS SQL.
5. In DBeaver/mssql extension, manually insert **3 vendors, 3 hirers, ~6 venues, ~10 timeslots** for development data (lecturer said this is required).
6. Commit: `feat(db): add User/Venue/Timeslot/Booking/Compliance/Review/SavedVenue entities + ERD`.

### S4. Shared auth middleware + JWT helper — **Aleeya (Day 2, ~2 hrs)** [SHARED, MUST BE FIRST]

Aleeya creates this utility before Emma can implement the sign-up/sign-in endpoints. Used by every protected endpoint in the `/backend` app. The `/admin-backend` app has its own simpler auth (hard-coded admin/admin).

1. In `/backend/src/middlewares/auth.ts`:
   - `requireAuth(req, res, next)` — verifies JWT from `Authorization: Bearer <token>` header; attaches `req.user`.
   - `requireRole(...roles)` — checks `req.user.role`.
2. In `/backend/src/utils/jwt.ts`: `signToken(user)` and `verifyToken(token)`.
3. In `/backend/src/middlewares/validate.ts`: copy the class-validator middleware from week9 validate.ts.
4. Commit: `feat(auth): shared JWT + role middleware`.

### S5. Sign-up + Sign-in + Profile + Logout (5 marks PA) — **Emma (Day 2–3, ~5 hrs)** [SHARED]

Emma is handling this section. This is shared because **both** hirer and vendor need to log in through the same `/backend` API.

**Backend (in `/backend`):**
1. `POST /api/auth/signup` — body: `{ email, password, role, name, phone }`. Validate (see rules below). Hash password with `bcrypt` (10 rounds). Insert into `User`. Return token + user.
2. `POST /api/auth/signin` — body: `{ email, password }`. Compare hash. Return JWT + user (no passwordHash).
3. `GET /api/auth/me` (protected) — returns current user.
4. `GET /api/users/:id/profile` — returns name, email, phone, dateJoined.
5. Password rule (also enforced on frontend): **≥6 chars, 1 uppercase, 1 lowercase, 1 special char.** Regex: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6,}$/`.
6. Email rule: standard RFC-light regex + uniqueness check.

**Frontend (in `/frontend`):**
1. Pages: `src/pages/signup.tsx`, `src/pages/signin.tsx`, `src/pages/profile.tsx`.
2. Replace localStorage logic with **Axios** calls to the API.
3. Store JWT in `localStorage` under `vv_token`.
4. Show *Welcome <username>* on sign-in success and a **Logout** link in the navbar.
5. Profile page shows name, email, phone, **date of joining**.
6. Mirror the Axios pattern from week8LECTURE/example1/frontend (`services/` folder with `api.ts` exporting an Axios instance with the JWT interceptor).

Commit: `feat(auth): full signup/signin/profile/logout flow against MSSQL`.

### S6. User Story list spreadsheet — **Aleeya (Day 3, ~3 hrs)** [Not blocking, but must be done]

1. Open the A1 user story list (or start fresh) in Excel/Google Sheets.
2. Columns required by the rubric: **Epic | Persona | User Story | Acceptance Criteria**.
3. Story format: *"As a (persona) I want to (task) so that (goal)"*.
4. AC format: *"Given … When … Then …"*.
5. Cover **every** feature in PA + CR + DI + HD (~35–45 stories). Group epics: Auth, Hirer Browsing, Hirer Booking, Hirer Compliance, Vendor Venue Mgmt, Vendor Bookings, Vendor Analytics, Admin Mgmt, Admin Reports, Admin Notifications.
6. Export as **`.xlsx`** → `/docs/UserStoryList.xlsx`.
7. Commit (binary file is fine in repo for submission).

### S7. Shared frontend Axios client + auth context — **Aleeya (Day 3, ~1 hr)** [SHARED]

1. `/frontend/src/services/api.ts` — Axios instance with `baseURL = process.env.NEXT_PUBLIC_API_URL`, interceptor that injects `Authorization: Bearer ${token}`.
2. `/frontend/src/contexts/AuthContext.tsx` — exposes `{ user, login, logout, signup }` via React Context + `useReducer`.
3. Wrap `_app.tsx` in `<AuthProvider>`.
4. Commit.

**End of shared foundation.** From this point Aleeya and Emma touch completely different files.

---

# Stream A — Aleeya (Hirer side)

**Folders you own and only you edit:**
- `/frontend/src/pages/hirer/**`
- `/frontend/src/components/hirer*` (any new hirer-only components)
- `/backend/src/controller/HirerController.ts`, `BookingController.ts`, `ReviewController.ts`, `ComplianceController.ts`
- `/backend/src/routes/hirer.routes.ts`, `booking.routes.ts`, `compliance.routes.ts`
- `/backend/src/dtos/booking.dto.ts`, `compliance.dto.ts`
- `/backend/src/__tests__/hirer.test.ts`, `booking.test.ts`, `compliance.test.ts` (your 3 HD tests)
- `/docs/UserStoryList.xlsx` (you maintain)
- `/frontend/src/services/api.ts`, `/frontend/src/contexts/AuthContext.tsx` (shared foundation, you create these)

---

## A1. PA — Hirer Pages (6 marks) — **Day 4–6**

### Pages to build (in `/frontend/src/pages/hirer/`)

| Page                                       | Existing file | Action                                                        |
| ------------------------------------------ | ------------- | ------------------------------------------------------------- |
| `dashboard.tsx`                            | exists        | Replace dummy data with `GET /api/hirer/dashboard`            |
| `myDetails.tsx`                            | exists        | Replace localStorage with `PUT /api/users/me`                 |
| `browseVenues.tsx` (move from /pages root) | exists        | `GET /api/venues` with search params                          |
| `apply.tsx`                                | exists        | `POST /api/bookings`                                          |
| `bookingHistory.tsx`                       | exists        | `GET /api/hirer/bookings`                                     |
| `savedVenues.tsx`                          | exists        | `POST /api/hirer/saved`, `DELETE /api/hirer/saved/:id`        |
| `complianceDocuments.tsx`                  | exists        | `POST /api/compliance` (multipart upload to backend)          |
| `reputation.tsx` (**NEW**)                 | —             | `GET /api/hirer/reputation` showing history with star ratings |

### Backend endpoints you must implement (in `/backend`)

| Method | Path                                               | Purpose                                                          | Validation                                                                      |
| ------ | -------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| GET    | `/api/venues?search=&location=&capacity=&keyword=` | List with filters (search by name/location/capacity/suitability) | query params optional                                                           |
| GET    | `/api/venues/:id`                                  | Single venue details + available timeslots                       | param id numeric                                                                |
| POST   | `/api/hirer/saved`                                 | Save a venue to my list (ranked)                                 | body: venueId, rank                                                             |
| GET    | `/api/hirer/saved`                                 | My ranked saved venues                                           | —                                                                               |
| PUT    | `/api/hirer/saved/:id`                             | Update rank                                                      | body: rank ≥ 1                                                                  |
| DELETE | `/api/hirer/saved/:id`                             | Remove                                                           | —                                                                               |
| POST   | `/api/bookings`                                    | Apply for a venue                                                | body: venueId, timeslotId, eventName, expectedGuests ≥ 1, date, duration ≥ 1 hr |
| GET    | `/api/hirer/bookings`                              | My bookings + status                                             | —                                                                               |
| GET    | `/api/hirer/reputation`                            | Avg stars + history of past venues                               | —                                                                               |
| POST   | `/api/compliance`                                  | Upload doc metadata (multer or just URL)                         | file type pdf, ≤ 5MB                                                            |
| GET    | `/api/hirer/compliance`                            | My uploaded docs + compliance score                              | —                                                                               |
| GET    | `/api/venues/:id/suitability`                      | Returns matched keywords                                         | —                                                                               |

### Step-by-step (PA Hirer)

1. **Backend first.** Open week9LECTURE/example1/backend/src/controller/PetController.ts — copy the controller pattern.
2. For **each** endpoint above, create the matching method in the appropriate controller. Use the repository pattern: `AppDataSource.getRepository(Venue).find(...)`.
3. Build DTO classes in `/backend/src/dtos/`. Example:
   ```ts
   export class CreateBookingDto {
     @IsInt() @Min(1) venueId!: number;
     @IsInt() @Min(1) timeslotId!: number;
     @IsString() @Length(2, 100) eventName!: string;
     @IsInt() @Min(1) expectedGuests!: number;
   }
   ```
4. Wire routes in `/backend/src/routes/booking.routes.ts` using `requireAuth, requireRole('hirer'), validate(CreateBookingDto)`.
5. Register routes in `/backend/src/index.ts`.
6. Test each endpoint manually in Postman before touching the frontend.
7. **Frontend.** For each existing page in `/frontend/src/pages/hirer/`, replace `dummyData.ts` imports with Axios calls to `/backend`. Use `useEffect` + `useState`. Pattern: see week8 frontend pages.
8. Add client-side validation that **mirrors** backend rules (same regex, same min/max).
9. Manually QA every page. Document the API call in a comment on each component.

### Validation rules (Hirer-specific)
- `eventName`: 2–100 chars, no `<` or `>`.
- `expectedGuests`: integer, 1–10000, ≤ venue capacity.
- `date`: must be ≥ today.
- `duration`: 1–24 hours.
- File upload: `.pdf` only, ≤ 5 MB, ABN field required only when "I'm representing a business" tickbox is on.
- `rank`: integer ≥ 1, unique per hirer.

### Acceptance criteria (sample — put the full set in your User Story list)
- **AC-H1** Given I am a signed-in hirer, when I open Browse Venues, then I see at least 3 venues with name, capacity, location, and a "View" button.
- **AC-H2** Given a venue page, when I click "Apply" with valid event details, then a booking is created with status `pending` and I see a success toast.
- **AC-H3** Given I am on Reputation page with past bookings, then I see an average star rating in 0.0–5.0 format.
- **AC-H4** Given I upload a non-PDF file, then the form rejects it with an inline error.

---

## A2. CR — Hirer additions (part of the 8 CR marks) — **Day 7**

| Change              | Spec                            | Your work                                                                                                                                                                                                                                             |
| ------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CHANGE 1 (Hirer DB) | All hirer data already in MSSQL | done in PA                                                                                                                                                                                                                                            |
| CHANGE 2            | **Recommended suitability**     | New endpoint `GET /api/venues/:id/suitability` returning `{ matched: ["wedding","dinner"], score: 0.83 }` based on overlap between `venue.suitabilityKeywords` and a frontend-selected event-type keyword. Render as colored chips on the venue card. |

**Steps:**
1. Seed each venue with 3–6 keywords (e.g., `"wedding,dinner,classical music"`).
2. Frontend: dropdown on Browse Venues "I'm planning a…" with the 6 keywords from spec (`tennis, dinner, classical music, rock concert, birthday, wedding`).
3. Filter or sort venues by suitability match score.

---

## A3. DI — *no Aleeya tasks here* (Emma owns vendor charts) — **Day 8 buffer**

Use Day 8 to polish Hirer UI, add empty states, error toasts, and 404 handling.

---

## A4. HD — Admin Hirer-side wiring + your 3 contextual unit tests — **Day 9–10**

### A4.1 Admin GraphQL queries Aleeya supports
The `/admin-backend` GraphQL server needs hirer-related data for the reports. You write these 2 resolvers in `/admin-backend/src/graphql/resolvers.ts`:
- `topActiveApplicants: [ApplicantStat!]!` — top 3 by (approved bookings / total applications).
- `applicantBookings(userId: ID!): [Booking!]!`.

Coordinate file location with Emma so you only edit hirer-related resolvers.

### A4.2 Your 3 contextual unit tests (HD — 2 marks)

Put them in `/backend/src/__tests__/`. Use **Jest + supertest + node:assert** (the FAQ explicitly says using all three earns "beyond HD"). Each test must have a **comment block explaining the context** — that's the "contextual" bit graders look for.

**Test 1 — `auth.signup.test.ts`**
> Context: ensures sign-up rejects weak passwords. Protects against the OWASP A07 (Identification & Authentication Failures) risk that occurs when frontend validation is bypassed via direct API call.

Assert: POST `/api/auth/signup` with `"password": "abc"` returns 400 with field error `password`.

**Test 2 — `booking.create.test.ts`**
> Context: ensures a hirer cannot book a timeslot that is blocked. Prevents a race condition where a vendor blocks a timeslot but a stale frontend still shows it as available.

Assert: Seed a venue with a blocked timeslot. POST `/api/bookings` returns 409 Conflict with message `timeslot blocked`.

**Test 3 — `reputation.compute.test.ts`**
> Context: ensures average reputation is computed correctly with edge cases (zero reviews → `null`, single review → that value, multiple → arithmetic mean rounded to 1dp).

Assert: Three sub-cases inside one `describe`. Use `node:assert/strict` for the rounding check to demonstrate broader API knowledge.

**Test runner config:**
- `jest.config.ts` with `preset: 'ts-jest'`, `testEnvironment: 'node'`.
- `npm test` script in `/backend/package.json`.
- Use `supertest(app)` against a separate `/backend/src/app.ts` that exports the Express instance (so you don't open a port in tests). `/backend/src/index.ts` just calls `app.listen(...)`.

### A4.3 Documentation
- Add a `README.md` section inside `/backend` for each of your 3 tests explaining the context (markers look here).

---

## A5. Hirer Git workflow — **every day**

1. Branch per feature: `hirer/signup-frontend`, `hirer/booking-api`, `hirer/HD-tests`.
2. Commit format: `type(scope): description` — e.g., `feat(hirer): add reputation page`.
3. **Push at least once per working day** even if WIP — markers look at commit frequency for the "GitHub workflow" rubric.
4. Open PRs to `main`, ask Emma for an approval emoji even if not strict (creates review history).
5. Never force-push `main`.

## A6. Hirer submission tasks — **Day 12**

- Confirm all hirer pages render with no console errors after `npm run build` inside `/frontend`.
- TypeScript compiles clean: `tsc --noEmit` in `/frontend` and `/backend`.
- Manually test every hirer endpoint via the deployed Render URL.
- Fill in your half of the **Group Contribution Form** (PDF in `/docs`).
- Make sure your name is on every commit you authored.

---

# Stream B — Emma (Vendor side + DB + Auth + Admin)

**Folders you own and only you edit:**
- `/backend/src/entity/**` (you already owned this via shared foundation — from your Miro ERD)
- `/backend/src/controller/AuthController.ts` (sign-up, sign-in, profile endpoints)
- `/backend/src/routes/auth.routes.ts`
- `/backend/src/dtos/auth.dto.ts`
- `/frontend/src/pages/signin.tsx`, `/frontend/src/pages/signup.tsx`, `/frontend/src/pages/profile.tsx`
- `/frontend/src/pages/vendorDashboard/**`
- `/frontend/src/components/vendor*`
- `/backend/src/controller/VendorController.ts`, `VenueController.ts`, `TimeslotController.ts`
- `/backend/src/routes/vendor.routes.ts`, `venue.routes.ts`, `timeslot.routes.ts`
- `/backend/src/dtos/venue.dto.ts`, `timeslot.dto.ts`
- `/backend/src/__tests__/vendor.test.ts`, `venue.test.ts`, `timeslot.test.ts` (your 3 HD tests)
- `/admin-frontend/**` (entire admin frontend — App 3)
- `/admin-backend/**` (entire admin GraphQL server — App 4)
- `/docs/ERD.pdf` (you maintain — converted from your Miro design)

---

## B1. PA — Vendor Pages (6 marks) — **Day 4–6**

### Pages to build (in `/frontend/src/pages/vendorDashboard/`)

| Page                      | Existing file | Action                                          |
| ------------------------- | ------------- | ----------------------------------------------- |
| `index.tsx`               | exists        | Dashboard summary — `GET /api/vendor/dashboard` |
| `myDetails.tsx`           | exists        | `PUT /api/users/me`                             |
| `myVenues.tsx`            | exists        | `GET /api/vendor/venues`                        |
| `applications.tsx`        | exists        | `GET /api/vendor/bookings?status=pending`       |
| `hirerProfiles.tsx`       | exists        | `GET /api/vendor/hirers`                        |
| `calendar/`               | exists        | `GET /api/vendor/venues/:id/timeslots`          |
| `infographicReport.tsx`   | exists        | (DI step — leave stub for now)                  |
| `venueEdit.tsx` (**NEW**) | —             | CRUD form (CR step)                             |

### Backend endpoints (in `/backend`)

| Method | Path                                                  | Purpose                                                                |
| ------ | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| GET    | `/api/vendor/dashboard`                               | counts: venues, pending, approved                                      |
| GET    | `/api/vendor/venues`                                  | venues owned by `req.user.id` only                                     |
| POST   | `/api/vendor/venues`                                  | create venue                                                           |
| PUT    | `/api/vendor/venues/:id`                              | update (owner check!)                                                  |
| DELETE | `/api/vendor/venues/:id`                              | delete (owner check!)                                                  |
| GET    | `/api/vendor/venues/:id/timeslots`                    | timeslots for one venue                                                |
| POST   | `/api/vendor/timeslots`                               | create timeslot                                                        |
| PUT    | `/api/vendor/timeslots/:id/block`                     | block (CR change 4)                                                    |
| PUT    | `/api/vendor/timeslots/:id/unblock`                   | unblock                                                                |
| GET    | `/api/vendor/bookings`                                | all bookings for vendor's venues with hirer name/reputation/compliance |
| PUT    | `/api/vendor/bookings/:id/approve`                    | accept booking                                                         |
| PUT    | `/api/vendor/bookings/:id/reject`                     | reject booking                                                         |
| GET    | `/api/vendor/hirers`                                  | hirer profiles + reputation                                            |
| GET    | `/api/vendor/stats?range=week\|month\|lastMonth\|all` | DI charts data                                                         |

### Step-by-step (PA Vendor)

1. Open week9 PetController.ts — same controller pattern.
2. **Critical security rule:** every vendor endpoint must filter by `req.user.id`. Never trust a `vendorId` from the body. Spec says: *"A vendor can only see their venues."*
3. Build the DTOs (`CreateVenueDto` with name 2–100 chars, capacity 1–10000, location 2–100 chars, keywords ≤ 200 chars).
4. Frontend: each page imports the Axios service from `/frontend/src/services/vendorApi.ts` (you create this file).
5. Pattern for the venue list: see week8 frontend pages — same `useEffect`→`axios.get`→`setState` shape.

### Validation rules
- Venue name 2–100 chars.
- Capacity 1–10000 integer.
- Timeslot: `endTime > startTime`; same date; no overlap with existing non-blocked timeslot for the same venue (check in controller).
- Block reason: max 200 chars; optional.

### Acceptance criteria (sample)
- **AC-V1** Given I am vendor A, when I GET `/api/vendor/venues`, then I see only venues where `vendorId == A`.
- **AC-V2** Given an approved booking, when I try to block its timeslot, then I get 409 with message "timeslot has active booking".
- **AC-V3** Given a booking list, when I click Approve, then the booking status changes to `approved` and the timeslot becomes unavailable for new bookings.

---

## B2. CR — Vendor CRUD + block/unblock + booking management (4 of 8 CR marks) — **Day 7**

Already specified above in PA endpoint table — these are the CR changes 3–6:
- CHANGE 3: venue CRUD → done.
- CHANGE 4: block/unblock timeslot → done.
- CHANGE 5: booking list shows hirer name + reputation stars + compliance score → in `/api/vendor/bookings` join with User + Reviews + ComplianceDocument count (0–5 stars based on doc completeness, same formula as A1).
- CHANGE 6: accept/reject → done.

Compliance score formula (carry over from A1 spec): `min(5, complianceDocCount)` where required docs are: photo ID, address proof, ABN cert (if business). 0 docs = 0 stars, 5+ = 5 stars.

---

## B3. DI — Vendor Charts with time perspective (5 marks) — **Day 8**

### What to build
On `infographicReport.tsx`:
1. A dropdown: **This week / This month / Last month / All time**.
2. **At least 3 charts** (use `recharts` — same lib as A1's `graph.tsx`):
   - Bar: bookings per venue, x=venue, y=count, label=top hirer.
   - Pie: approved vs rejected vs pending.
   - Dot/Scatter: applicants who have NEVER been approved (per A1 FAQ guidance).
3. Each chart hits `GET /api/vendor/stats?range=...`.

### Backend stats endpoint logic
Use TypeORM query builder. Date filter:
```ts
const ranges = {
  week: () => startOfWeek(new Date()),
  month: () => startOfMonth(new Date()),
  lastMonth: () => startOfMonth(subMonths(new Date(), 1)),
  all: () => new Date(0),
};
```
Return `{ perVenue: [...], statusBreakdown: [...], rejectedApplicants: [...] }`.

### Step-by-step
1. Install `recharts` and `date-fns` in `/frontend`.
2. Implement the stats endpoint with proper SQL via TypeORM `createQueryBuilder`.
3. Bind dropdown state to a `useEffect` that re-fetches on range change.
4. Add ARIA labels + responsive container so charts work on mobile.

---

## B4. HD — Admin Dashboard (App 3 + App 4) + 3 contextual unit tests — **Day 9–11**

This is **the biggest HD block**. Treat `/admin-backend` and `/admin-frontend` as a completely separate mini-app.

### B4.1 App 4 — Admin Backend (`/admin-backend`) — Apollo GraphQL server

Copy structure from week10LECTURE/example1/backend (Pet/Profile sample — it uses GraphQL).

**Steps:**
1. `/admin-backend/src/index.ts` — create Apollo Server + Express app:
   ```ts
   const server = new ApolloServer({ typeDefs, resolvers, context: ({ req }) => verifyAdminToken(req) });
   await server.start();
   server.applyMiddleware({ app });
   app.listen(4001); // separate port from the VV backend (port 4000)
   ```
2. `/admin-backend/src/graphql/schema.ts` — GraphQL type definitions:
   ```graphql
   type Query {
     venues: [Venue!]!
     vendors: [User!]!
     topVenues: [VenueStat!]!
     topApplicants: [ApplicantStat!]!
   }
   type Mutation {
     adminLogin(username: String!, password: String!): String!
     assignVendor(venueId: ID!, vendorId: ID!): Venue!
     createVenue(input: VenueInput!): Venue!
     updateVenue(id: ID!, input: VenueInput!): Venue!
     deleteVenue(id: ID!): Boolean!
     setFeatured(venueId: ID!, featured: Boolean!): Venue!
   }
   ```
3. `/admin-backend/src/graphql/resolvers.ts` — implement all resolvers using TypeORM + the entities from `/admin-backend/src/entity/`.
4. Admin auth: `adminLogin("admin", "admin")` → hard-coded credentials per spec → return signed JWT with `role: 'admin'`. Every other resolver checks `context.user.role === 'admin'`.
5. **Top 3 venues query** — `topVenues` returns each venue's most popular weekday + timeslot using GROUP BY on booking date/time for approved bookings only.
6. **Top 3 applicants** — hirer with highest `(approvedBookings / totalApplications)` ratio, minimum 3 applications.
7. **Note:** Aleeya writes the `topApplicants` + `applicantBookings` resolvers inside this file. Coordinate by using clearly named resolver functions so you don't overwrite each other.

### B4.2 App 3 — Admin Frontend (`/admin-frontend`) — React TS + Apollo Client

Use the **Figma designs you already made**.

**Steps:**
1. `/admin-frontend/src/main.tsx` — wrap app in `<ApolloProvider>`:
   ```tsx
   const client = new ApolloClient({
     uri: import.meta.env.VITE_ADMIN_API_URL,  // admin-backend GraphQL URL
     headers: { Authorization: `Bearer ${sessionStorage.getItem('admin_token')}` },
     cache: new InMemoryCache(),
   });
   ```
2. Pages based on your Figma:
   - **`/login`** — admin/admin form → calls `adminLogin` mutation → stores token → redirects to dashboard.
   - **`/dashboard`** — summary cards + featured venue toggles.
   - **`/venues`** — full venue table with CRUD buttons + Assign Vendor dropdown.
   - **`/reports`** — top 3 venues (with most popular day/timeslot) + top 3 applicants table.
3. For each page use Apollo `useMutation` / `useQuery` hooks. Pattern: week10LECTURE/example1/frontend.
4. Store JWT in `sessionStorage` (admin session is short-lived).
5. **Feature toggle:** clicking "Feature" on a venue calls `setFeatured` mutation in admin-backend → sets `venue.isFeatured = true` in DB → on the public VV site (Aleeya's Browse Venues), a "Featured Venues" carousel reads `GET /api/venues?featured=true` from the VV backend.

### B4.3 Your 3 contextual unit tests (HD — part of the 2-mark test set)

In `/backend/src/__tests__/` (spec says tests live in the **Node + Express backend** — i.e., `/backend`, not `/admin-backend`).

**Test 4 — `venue.crud.test.ts`**
> Context: ensures vendor B cannot modify vendor A's venue (IDOR — Insecure Direct Object Reference protection). Without this check, vendors could overwrite competitors' venues by guessing numeric IDs.

Seed two vendors. Sign in as B. PUT `/api/vendor/venues/<A's venue id>` → expect 403 Forbidden.

**Test 5 — `timeslot.block.test.ts`**
> Context: ensures blocking a timeslot that has an **approved** booking is refused. Prevents vendors from accidentally invalidating confirmed events, which would cause real-world contract disputes.

Seed approved booking. PUT `/api/vendor/timeslots/:id/block` → expect 409 with message "timeslot has active booking".

**Test 6 — `vendor.stats.test.ts`**
> Context: ensures the stats endpoint returns zero counts (not 500) when a vendor has no bookings. Edge case that crashes if the SQL aggregate returns `null` for SUM on an empty result set.

GET `/api/vendor/stats?range=week` as a brand-new vendor → expect 200 with `{ perVenue: [], statusBreakdown: [], rejectedApplicants: [] }`.

Use `node:assert/strict` in at least one test (the FAQ said this earns beyond-HD recognition).

### B4.4 Documentation
- Add a `README.md` section inside `/backend` for each of your 3 tests explaining the context.
- Code comments inside each test file (the spec literally says *"Explain the test via code comments"*).

---

## B5. Render deployment — 4 web services (3 marks HD) — **Day 11**

Emma deploys App 3 + App 4. Aleeya deploys App 1 + App 2.

| Service             | App                     | Owner  | Render type  | Build command            | Start command                |
| ------------------- | ----------------------- | ------ | ------------ | ------------------------ | ---------------------------- |
| `vv-frontend`       | App 1 `/frontend`       | Aleeya | Static / Web | `npm i && npm run build` | `npm start`                  |
| `vv-backend`        | App 2 `/backend`        | Aleeya | Web Service  | `npm i && npm run build` | `node dist/index.js`         |
| `vv-admin-frontend` | App 3 `/admin-frontend` | Emma   | Static Site  | `npm i && npm run build` | (Render auto-serves `/dist`) |
| `vv-admin-backend`  | App 4 `/admin-backend`  | Emma   | Web Service  | `npm i && npm run build` | `node dist/index.js`         |

**Steps for each Render service (repeat 4 times):**
1. Push final code to GitHub `main`.
2. Render → New → Web Service → connect repo → set **root directory** to the app folder (`backend`, `frontend`, etc.).
3. Set environment variables in Render's dashboard: `DB_USER`, `DB_PASS`, `DB_NAME`, `JWT_SECRET`, plus `NEXT_PUBLIC_API_URL` for frontend App 1 and `VITE_ADMIN_API_URL` for admin frontend App 3.
4. Verify each URL loads without console errors.
5. Add all 4 URLs to root `README.md`.
6. Use free Hobby plan. Disable auto-deploy after submission to save compute.

---

## B6. Vendor Git workflow — **every day**

Branch names: `vendor/venue-crud`, `vendor/charts`, `admin/graphql-backend`, `admin/frontend-login`, etc. Same commit format rules as Aleeya.

## B7. Vendor submission tasks — **Day 12**

- All 4 apps build cleanly: `npm run build` in each with zero errors.
- ERD PDF up-to-date with final schema.
- Group Contribution Form completed.

---

# Joint final-day checklist — **Day 12 (do together over a call, ~2 hrs)**

1. ☐ Pull `main` fresh and run all 4 apps locally end-to-end.
2. ☐ Run `npm run build` in **all four** sub-projects → zero errors.
3. ☐ Run `npm test` inside `/backend` → all 6 tests pass.
4. ☐ Hit every Render URL in incognito → loads.
5. ☐ Sign up a fresh hirer, fresh vendor, log in as admin/admin → all flows succeed.
6. ☐ README.md at the repo root contains: GitHub URL, 4 Render URLs, team names + student IDs, brief feature list.
7. ☐ `/docs/ERD.pdf`, `/docs/UserStoryList.xlsx`, `/docs/GroupContributionForm.pdf` all in place.
8. ☐ Delete `node_modules` from every sub-project before zipping (the spec explicitly requires this).
9. ☐ Zip the whole project folder → `A2_<TeamName>.zip`.
10. ☐ **One person uploads to Canvas; the other uploads the same file independently** (RMIT requires both submissions).

---

# Day-by-day calendar (rough)

| Day | Aleeya                                              | Emma                                                                                      |
| --- | --------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1   | S1 scaffold all 4 apps                              | S2 data-source (both /backend + /admin-backend) + S3 ERD (from Miro) start                |
| 2   | S4 auth middleware (utility)                        | S3 ERD finish + convert to TypeORM entities + seed data + copy entities to /admin-backend |
| 3   | S6 user stories + S7 axios client                   | S5 sign-up/sign-in endpoints (uses S4 middleware) + profile page                          |
| 4   | Hirer PA pages start                                | Vendor PA pages start                                                                     |
| 5   | Hirer PA continues                                  | Vendor PA continues                                                                       |
| 6   | Hirer PA finish + QA                                | Vendor PA finish + QA                                                                     |
| 7   | Hirer CR (suitability)                              | Vendor CR (CRUD/block/approve)                                                            |
| 8   | Hirer polish + extra ACs in story list              | Vendor DI charts                                                                          |
| 9   | HD test 1–2                                         | Admin GraphQL backend (admin-backend)                                                     |
| 10  | HD test 3 + topApplicants resolver in admin-backend | Admin frontend (admin-frontend — Figma → React)                                           |
| 11  | Render vv-frontend + vv-backend deploy              | Render admin-frontend + admin-backend deploy + HD tests 4–6                               |
| 12  | Joint checklist + submission                        | Joint checklist + submission                                                              |

---

# Rubric coverage cross-check

| Marks  | Item                                        | Owner                             | Where in plan |
| ------ | ------------------------------------------- | --------------------------------- | ------------- |
| 3      | DB schema + ERD                             | Emma                              | S3            |
| 3      | User Story list                             | Aleeya                            | S6            |
| 5      | Sign-up/Sign-in/Profile/Logout              | Emma                              | S5            |
| 6      | Hirer pages PA                              | Aleeya                            | A1            |
| 6      | Vendor pages PA                             | Emma                              | B1            |
| 8      | CR changes 1–6                              | CR2 = Aleeya / CR3–6 = Emma       | A2, B2        |
| 5      | DI charts                                   | Emma                              | B3            |
| 2      | Admin CRUD + vendor assign + feature toggle | Emma (App 3+4)                    | B4.1–B4.2     |
| 2      | Admin reports (top venues + top applicants) | Emma + Aleeya resolver            | B4.1, A4.1    |
| 2      | 6 contextual unit tests (3 each)            | Aleeya tests 1–3 / Emma tests 4–6 | A4.2, B4.3    |
| 3      | Render deployment (4 services)              | split                             | B5            |
| **45** | **Total**                                   |                                   |               |

---

# Rules you both follow (non-negotiable for HD)

1. **No `dummyData.ts` imports** anywhere after Day 6 — everything from the DB.
2. **Validate on both ends.** Frontend regex == backend class-validator decorator.
3. **No object-oriented React** (no `class extends Component`). Functional + hooks only.
4. **No lorem ipsum** — use real-sounding venue names, addresses, descriptions.
5. **Images** only from Unsplash / Material Icons / UIFaces (per spec p.6).
6. **Every commit has a meaningful message** — markers read git log.
7. **No `--no-verify`, no force-push to `main`.**
8. **Code AI-assisted? Cite it** in the README's "AI tools used" section (RMIT rule).
9. **`npm run build` must pass** in all 4 apps — spec says TypeScript must compile without errors for full marks.
10. **Admin is completely separate** — the admin dashboard must not be linked to or importable from the VV website.
