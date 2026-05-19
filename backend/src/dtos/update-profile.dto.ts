// ===========================================================
// update-profile.dto.ts - rules for "hirer edits their details"
// ===========================================================
// Used by the My Details page (PUT /api/hirer/profile). The hirer
// can change their name and phone number. Email is NOT here on
// purpose - the email is the account's identity and stays fixed.
// ===========================================================

import { IsString, IsNotEmpty, IsOptional, Length, Matches } from "class-validator";

export class UpdateProfileDTO {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  lastName: string;

  // Australian mobile: exactly 10 digits starting with 04.
  // Same rule as the frontend (validation.ts) so both ends agree.
  @IsString()
  @Matches(/^04\d{8}$/, {
    message: "phoneNumber must be 10 digits starting with 04",
  })
  phoneNumber: string;

  // Optional friendly display name.
  @IsOptional()
  @IsString()
  @Length(0, 50)
  displayName?: string;
}
