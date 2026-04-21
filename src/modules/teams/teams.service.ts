import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Team } from './team.entity';
import { TeamMember } from './team-member.entity';
import { TenantService } from '../../common/tenant/tenant.service'; 
import { Role } from 'src/common/enums/role.enum';
import { RequestUser } from 'src/common/interfaces/request-user.interface';
import { AddMemberDto } from './dto/add-member.dto';
import { User } from '../users/user.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamRepo: Repository<Team>,

    @InjectRepository(TeamMember)
    private teamMemberRepo: Repository<TeamMember>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  
    private tenantService: TenantService,
  ) {}

  async create(name: string, user: RequestUser) {
    const tenantId = this.tenantService.getTenantId();

    try {
    const team = await this.teamRepo.save({
      name,
      tenantId,
      createdBy: user.userId,
    });
    return team;
  } catch (error) {
    if (
      error instanceof QueryFailedError &&
      (error as any).code === '23505'
    ) {
      throw new BadRequestException(
        `Team '${name}' already exists in this tenant`,
      );
    }

    throw error;
  }
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
    try {
      return await this.teamMemberRepo.save({
        team: { id: teamId },
        user: { id: dto.userId },
        role: dto.role,
        tenantId,
        createdBy: user.userId,
      });
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505'
      ) {
        throw new BadRequestException('User already exists in this team');
      }
      throw error;
    }
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

  try {
    return await this.teamMemberRepo.save({
      team: { id: teamId },
      user: { id: dto.userId },
      role: dto.role,
      tenantId,
      createdBy: user.userId,
    });
  } catch (error) {
    if (
      error instanceof QueryFailedError &&
      (error as any).code === '23505'
    ) {
      throw new BadRequestException('User already exists in this team');
    }
    throw error;
  }
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
}