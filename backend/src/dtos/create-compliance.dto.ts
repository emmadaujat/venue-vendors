// ===========================================================
// create-compliance.dto.ts - rules for uploading a compliance doc
// ===========================================================
// The hirer uploads documents (insurance, licence, business cert)
// to build trust with vendors. The actual file is stored on the
// browser side per the assignment; here we save the metadata
// (what type it is, the file name, optional ABN for businesses).
// ===========================================================
// compliance documents
// ===========================================================

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  Length,
} from "class-validator";

export class CreateComplianceDTO {
  // e.g. "Public Liability Insurance", "Drivers License",
  // "Business Registration Certificate".
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  documentType: string;

  // The original file name the hirer uploaded, e.g. "licence.pdf".
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  fileName: string;

  // Optional link/reference to where the file lives.
  @IsOptional()
  @IsString()
  @Length(0, 500)
  fileURL?: string;

  // True when the hirer is representing a business/organisation.
  @IsOptional()
  @IsBoolean()
  isBusiness?: boolean;

  // Only required (on the frontend) when isBusiness is true.
  @IsOptional()
  @IsString()
  @Length(0, 50)
  abnNumber?: string;
}
