import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({example: "Team 1"})
  @IsNotEmpty()
  name: string;
}