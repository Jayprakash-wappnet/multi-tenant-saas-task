import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({example: '1212221-as1211wsqw121-w12w1swq'})
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 'MEMBER' })
  @IsEnum(['TEAM_ADMIN', 'MEMBER'])
  role: 'TEAM_ADMIN' | 'MEMBER';
}