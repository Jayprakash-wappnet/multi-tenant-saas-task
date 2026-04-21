import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsEnum, IsUUID, IsArray } from 'class-validator';
import { TaskPriority } from '../../../common/enums/task-priority.enum';

export class CreateTaskDto {
  @ApiProperty({ example: 'Task Title'})
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Task Description', required: false })
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '65s6as874sw-sa541s8a4-sa4-sas5659sa'})
  @IsUUID()
  teamId: string;

  @ApiProperty({ enum: TaskPriority, required: false })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  assignedUserIds?: string[];
}