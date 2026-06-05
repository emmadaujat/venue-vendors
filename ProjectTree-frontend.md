# File Tree: my-app

```

```

├── src
│ ├── **tests** # Jest unit tests
│ │ └── vendorTests.test.tsx # Vendor sign-in form validation tests
│ ├── components # Reusable React components
│ │ ├── applySteps # Multi-step application form components
│ │ │ ├── StepAccount.tsx # Step 1 — account details
│ │ │ ├── StepDocuments.tsx # Step 4 — compliance document uploads
│ │ │ ├── StepEventDetails.tsx # Step 2 — event details
│ │ │ ├── StepReputation.tsx # Step 3 — hirer reputation tags
│ │ │ └── StepReview.tsx # Step 5 — review and submit
│ │ ├── footer.tsx # Site-wide footer
│ │ ├── graph.tsx # Recharts infographic component for vendor analytics
│ │ ├── hirerSidebar.tsx # Sidebar navigation for hirer dashboard
│ │ ├── logo.tsx # VenueVendors logo component
│ │ ├── navbar.tsx # Top navigation bar with auth links
│ │ ├── signout.tsx # Sign out button and logic
│ │ └── vendorDashboardLayout.tsx # Shared layout wrapper for vendor dashboard pages
│ ├── contexts
│ │ └── AuthContext.tsx # React context for global auth state
│ ├── hooks # Custom React hooks
│ │ ├── vendor # Vendor-specific data fetching hooks
│ │ │ ├── useHirerBookingHistory.ts # Fetches full booking history for a specific hirer
│ │ │ ├── useHirerCompliance.ts # Fetches compliance documents and credibility score for a hirer
│ │ │ ├── useVendorApplications.ts # Fetches all applications for the vendor's venues
│ │ │ ├── useVendorBookings.ts # Fetches all approved bookings for the vendor
│ │ │ ├── useVendorComments.ts # Fetches and manages vendor comments on hirers
│ │ │ ├── useVendorVenues.ts # Fetches all venues owned by the vendor
│ │ │ └── useVenueBlockouts.ts # Fetches and manages blocked date periods for a venue
│ │ ├── useApplicationForm.ts # All state and logic for the multi-step application form
│ │ └── useAuth.ts # Auth hook — checks login state and protects routes
│ ├── pages # Next.js pages router
│ │ ├── hirer # Hirer dashboard pages (protected)
│ │ │ ├── apply.tsx # Multi-step venue application form
│ │ │ ├── bookingHistory.tsx # Hirer's full booking history and application status
│ │ │ ├── complianceDocuments.tsx # Upload compliance documents (license, insurance, business cert)
│ │ │ ├── dashboard.tsx # Hirer dashboard overview
│ │ │ ├── myDetails.tsx # Update hirer profile (name, phone)
│ │ │ ├── reputation.tsx # View reputation tags and credibility score
│ │ │ ├── savedVenues.tsx # Manage saved venues and rankings
│ │ │ └── userProfile.tsx # Hirer public profile view
│ │ ├── vendorDashboard # Vendor dashboard pages (protected)
│ │ │ ├── applications
│ │ │ │ └── [applicationID].tsx # Full application review page for a specific application
│ │ │ ├── calendar
│ │ │ │ └── [venueId].tsx # Venue availability calendar and blockout management
│ │ │ ├── editVenue
│ │ │ │ └── [venueID].tsx # Edit an existing venue's details
│ │ │ ├── hirerProfiles
│ │ │ │ └── [hirerId].tsx # View a specific hirer's profile and compliance documents
│ │ │ ├── addVenue.tsx # Add a new venue
│ │ │ ├── applications.tsx # List of all applications across vendor's venues
│ │ │ ├── hirerProfiles.tsx # List of all hirers who have applied
│ │ │ ├── index.tsx # Vendor dashboard overview
│ │ │ ├── infographicReport.tsx # Analytics dashboard with charts and summary table
│ │ │ ├── myDetails.tsx # Update vendor profile (name, phone)
│ │ │ └── myVenues.tsx # Manage vendor's venues (view, edit, delete)
│ │ ├── venues
│ │ │ └── [venueId].tsx # Public venue detail page
│ │ ├── \_app.tsx # Next.js app wrapper — global providers and theme
│ │ ├── \_document.tsx # Next.js document wrapper — custom HTML head
│ │ ├── about.tsx # About page
│ │ ├── browseVenues.tsx # Browse and search all venues
│ │ ├── contact.tsx # Contact page
│ │ ├── index.tsx # Home/landing page
│ │ ├── signin.tsx # Sign in page
│ │ └── signup.tsx # Sign up page (hirer or vendor)
│ ├── services # Axios API service layer
│ │ ├── api.ts # Shared Axios instance with base URL and JWT interceptor
│ │ ├── authApi.ts # Auth API calls (sign in, sign up, sign out)
│ │ ├── hirerApi.ts # Hirer API calls (venues, bookings, compliance, saved venues)
│ │ └── vendorApi.ts # Vendor API calls (applications, venues, comments, blockouts)
│ ├── styles # Global CSS styles
│ │ └── globals.css  
│ ├── helpersUtil.tsx # Shared UI helper functions (star rendering, status colours)
│ ├── hirerRatingCalculation.ts # Hirer reputation score and badge calculation
│ ├── pdfStorage.ts # Helper utility for handling PDF compliance document uploads
│ ├── theme.ts # Chakra UI theme configuration (brand colours, fonts)
│ ├── types.ts # Shared TypeScript type definitions
│ ├── validation.ts # Form validation logic for sign up and sign in
│ └── venueValidation.ts # Form validation logic for venue forms
├── .gitignore # Files excluded from git
├── eslint.config.mjs # ESLint configuration
├── jest.config.ts # Jest test runner configuration
├── jest.setup.ts # Jest setup file (global test configuration)
├── next.config.ts # Next.js configuration
├── package-lock.json # Locked dependency versions
├── package.json # Project dependencies and scripts
├── postcss.config.mjs # PostCSS configuration for Tailwind/CSS processing
└── tsconfig.json # TypeScript compiler configuration

```
---
*Generated by FileTree Pro Extension*
```
