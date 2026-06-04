// create-booking.dto.ts - validation rules for the POST /api/bookings request body.
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
  @IsInt()
  @Min(1)
  venueID: number;

  // < and > are rejected to prevent XSS injection through event names.
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  @Matches(/^[^<>]*$/, { message: "eventName must not contain < or >" })
  eventName: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  eventType: string;

  @IsDateString()
  eventDate: string;

  @IsOptional()
  @IsDateString()
  eventEndDate?: string;

  @IsInt()
  @Min(1)
  @Max(10000)
  guestCount: number;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  additionalNotes?: string;
}
