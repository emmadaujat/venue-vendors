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
- **GitHub Repo URL:** https://github.com/rmit-fsd-2026-s1/a1-fsd-pra01-07-tue-2-30pm-veronika-team12

---


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

- **Frontend**: React 18 with TypeScript (Functional Components + Hooks)
- **Framework**: Next.js 13+ (Pages Router)
- **Styling**: Chakra UI + Tailwind CSS
- **State Management**: React Hooks (localStorage, useState, useEffect)
- **Data Persistence**: HTML5 localStorage (no database)
- **Testing**: Jest + React Testing Library + node:assert

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

## Unit tests (Jest + React Testing Library) 

- Install dependencies (if not already installed):

```bash
cd my-app
npm install
```

- Run the test suite:

```bash
cd my-app
npm test
```

- Test files are in `src/__tests__/`:
  - `hirerTests.test.tsx` — venue filter logic and form validation (StepEventDetails)
  - `vendorTests.test.tsx` — sign-in validation and successful login + redirect

- Jest config: `jest.config.ts` and setup file `jest.setup.ts` (loads `@testing-library/jest-dom`).

- To generate a coverage report:

```bash
cd my-app
npx jest --coverage
```

---

## Project Structure

```
src/
├── pages/              # Next.js pages and routes
│   ├── hirer/         # Hirer dashboard, applications, booking history
│   │   ├── apply.tsx                    # Multi-step application form
│   │   ├── bookingHistory.tsx           # Booking history & status
│   │   ├── complianceDocuments.tsx      # Upload compliance docs (license, insurance, business cert)
│   │   ├── dashboard.tsx                # Hirer dashboard
│   │   ├── myDetails.tsx                # Update profile (name, phone)
│   │   └── savedVenues.tsx              # Manage saved venues & rankings
│   ├── vendorDashboard/  # Vendor dashboard, applications, infographics
│   │   ├── index.tsx                    # Vendor dashboard overview
│   │   ├── applications.tsx             # View & manage applications
│   │   ├── infographicReport.tsx        # Analytics & insights with summary table
│   │   ├── myDetails.tsx                # Vendor profile edit (name, phone)
│   │   ├── myVenues.tsx                 # Manage vendor's venues
│   │   ├── applications/[hirerId].tsx   # View hirer details & documents
│   │   ├── calendar/[venueId].tsx       # Venue availability calendar
│   │   └── hirerProfiles/[hirerId].tsx  # View hirer profile & compliance docs
│   ├── signin.tsx     # Sign-in page
│   ├── signup.tsx     # Sign-up page
│   └── browseVenues.tsx  # Venue browsing & search
├── components/         # Reusable React components
│   ├── navbar.tsx     # Navigation bar (with Sign Up link)
│   ├── footer.tsx     # Footer
│   ├── graph.tsx      # Recharts infographic component
│   ├── hirerSidebar.tsx    # Hirer sidebar navigation
│   ├── vendorDashboardLayout.tsx  # Vendor dashboard layout with sidebar
│   ├── signout.tsx    # Sign-out component
│   ├── logo.tsx       # Logo component
│   └── applySteps/    # Multi-step application form components
├── hooks/             # Custom React hooks
│   ├── useAuth.ts     # Authentication logic
│   └── useApplicationForm.ts  # Application form state
├── __tests__/         # Jest unit tests
│   ├── hirerTests.test.tsx      # Hirer feature tests (with node:assert)
│   └── vendorTests.test.tsx     # Vendor feature tests
├── pdfStorage.ts      # IndexedDB helper for PDF persistence
├── types.ts           # TypeScript type definitions
├── dummyData.ts       # Sample data (users, venues, bookings, applications)
├── validation.ts      # Form validation logic
├── theme.ts           # Chakra UI theme configuration
├── getApplications.ts # Application filtering & retrieval
├── ratingCalculation.ts  # Hirer credibility & vendor rating calculations
└── styles/            # Global CSS styles
    └── globals.css
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
