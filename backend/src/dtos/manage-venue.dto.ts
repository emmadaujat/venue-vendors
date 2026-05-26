// handles both edit and create venue

import { IsString, IsNumber, IsNotEmpty, IsArray, Min, MaxLength } from "class-validator";

export class ManageVenueDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsNumber()
  @Min(1)
  capacity: number;

  @IsNumber()
  @Min(1)
  pricePerDay: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  shortDescription: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  imageURL: string;

  @IsString()
  @IsNotEmpty()
  availabilityStatus: string;

  @IsArray()
  amenities: string[];

  @IsArray()
  suitabilityTags: string[];
}
