// venue-blockout.dto.ts - validation rules for POST /api/vendor/venues/:venueId/blockedDates.
import { IsNotEmpty, IsString, Matches } from "class-validator";

export class VenueBlockoutDTO {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "startDate must be in YYYY-MM-DD format" })
  startDate: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "endDate must be in YYYY-MM-DD format" })
  endDate: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
