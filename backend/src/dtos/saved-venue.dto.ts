// ===========================================================
// saved-venue.dto.ts - rules for the hirer's "Saved Venues" list
// ===========================================================
// Two DTOs here:
//   CreateSavedVenueDTO — used when the hirer saves a new venue
//   UpdateSavedVenueDTO — used when the hirer changes the rank
// ===========================================================

import { IsInt, Min } from "class-validator";

export class CreateSavedVenueDTO {
  // The venue being added to the saved list.
  @IsInt()
  @Min(1)
  venueID: number;

  // Where it sits in the hirer's preference order (1 = top choice).
  @IsInt()
  @Min(1)
  rankingOrder: number;
}

export class UpdateSavedVenueDTO {
  // The new preference position for an already-saved venue.
  @IsInt()
  @Min(1)
  rankingOrder: number;
}
