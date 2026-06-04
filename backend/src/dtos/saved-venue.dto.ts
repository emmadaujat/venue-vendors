// saved-venue.dto.ts - validation rules for saving and re-ranking venues in a hirer's saved list.
import { IsInt, Min } from "class-validator";

export class CreateSavedVenueDTO {
  @IsInt()
  @Min(1)
  venueID: number;

  @IsInt()
  @Min(1)
  rankingOrder: number;
}

export class UpdateSavedVenueDTO {
  @IsInt()
  @Min(1)
  rankingOrder: number;
}
