import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { Team } from './entities/team.entity';
import { TenantService } from '../../common/tenant/tenant.service';
import { User } from '../users/entities/user.entity';
import { TaskAssignment } from '../tasks/entities/task-assignment.entity';
import { Task } from '../tasks/entities/task.entity';
import { TeamMember } from './entities/team-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Team, TeamMember, User, Task, TaskAssignment])],
  providers: [TeamsService, TenantService],
  controllers: [TeamsController],
})
export class TeamsModule {}
