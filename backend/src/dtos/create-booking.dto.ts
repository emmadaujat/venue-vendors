// ===========================================================
// create-booking.dto.ts - rules for "a hirer applies for a venue"
// ===========================================================
// A DTO ("Data Transfer Object") is just a small class that
// describes the shape of the JSON the browser is allowed to send.
// The class-validator decorators (@IsInt, @Min ...) are the rules.
// The validateDto middleware (week9 pattern) checks every rule
// BEFORE the controller runs, so the controller can trust the data.
//
// Mirrors the week9 lecture DTO style (dtos/create-pet.dto.ts).
// ===========================================================

import {
  IsInt,
  IsString,
  IsNotEmpty,
  IsOptional,
  Min,
  Max,
  Length,
  Matches,
  IsDateString,
} from "class-validator";

export class CreateBookingDTO {
  // Which venue the hirer wants. Must be a positive whole number.
  @IsInt()
  @Min(1)
  venueID: number;

  // The name of the event, e.g. "Annual Awards Night".
  // 2–100 characters, and we block < and > so nobody can try to
  // sneak HTML/script tags in (a simple XSS guard — week11 idea).
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  @Matches(/^[^<>]*$/, { message: "eventName must not contain < or >" })
  eventName: string;

  // The kind of event, e.g. "Wedding" / "Corporate".
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  eventType: string;

  // The date of the event. IsDateString accepts values like
  // "2026-09-06" (what an <input type="date"> sends).
  @IsDateString()
  eventDate: string;

  // Optional end date for multi-day events.
  @IsOptional()
  @IsDateString()
  eventEndDate?: string;

  // How many guests. At least 1, and we cap at 10000 so a typo
  // like 9999999 cannot get into the database.
  @IsInt()
  @Min(1)
  @Max(10000)
  guestCount: number;

  // Extra notes for the vendor. Optional, max 1000 chars.
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  additionalNotes?: string;
}
