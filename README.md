# Venue Vendors (VV) - Event Venue Management System

## Group Details

- **Team Name:** Team 12
- **Group Members:**
  - Name: Emma Daujat  
    Student ID: 4151401  
    Enrolled in Veronika's Tuesday @ 2:30pm class (Activity 07)
  - Name: Aleeya Ahmad  
    Student ID: 4093344  
    Enrolled in Veronika's Tuesday @ 2:30pm class (Activity 07)
- **GitHub Repo URL:** https://github.com/rmit-fsd-2026-s1/a2-fsd-pra01-07-tue-2-30pm-veronika-team12

---

## Deployed Services

| Service | URL |
|---------|-----|
| VV Frontend (/my-app) | https://venuevendors.onrender.com |
| VV Backend (/backend) | https://vv-backend-phqq.onrender.com |
| Admin Frontend (/admin-frontend) | https://venuevendorsconsole.onrender.com |
| Admin Backend (/admin-backend) | https://vv-admin-backend-yk3e.onrender.com/graphql |

### Admin Login
- Username: `admin`
- Password: `admin`

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm

### Installation & Running

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests

From the `my-app` directory, use one of these commands:

```bash
# Run all tests
npm test

# Run both specific test files
npx jest src/__tests__/hirerTests.test.tsx src/__tests__/vendorTests.test.tsx

# Run a single file (hirer)
npx jest src/__tests__/hirerTests.test.tsx

# Run a single file (vendor)
npx jest src/__tests__/vendorTests.test.tsx

# Clear Jest cache and run both files
npx jest --no-cache src/__tests__/hirerTests.test.tsx src/__tests__/vendorTests.test.tsx

# Watch mode (re-run tests on file changes)
npx jest --watchAll
```

---

## Login Credentials

### Test Users - Hirers (Event Organizers)

| Name            | Email                    | Password       | Role  |
| --------------- | ------------------------ | -------------- | ----- |
| Taylor Swift    | `taylorswift@gmail.com`  | `Password/101` | Hirer |
| Beyonce Knowels | `beyonce@gmail.com`      | `Password/102` | Hirer |
| Ariana Grande   | `arianagrande@gmail.com` | `Password/103` | Hirer |

### Test Users - Vendors (Venue Managers)

| Name          | Email                    | Password       | Role   |
| ------------- | ------------------------ | -------------- | ------ |
| Harry Styles  | `harrystyles@gmail.com`  | `Password/104` | Vendor |
| Miley Cyrus   | `mileycyrus@gmail.com`   | `Password/105` | Vendor |
| Justin Bieber | `justinbieber@gmail.com` | `Password/106` | Vendor |

---

## Venue Ownership

Harry Styles (vendor) owns: The Glasshouse Pavilion South Wharf, Rooftop Garden Terrace at One Southbank, Federation Grand Ballroom

Miley Cyrus (vendor) owns: The Brunswick St Warehouse Studio, Bayside Marquee at St Kilda Esplanade, Carlton Heritage Meeting Rooms

Justin Bieber (vendor) owns: Yarra Valley Harvest Estate, Collingwood Factory Loft, Port Melbourne Waterfront Pavilion

---

## Features

### For Hirers (Event Organizers)

