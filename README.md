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
| VenueVendors Frontend (/my-app) | https://venuevendors.onrender.com |
| VenueVendors Backend (/backend) | https://vv-backend-phqq.onrender.com |
| Admin Frontend (/admin-frontend) | https://venuevendorsconsole.onrender.com |
| Admin Backend (/admin-backend) | https://vv-admin-backend-yk3e.onrender.com/graphql |

> See [Login Credentials](#login-credentials) section below for all test account details.

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm

### Installation & Running
This project consists of 4 separate applications. Run each from its own directory:

```bash
# VenueVendors Frontend (my-app)
cd my-app
# Install dependencies
npm install
# Run the development server
npm run dev

# VenueVendors Backend (backend)
cd backend
# Install dependencies
npm install
# Run the development server
npm run dev

# Admin Frontend (admin-frontend)
cd admin-frontend
# Install dependencies
npm install
# Run the development server
npm run dev

# Admin Backend (admin-backend)
cd admin-backend
# Install dependencies
npm install
# Run the development server
npm run dev

```
All 4 apps build cleanly with `npm run build`

Open [https://venuevendors.onrender.com](https://venuevendors.onrender.com) in your browser.

## Login Credentials

### Admin Login
- Username: `admin`
- Password: `admin`

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

### For Admins
- Log in to a separate admin console
- View and manage all venues (CRUD)
- Assign and swap vendors to venues
- Toggle featured venues on the hirer browse page
- Generate reports — top 3 popular venues and top 3 most active applicants

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

1. Go to [https://venuevendors.onrender.com/signin](https://venuevendors.onrender.com/signin)
2. Enter: `taylorswift@gmail.com` / `Password/101`
3. You'll be redirected to the hirer dashboard

### Sign In as a Vendor

1. Go to [https://venuevendors.onrender.com/signin](https://venuevendors.onrender.com/signin)
2. Enter: `harrystyles@gmail.com` / `Password/104`
3. You'll be redirected to the vendor dashboard

### Sign In as Admin

1. Go to [https://venuevendorsconsole.onrender.com](https://venuevendorsconsole.onrender.com)
2. Enter: `admin` / `admin`
3. You'll be redirected to the admin dashboard
   
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

### Generate a Report

1. Sign in as admin 
2. Click "Reports" in the sidebar
3. View Top 3 Popular Venues and Top 3 Most Active Applicants
4. Click "Refresh" on either table to regenerate the report

### Manage Venues (Admin)

1. Sign in as admin
2. Click "Venues" in the sidebar
3. View all venues with their assigned vendors
4. Click "Manage" on a venue to edit details, swap vendor, or toggle featured status
5. Click "+ Add Venue" to create a new venue and assign it to a vendor
6. To delete a venue, open it via "Manage" and click "Delete"

---

## Unit tests

### HD contextual unit tests (6 total)

The HD requirement is **6 contextual unit tests**. As confirmed with the tutor,
they are split across the two backends:

- **4 tests in the REST API (`/backend`, Node + Express)**
- **2 tests in the GraphQL admin API (`/admin-backend`) covering Venue CRUD**

Each test opens with a CONTEXT comment block explaining why it exists.
---

**`/backend` — 4 tests** (`backend/src/__tests__/`):

```bash
cd backend
npm install

# Run all tests
npm test

# Run a single file
npx jest src/__tests__/auth.signup.test.ts
npx jest src/__tests__/booking.create.test.ts
npx jest src/__tests__/reputation.compute.test.ts
npx jest src/__tests__/vendor.stats.test.ts
```
- `auth.signup.test.ts` — the API rejects weak passwords even when the React
  form is bypassed (OWASP A07).
- `booking.create.test.ts` — a hirer cannot book a date the vendor has blocked
  (`409 timeslot blocked`), guarding the stale-frontend race condition. 
- `reputation.compute.test.ts` — average-reputation edge cases (zero → `null`,
  single → exact value, many → mean rounded to 1dp), using `node:assert/strict`.
- `vendor.stats.test.ts` — a brand-new vendor with no venues/bookings gets a
  `200` with zeroed/empty data, never a `500` (empty-aggregate edge case). 
---

**`/admin-backend` — 2 tests** (`admin-backend/src/__tests__/`):

```bash
cd admin-backend
npm install

# Run all tests
npm test

# Run a single file
npx jest src/__tests__/venue.crud.test.ts
```

- `venue.crud.test.ts` — two tests on the admin GraphQL CRUD resolvers: *(Emma)*
  - `createVenue` refuses a duplicate (same name + location) and never saves it.
  - `deleteVenue` removes an existing venue and returns `true`.

Stack: **Jest + ts-jest + supertest + node:assert** in `/backend`;
**Jest + ts-jest** (resolvers called directly) in `/admin-backend`.
See `backend/README.md` for full details.

--- 

### Frontend tests (my-app)

```bash
cd my-app

# Run all tests
npm test

# Run vendor tests
npx jest src/__tests__/vendorTests.test.tsx

# Clear Jest cache and run tests
npx jest --no-cache src/__tests__/vendorTests.test.tsx

# Watch mode (re-run tests on file changes)
npx jest --watchAll
```
- `src/__tests__/vendorTests.test.tsx` — sign-in form validation tests. Verifies that the sign-in form correctly rejects invalid inputs (missing email, weak password, empty fields) before any API call is made, ensuring frontend validation works independently of the backend.

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
│   ├── pdfStorage.ts                                # Helper utility for handling PDF compliance document uploads
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
## Project Structure - VenueVendors Backend (/backend)

```
├── src
│   ├── __tests__                         # Jest contextual unit tests (HD requirement)
│   │   ├── auth.signup.test.ts                   # Tests API rejects weak passwords (OWASP A07)
│   │   ├── booking.create.test.ts                # Tests hirer cannot book a vendor-blocked date
│   │   ├── reputation.compute.test.ts            # Tests reputation average edge cases
│   │   └── vendor.stats.test.ts                  # Tests stats endpoint returns 200 for new vendor with no data
│   ├── controller                        # Express route handler functions
│   │   ├── authController.ts                     # Sign-up, sign-in, sign-out, profile endpoints
│   │   ├── bookingController.ts                  # Booking creation and status retrieval
│   │   ├── hirerController.ts                    # Hirer profile, saved venues, compliance documents
│   │   ├── vendorController.ts                   # Vendor application management and hirer profile views
│   │   ├── vendorStatsController.ts              # Vendor analytics data (bookings, rejections, per-venue stats)
│   │   ├── venueBrowseController.ts              # Public venue browsing, search, and filtering
│   │   └── venueController.ts                    # Vendor venue CRUD and blockout management
│   ├── dtos                              # Data Transfer Objects — validate and shape incoming request bodies
│   │   ├── create-booking.dto.ts                 # DTO for creating a new booking
│   │   ├── create-compliance.dto.ts              # DTO for uploading a compliance document
│   │   ├── manage-venue.dto.ts                   # DTO for creating or updating a venue
│   │   ├── register.dto.ts                       # DTO for sign-up (email, password, role, name)
│   │   ├── saved-venue.dto.ts                    # DTO for saving or ranking a venue
│   │   ├── update-application-status.dto.ts      # DTO for approving or declining an application
│   │   ├── update-profile.dto.ts                 # DTO for updating user name and phone
│   │   ├── vendor-comment.dto.ts                 # DTO for adding a vendor comment on a hirer
│   │   └── venue-blockout.dto.ts                 # DTO for blocking a venue date range
│   ├── entity                             # TypeORM entity files — map to database tables
│   │   ├── Application.ts                        # Venue application submitted by a hirer
│   │   ├── Booking.ts                            # Approved booking record
│   │   ├── ComplianceDocument.ts                 # Hirer compliance document (license, insurance, cert)
│   │   ├── HirerReputationTag.ts                 # Junction table linking hirers to reputation tags
│   │   ├── ReputationTag.ts                      # Reputation tag definitions (e.g. reliable, late payer)
│   │   ├── SavedVenue.ts                         # Hirer's saved venue 
│   │   ├── User.ts                               # User account (hirer, vendor, or admin)
│   │   ├── VendorComment.ts                      # Vendor's private comment on a hirer
│   │   ├── Venue.ts                              # Venue listing owned by a vendor
│   │   ├── VenueAmenities.ts                     # Amenities associated with a venue
│   │   ├── VenueBlockedDates.ts                  # Date ranges blocked by a vendor for a venue
│   │   └── VenueSuitabilityTag.ts                # Suitability tags for a venue (e.g. wedding, concert)
│   ├── middlewares                        # Express middleware functions
│   │   ├── auth.ts                               # JWT authentication middleware — protects routes
│   │   └── validate.ts                           # Request body validation middleware using class-validator
│   ├── routes                              # Express router definitions — map URLs to controllers
│   │   ├── auth.routes.ts                        # Auth routes (sign-up, sign-in, profile)
│   │   ├── booking.routes.ts                     # Booking routes
│   │   ├── hirer.routes.ts                       # Hirer-specific routes
│   │   ├── vendor-stats.routes.ts                # Vendor analytics/stats routes
│   │   ├── vendor.routes.ts                      # Vendor management routes
│   │   └── venue.routes.ts                       # Venue browsing and management routes
│   ├── types
│   │   └── express
│   │       └── index.d.ts                        # Extends Express Request type to include authenticated user
│   ├── utils                               # Shared utility/helper functions
│   │   ├── jwt.ts                                # JWT token generation and verification helpers
│   │   └── reputation.ts                         # Hirer reputation score calculation logic
│   ├── app.ts                               # Express app setup — registers middleware and routes
│   ├── data-source.ts                       # TypeORM data source configuration and DB connection
│   └── index.ts                             # Entry point — starts the Express server
├── .env.example                             # Example environment variables (DB credentials, JWT secret)
├── .gitignore                               # Files excluded from git
├── README.md                                # Backend-specific documentation including unit test context
├── jest.config.ts                           # Jest test runner configuration
├── package-lock.json                        # Locked dependency versions
├── package.json                             # Project dependencies and scripts
└── tsconfig.json                            # TypeScript compiler configuration
```
## Project Structure - VenueVendors Console Frontend (/admin-frontend)

```
├── public
│   ├── favicon.png                                    # Browser tab icon
│   └── logo.png                                       # VenueVendors logo image asset
├── src
│   ├── components                              # Reusable React components
│   │   ├── adminDashboardLayout.tsx                   # Shared layout wrapper for all admin dashboard pages
│   │   ├── footer.tsx                                 # Site-wide footer
│   │   ├── logo.tsx                                   # VenueVendors logo component
│   │   ├── navbar.tsx                                 # Top navigation bar for the admin console
│   │   ├── protectedRoutes.tsx                        # Route guard — redirects to sign in if not authenticated
│   │   └── signout.tsx                                # Sign out button and logic
│   ├── pages                                   # Admin dashboard pages
│   │   ├── addVenue.tsx                               # Create a new venue and assign it to a vendor
│   │   ├── dashboard.tsx                              # Admin dashboard overview
│   │   ├── manageVenue.tsx                            # Edit venue details, swap vendor, toggle featured status
│   │   ├── reports.tsx                                # Top 3 popular venues and top 3 most active applicants
│   │   ├── signIn.tsx                                 # Admin sign in page (admin/admin credentials)
│   │   └── venues.tsx                                 # View and manage all venues with CRUD controls
│   ├── services                                # API service layer
│   │   ├── api.ts                                     # Shared Axios instance for any REST calls
│   │   ├── apollo-client.ts                           # Apollo Client setup — connects to admin GraphQL backend
│   │   └── graphql.ts                                 # GraphQL query and mutation definitions
│   ├── App.tsx                                        # Root app component — sets up routing and providers
│   ├── index.css                                      # Global CSS styles
│   ├── main.tsx                                       # Entry point — mounts the React app to the DOM
│   ├── theme.ts                                       # Chakra UI theme configuration (brand colours, fonts)
│   ├── venueValidation.ts                             # Form validation logic for venue forms
│   └── vite-env.d.ts                                  # Vite environment type declarations
├── .gitignore                                         # Files excluded from git
├── index.html                                         # HTML entry point for the Vite app
├── package-lock.json                                  # Locked dependency versions
├── package.json                                       # Project dependencies and scripts
├── tsconfig.json                                      # TypeScript compiler configuration
├── tsconfig.node.json                                 # TypeScript config for Vite Node environment
├── vite.config.d.ts                                   # Type declarations for Vite config
├── vite.config.js                                     # Vite configuration (JavaScript)
└── vite.config.ts                                     # Vite configuration (TypeScript — primary config file)```
```

## Project Structure - VenueVendors Console Backend (/admin-backend)

```
├── src
│   ├── __tests__                               # Jest contextual unit tests (HD requirement)
│   │   └── venue.crud.test.ts                         # Tests createVenue rejects duplicates and deleteVenue removes correctly
│   ├── entity                                  # TypeORM entity files — map to the same database tables as /backend
│   │   ├── Application.ts                             # Venue application submitted by a hirer
│   │   ├── Booking.ts                                 # Approved booking record
│   │   ├── ComplianceDocument.ts                      # Hirer compliance document (license, insurance, cert)
│   │   ├── HirerReputationTag.ts                      # Junction table linking hirers to reputation tags
│   │   ├── ReputationTag.ts                           # Reputation tag definitions (e.g. reliable, late payer)
│   │   ├── SavedVenue.ts                              # Hirer's saved/wishlisted venue with rank
│   │   ├── User.ts                                    # User account (hirer, vendor, or admin)
│   │   ├── VendorComment.ts                           # Vendor's private comment on a hirer
│   │   ├── Venue.ts                                   # Venue listing owned by a vendor
│   │   ├── VenueAmenities.ts                          # Amenities associated with a venue
│   │   ├── VenueBlockedDates.ts                       # Date ranges blocked by a vendor for a venue
│   │   └── VenueSuitabilityTag.ts                     # Suitability tags for a venue (e.g. wedding, concert)
│   ├── graphql                                 # GraphQL schema and resolver definitions
│   │   ├── resolvers.ts                               # GraphQL resolvers — handle queries and mutations for admin operations
│   │   └── schema.ts                                  # GraphQL type definitions — defines all queries, mutations, and types
│   ├── middlewares                             # Express middleware functions (auth guards for admin routes)
│   ├── migrations                              # TypeORM database migration files
│   ├── utils                                   # Shared utility/helper functions
│   │   └── jwt.ts                                     # JWT token generation and verification for admin authentication
│   ├── data-source.ts                                 # TypeORM data source configuration — connects to shared Cloud MS SQL database
│   └── index.ts                                       # Entry point — starts the Apollo GraphQL server
├── .env.example                                       # Example environment variables (DB credentials, JWT secret)
├── .gitignore                                         # Files excluded from git
├── jest.config.ts                                     # Jest test runner configuration
├── package-lock.json                                  # Locked dependency versions
├── package.json                                       # Project dependencies and scripts
└── tsconfig.json                                      # TypeScript compiler configuration
```

## Key Pages

### VenueVendors Frontend (/my-app)

### Public Pages
- `/` - Home page
- `/signin` - Sign in with email & password
- `/signup` - Create new account (hirer or vendor)
- `/browseVenues` - Browse and search all venues
- `/venues/[venueId]` - Public venue detail page
- `/about` - About page
- `/contact` - Contact page

### Hirer Pages (Protected)
- `/hirer/dashboard` - View saved venues and booking history
- `/hirer/apply?venueId=xxx` - Multi-step application form
- `/hirer/bookingHistory` - Full booking history with status
- `/hirer/myDetails` - Update profile (name, phone)
- `/hirer/complianceDocuments` - Upload compliance documents (license, insurance, business cert)
- `/hirer/savedVenues` - Manage saved venues & rankings

### Vendor Pages (Protected)
- `/vendorDashboard` - Vendor dashboard overview
- `/vendorDashboard/editVenue/[venueID]` - Edit an existing venue
- `/vendorDashboard/addVenue` - Add a new venue
- `/vendorDashboard/applications` - View & manage applications
- `/vendorDashboard/hirerProfiles/[hirerId]` - View hirer profile & compliance documents
- `/vendorDashboard/applications/[applicationID]` - View specific hirer application
- `/vendorDashboard/myDetails` - Vendor profile edit (name, phone)
- `/vendorDashboard/myVenues` - Manage vendor's venues
- `/vendorDashboard/calendar/[venueId]` - Venue availability calendar
- `/vendorDashboard/infographicReport` - Analytics dashboard with summary table (most/least/not selected)

### Admin Console (/admin-frontend)
### Admin Pages (Protected — separate console at venuevendorsconsole.onrender.com)
- `/` - Admin sign in page
- `/dashboard` - Admin dashboard overview
- `/venues` - View and manage all venues with CRUD controls
- `/venues/add` - Create a new venue and assign it to a vendor
- `/venues/manage/[venueId]` - Edit venue details, swap vendor, toggle featured status
- `/reports` - Top 3 popular venues and top 3 most active applicants

## Submission Documents

The following required documents are included in the zip submission:

- **ER Diagram** — `docs/ERD.pdf`
- **User Story List** — `docs/UserStoryList.xlsx`
- **Group Contribution Form** — `docs/GroupContributionForm.pdf`
