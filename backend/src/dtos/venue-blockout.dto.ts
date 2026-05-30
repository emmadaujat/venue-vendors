// ===========================================================
// venue-blockout.dto.ts — validates the body when a vendor
// creates a new blocked period for a venue.
// Used by the POST /venues/:venueId/blockedDates route.
// ===========================================================

import { IsNotEmpty, IsString, Matches } from "class-validator";

export class VenueBlockoutDTO {
  // startDate must be a non-empty string in YYYY-MM-DD format
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "startDate must be in YYYY-MM-DD format",
  })
  startDate: string;

  // endDate must be a non-empty string in YYYY-MM-DD format
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "endDate must be in YYYY-MM-DD format",
  })
  endDate: string;

  // reason is required — e.g. "Maintenance", "Private Event"
  @IsString()
  @IsNotEmpty()
  reason: string;
}
