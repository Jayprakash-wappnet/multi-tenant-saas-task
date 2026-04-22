import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { TenantService } from '../../common/tenant/tenant.service';
import { Role } from 'src/common/enums/role.enum';
import { RequestUser } from 'src/common/interfaces/request-user.interface';
import { AddMemberDto } from './dto/add-member.dto';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { TaskAssignment } from '../tasks/entities/task-assignment.entity';
import { TeamMember } from './entities/team-member.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamRepo: Repository<Team>,

    @InjectRepository(TeamMember)
    private teamMemberRepo: Repository<TeamMember>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Task)
    private taskRepo: Repository<Task>,

    @InjectRepository(TaskAssignment)
    private taskAssignmentRepo: Repository<Task>,

    private tenantService: TenantService,
  ) { }

  async create(name: string, user: RequestUser) {
    const tenantId = this.tenantService.getTenantId();

    const team = await this.teamRepo.save({
      name,
      tenantId,
      createdBy: user.userId,
    });
    return team;
  }

  async addMember(
    teamId: string,
    dto: AddMemberDto,
    user: RequestUser,
  ) {
    const tenantId = this.tenantService.getTenantId();

    const team = await this.teamRepo.findOne({
      where: { id: teamId, tenantId },
    });

    if (!team) {
      throw new ForbiddenException('Invalid team');
    }

    const targetUser = await this.userRepo.findOne({
      where: { id: dto.userId, tenantId },
    });

    if (!targetUser) {
      throw new ForbiddenException('User does not belong to this tenant');
    }

    if (['ADMIN', 'OWNER'].includes(user.role)) {
      return await this.teamMemberRepo.save({
        team: { id: teamId },
        user: { id: dto.userId },
        role: dto.role,
        tenantId,
        createdBy: user.userId,
      });
    }

    const existing = await this.teamMemberRepo.findOne({
      where: {
        team: { id: teamId },
        user: { id: user.userId },
        tenantId,
      },
    });

    if (!existing || existing.role !== 'TEAM_ADMIN') {
      throw new ForbiddenException('Not allowed');
    }

    return await this.teamMemberRepo.save({
      team: { id: teamId },
      user: { id: dto.userId },
      role: dto.role,
      tenantId,
      createdBy: user.userId,
    });
  }

  async getMyTeams(user: RequestUser) {
    const tenantId = this.tenantService.getTenantId();

    if ([Role.ADMIN, Role.OWNER].includes(user.role)) {
      return this.teamRepo.find({
        where: {
          tenantId
        },
      });
    }

    const memberships = await this.teamMemberRepo.find({
      where: {
        user: { id: user.userId },
        tenantId,
      },
      relations: ['team'],
    });
    return memberships.map((m) => m.team);
  }

  async deleteTeam(teamId: string, user: RequestUser) {
    const tenantId = this.tenantService.getTenantId();

    const team = await this.teamRepo.findOne({
      where: { id: teamId, tenantId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (!['ADMIN', 'OWNER'].includes(user.role)) {
      throw new ForbiddenException('Only admin can delete team');
    }

    await this.teamMemberRepo.softDelete({
      team: { id: teamId },
      tenantId,
    });

    const tasks = await this.taskRepo.find({
      where: {
        team: { id: teamId },
        tenantId,
      },
    });

    const taskIds = tasks.map((t) => t.id);

    if (taskIds.length > 0) {
      await this.taskAssignmentRepo
        .createQueryBuilder()
        .softDelete()
        .where('taskId IN (:...taskIds)', { taskIds })
        .andWhere('tenantId = :tenantId', { tenantId })
        .execute();
    }

    await this.taskRepo.softDelete({
      team: { id: teamId },
      tenantId,
    });

    await this.teamRepo.softDelete({
      id: teamId,
      tenantId,
    });

    return {
      message: 'Team deleted successfully',
    };
  }

  async removeUserFromTeam(
    teamId: string,
    userId: string,
    currentUser: RequestUser,
  ) {
    const tenantId = this.tenantService.getTenantId();

    const team = await this.teamRepo.findOne({
      where: { id: teamId, tenantId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const membership = await this.teamMemberRepo.findOne({
      where: {
        team: { id: teamId },
        user: { id: userId },
        tenantId,
      },
    });

    if (!membership) {
      throw new NotFoundException('User is not part of this team');
    }

    if (['ADMIN', 'OWNER'].includes(currentUser.role)) {
    } else {
      const currentMembership = await this.teamMemberRepo.findOne({
        where: {
          team: { id: teamId },
          user: { id: currentUser.userId },
          tenantId,
        },
      });

      if (
        !currentMembership ||
        currentMembership.role !== 'TEAM_ADMIN'
      ) {
        throw new ForbiddenException('Not allowed');
      }
    }

    if (currentUser.userId === userId) {
      throw new BadRequestException('You cannot remove yourself from team');
    }

    await this.teamMemberRepo.softDelete({
      team: { id: teamId },
      user: { id: userId },
      tenantId,
    });

    return {
      message: 'User removed from team successfully',
    };
  }
}