import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TenantService } from 'src/common/tenant/tenant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from '../teams/entities/team.entity';
import { User } from '../users/entities/user.entity';
import { Task } from './entities/task.entity';
import { TaskAssignment } from './entities/task-assignment.entity';
import { TeamMember } from '../teams/entities/team-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Team, TeamMember, User, Task, TaskAssignment])],
  providers: [TasksService, TenantService],
  controllers: [TasksController]
})
export class TasksModule {}
