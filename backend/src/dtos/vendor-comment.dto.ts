import { IsNotEmpty, IsString } from "class-validator";

export class VendorCommentDTO {
  @IsString()
  @IsNotEmpty()
  commentText: string;
}
