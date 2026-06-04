// create-compliance.dto.ts - validation rules for the POST /api/hirer/compliance request body.
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  Length,
} from "class-validator";

export class CreateComplianceDTO {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  documentType: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  fileName: string;

  // Stored as a base64 data URL (e.g. "data:application/pdf;base64,...").
  @IsOptional()
  @IsString()
  fileURL?: string;

  @IsOptional()
  @IsBoolean()
  isBusiness?: boolean;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  abnNumber?: string;
}
