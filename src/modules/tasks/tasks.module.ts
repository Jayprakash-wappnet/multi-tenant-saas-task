import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TenantService } from 'src/common/tenant/tenant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from '../teams/team.entity';
import { TeamMember } from '../teams/team-member.entity';
import { User } from '../users/user.entity';
import { Task } from './task.entity';
import { TaskAssignment } from './task-assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Team, TeamMember, User, Task, TaskAssignment])],
  providers: [TasksService, TenantService],
  controllers: [TasksController]
})
export class TasksModule {}
