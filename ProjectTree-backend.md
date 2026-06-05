# File Tree: backend

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

---

_Generated by FileTree Pro Extension_
