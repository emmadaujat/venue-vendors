// update-profile.dto.ts - validation rules for PUT /api/hirer/profile and PUT /api/vendor/profile.
// Email is intentionally excluded - it is the account identity and cannot be changed.

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

  @IsString()
  @Matches(/^04\d{8}$/, { message: "phoneNumber must be 10 digits starting with 04" })
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  displayName?: string;
}
