import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { Team } from './team.entity';
import { TeamMember } from './team-member.entity';
import { TenantService } from '../../common/tenant/tenant.service';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Team, TeamMember, User])],
  providers: [TeamsService, TenantService],
  controllers: [TeamsController],
})
export class TeamsModule {}