- Browse and search venues by name, location, capacity, and suitability
- Save venues to a ranked wishlist
- Submit detailed event applications with compliance documents
- View booking history and application status
- Upload compliance documents (driver's license, insurance, business cert) to improve credibility
- Track credibility score (0-5 stars)
- View vendor ratings and feedback

### For Vendors (Venue Managers)

- View and manage event applications for their venues
- Review hirer profiles including compliance documents and booking history
- Sort applicants by reputation score
- Approve or decline applications
- Add comments/notes on selected applicants
- Block venue availability for maintenance/renovation periods
- View infographic dashboard showing top/worst performers
- Manage multiple venues

---

## Technology Stack

- **Frontend (my-app)**: React + TypeScript (functional components + hooks), Next.js Pages Router, Chakra UI
- **Backend**: Node + Express + TypeORM REST API
- **Admin frontend**: Vite + React TS + Apollo Client
- **Admin backend**: Apollo Server (GraphQL) + TypeORM
- **Database**: Cloud MS SQL Server (shared by both backends)
- **Auth**: JWT (argon2 password hashing) stored in `localStorage` as `vv_token`
- **Testing**: Jest + ts-jest + supertest + node:assert (backend HD tests)

---

## How to Test

- When testing as a hirer, apply to a venue then log in as that venue's vendor to see the application come through
- To test compliance documents: upload docs as a hirer first, then view on vendor's Hirer Profiles page

### Sign In as a Hirer

1. Go to [http://localhost:3000/signin](http://localhost:3000/signin)
2. Enter: `taylorswift@gmail.com` / `Password/101`
3. You'll be redirected to the hirer dashboard

### Sign In as a Vendor

1. Go to [http://localhost:3000/signin](http://localhost:3000/signin)
2. Enter: `harrystyles@gmail.com` / `Password/104`
3. You'll be redirected to the vendor dashboard

### Submit an Application

1. Sign in as a hirer
2. Click "Browse Venues"
3. Select a venue and click "Apply"
4. Complete the 5-step application form
5. Submit and view status in "Booking History"

### Approve/Reject Applications

1. Sign in as a vendor
2. Go to "Venue Applications"
3. Click on an application to review
4. Click "Approve" or "Decline"
5. Application status updates on hirer's dashboard

---

## Unit tests

### HD contextual unit tests (6 total)

The HD requirement is **6 contextual unit tests**. As confirmed with the tutor,
they are split across the two backends:

- **4 tests in the REST API (`/backend`, Node + Express)**
- **2 tests in the GraphQL admin API (`/admin-backend`) covering Venue CRUD**

Each test opens with a CONTEXT comment block explaining why it exists.

**`/backend` — 4 tests** (`backend/src/__tests__/`):

```bash
cd backend
npm install
npm test
```

- `auth.signup.test.ts` — the API rejects weak passwords even when the React
  form is bypassed (OWASP A07). *(Aleeya)*
- `booking.create.test.ts` — a hirer cannot book a date the vendor has blocked
  (`409 timeslot blocked`), guarding the stale-frontend race condition. *(Aleeya)*
- `reputation.compute.test.ts` — average-reputation edge cases (zero → `null`,
  single → exact value, many → mean rounded to 1dp), using `node:assert/strict`. *(Aleeya)*
- `vendor.stats.test.ts` — a brand-new vendor with no venues/bookings gets a
  `200` with zeroed/empty data, never a `500` (empty-aggregate edge case). *(Emma)*

**`/admin-backend` — 2 tests** (`admin-backend/src/__tests__/`):

```bash
cd admin-backend
npm install
npm test
```

- `venue.crud.test.ts` — two tests on the admin GraphQL CRUD resolvers: *(Emma)*
  - `createVenue` refuses a duplicate (same name + location) and never saves it.
  - `deleteVenue` removes an existing venue and returns `true`.

Stack: **Jest + ts-jest + supertest + node:assert** in `/backend`;
**Jest + ts-jest** (resolvers called directly) in `/admin-backend`.
See `backend/README.md` for full details.

### Frontend tests (my-app)

```bash
cd my-app
npm test
```

- `src/__tests__/vendorTests.test.tsx` — sign-in form validation.

Jest config: `jest.config.ts` and setup file `jest.setup.ts`.

---

## Project Structure - VenueVendors Frontend (/my-app)

```
├── src
│   ├── __tests__                            # Jest unit tests
│   │   └── vendorTests.test.tsx                     # Vendor sign-in form validation tests
│   ├── components                           # Reusable React components
│   │   ├── applySteps                               # Multi-step application form components
│   │   │   ├── StepAccount.tsx                      # Step 1 — account details
│   │   │   ├── StepDocuments.tsx                    # Step 4 — compliance document uploads
│   │   │   ├── StepEventDetails.tsx                 # Step 2 — event details
│   │   │   ├── StepReputation.tsx                   # Step 3 — hirer reputation tags
│   │   │   └── StepReview.tsx                       # Step 5 — review and submit
│   │   ├── footer.tsx                               # Site-wide footer
│   │   ├── graph.tsx                                # Recharts infographic component for vendor analytics
│   │   ├── hirerSidebar.tsx                         # Sidebar navigation for hirer dashboard
│   │   ├── logo.tsx                                 # VenueVendors logo component
│   │   ├── navbar.tsx                               # Top navigation bar with auth links
│   │   ├── signout.tsx                              # Sign out button and logic
│   │   └── vendorDashboardLayout.tsx                # Shared layout wrapper for vendor dashboard pages
│   ├── contexts
│   │   └── AuthContext.tsx                          # React context for global auth state
│   ├── hooks                               # Custom React hooks
│   │   ├── vendor                               # Vendor-specific data fetching hooks
│   │   │   ├── useHirerBookingHistory.ts             # Fetches full booking history for a specific hirer
│   │   │   ├── useHirerCompliance.ts                 # Fetches compliance documents and credibility score for a hirer
│   │   │   ├── useVendorApplications.ts              # Fetches all applications for the vendor's venues
│   │   │   ├── useVendorBookings.ts                  # Fetches all approved bookings for the vendor
│   │   │   ├── useVendorComments.ts                  # Fetches and manages vendor comments on hirers
│   │   │   ├── useVendorVenues.ts                    # Fetches all venues owned by the vendor
│   │   │   └── useVenueBlockouts.ts                  # Fetches and manages blocked date periods for a venue
│   │   ├── useApplicationForm.ts                     # All state and logic for the multi-step application form
│   │   └── useAuth.ts                                # Auth hook — checks login state and protects routes
│   ├── pages                              # Next.js pages router
│   │   ├── hirer                              # Hirer dashboard pages (protected)
│   │   │   ├── apply.tsx                            # Multi-step venue application form
│   │   │   ├── bookingHistory.tsx                   # Hirer's full booking history and application status
│   │   │   ├── complianceDocuments.tsx              # Upload compliance documents (license, insurance, business cert)
│   │   │   ├── dashboard.tsx                        # Hirer dashboard overview
│   │   │   ├── myDetails.tsx                        # Update hirer profile (name, phone)
│   │   │   ├── reputation.tsx                       # View reputation tags and credibility score
│   │   │   ├── savedVenues.tsx                      # Manage saved venues and rankings
│   │   │   └── userProfile.tsx                      # Hirer public profile view
│   │   ├── vendorDashboard                    # Vendor dashboard pages (protected)
│   │   │   ├── applications
│   │   │   │   └── [applicationID].tsx              # Full application review page for a specific application
│   │   │   ├── calendar
│   │   │   │   └── [venueId].tsx                    # Venue availability calendar and blockout management
│   │   │   ├── editVenue
│   │   │   │   └── [venueID].tsx                    # Edit an existing venue's details
│   │   │   ├── hirerProfiles
│   │   │   │   └── [hirerId].tsx                    # View a specific hirer's profile and compliance documents
│   │   │   ├── addVenue.tsx                         # Add a new venue
│   │   │   ├── applications.tsx                     # List of all applications across vendor's venues
│   │   │   ├── hirerProfiles.tsx                    # List of all hirers who have applied
│   │   │   ├── index.tsx                            # Vendor dashboard overview
│   │   │   ├── infographicReport.tsx                # Analytics dashboard with charts and summary table
│   │   │   ├── myDetails.tsx                        # Update vendor profile (name, phone)
│   │   │   └── myVenues.tsx                         # Manage vendor's venues (view, edit, delete)
│   │   ├── venues
│   │   │   └── [venueId].tsx              # Public venue detail page
│   │   ├── _app.tsx                                 # Next.js app wrapper — global providers and theme
│   │   ├── _document.tsx                            # Next.js document wrapper — custom HTML head
│   │   ├── about.tsx                                # About page
│   │   ├── browseVenues.tsx                         # Browse and search all venues
│   │   ├── contact.tsx                              # Contact page
│   │   ├── index.tsx                                # Home/landing page
│   │   ├── signin.tsx                               # Sign in page
│   │   └── signup.tsx                               # Sign up page (hirer or vendor)
│   ├── services                          # Axios API service layer
│   │   ├── api.ts                                   # Shared Axios instance with base URL and JWT interceptor
│   │   ├── authApi.ts                               # Auth API calls (sign in, sign up, sign out)
│   │   ├── hirerApi.ts                              # Hirer API calls (venues, bookings, compliance, saved venues)
│   │   └── vendorApi.ts                             # Vendor API calls (applications, venues, comments, blockouts)
│   ├── styles                            # Global CSS styles
│   │   └── globals.css                             
│   ├── helpersUtil.tsx                              # Shared UI helper functions (star rendering, status colours)
│   ├── hirerRatingCalculation.ts                    # Hirer reputation score and badge calculation
│   ├── pdfStorage.ts                                # IndexedDB helper for storing PDF compliance documents
│   ├── theme.ts                                     # Chakra UI theme configuration (brand colours, fonts)
│   ├── types.ts                                     # Shared TypeScript type definitions
│   ├── validation.ts                                # Form validation logic for sign up and sign in
│   └── venueValidation.ts                           # Form validation logic for venue forms
├── .gitignore                                       # Files excluded from git
├── eslint.config.mjs                                # ESLint configuration
├── jest.config.ts                                   # Jest test runner configuration
├── jest.setup.ts                                    # Jest setup file (global test configuration)
├── next.config.ts                                   # Next.js configuration
├── package-lock.json                                # Locked dependency versions
├── package.json                                     # Project dependencies and scripts
├── postcss.config.mjs                               # PostCSS configuration for Tailwind/CSS processing
└── tsconfig.json                                    # TypeScript compiler configuration
```

```

---

## Key Pages

### Public Pages

- `/` - Home page
- `/signin` - Sign in with email & password
- `/signup` - Create new account (hirer or vendor)
- `/browseVenues` - Browse and search all venues

### Hirer Pages (Protected)

- `/hirer/dashboard` - View saved venues and booking history
- `/hirer/apply?venueId=xxx` - Multi-step application form
- `/hirer/bookingHistory` - Full booking history with status
- `/hirer/myDetails` - Update profile (name, phone)
- `/hirer/complianceDocuments` - Upload compliance documents (license, insurance, business cert)
- `/hirer/savedVenues` - Manage saved venues & rankings

### Vendor Pages (Protected)

- `/vendorDashboard` - Vendor dashboard overview
- `/vendorDashboard/applications` - View & manage applications
- `/vendorDashboard/hirerProfiles/[hirerId]` - View hirer profile & compliance documents
- `/vendorDashboard/applications/[hirerId]` - View specific hirer application
- `/vendorDashboard/myDetails` - Vendor profile edit (name, phone)
- `/vendorDashboard/myVenues` - Manage vendor's venues
- `/vendorDashboard/calendar/[venueId]` - Venue availability calendar
- `/vendorDashboard/infographicReport` - Analytics dashboard with summary table (most/least/not selected)

### Backend Structure

- `entity/` → TypeScript classes that map to your database tables (User.ts, Venue.ts, etc.) — these use TypeORM
- `controller/` → Functions that handle each API request (e.g. "what happens when someone POSTs to /api/auth/login")
- `routes/index.ts` → Maps URL paths to controller functions (e.g. /api/auth/login → calls the login controller)
- `data-source.ts` → Your database connection config (connects to the RMIT MS SQL server)
