// ===========================================================
// register.dto.ts - rules for registering new user
// ===========================================================

import { IsEmail, IsNotEmpty, IsString, Matches, MinLength, IsIn } from "class-validator";

export class RegisterDTO {
  // only these two values are valid roles
  @IsIn(["vendor", "hirer"], { message: "Role must be either 'vendor' or 'hirer'" })
  role: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  // Australian mobile format: 10 digits starting with 04
  @Matches(/^04\d{8}$/, {
    message: "Phone number must be a valid Australian mobile number (10 digits starting with 04)",
  })
  phoneNumber: string;

  // Password rules: min 6 chars, uppercase, lowercase, number, special character
  @MinLength(6, { message: "Password must be at least 6 characters" })
  @Matches(/[A-Z]/, { message: "Must contain an uppercase letter" })
  @Matches(/[a-z]/, { message: "Must contain a lowercase letter" })
  @Matches(/\d/, { message: "Must contain a number" })
  @Matches(/[^a-zA-Z0-9]/, { message: "Must contain a special character" })
  password: string;
}
