import { IsNotEmpty, IsString } from "class-validator";

export class UpdateApplicationStatusDTO {
  @IsString()
  @IsNotEmpty()
  status: string;
}
