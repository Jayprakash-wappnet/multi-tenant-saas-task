import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class ChangePasswordDTO {
    @ApiProperty({example: "strongPassword123"})
    @IsNotEmpty()
    password: string
}