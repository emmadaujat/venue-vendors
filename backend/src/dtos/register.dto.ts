// register.dto.ts - validation rules for the POST /api/register request body.
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength, IsIn } from "class-validator";

export class RegisterDTO {
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

  @Matches(/^04\d{8}$/, {
    message: "Phone number must be a valid Australian mobile number (10 digits starting with 04)",
  })
  phoneNumber: string;

  @MinLength(6, { message: "Password must be at least 6 characters" })
  @Matches(/[A-Z]/, { message: "Must contain an uppercase letter" })
  @Matches(/[a-z]/, { message: "Must contain a lowercase letter" })
  @Matches(/\d/, { message: "Must contain a number" })
  @Matches(/[^a-zA-Z0-9]/, { message: "Must contain a special character" })
  password: string;
}
