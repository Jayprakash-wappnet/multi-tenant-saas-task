import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { RequestUser } from 'src/common/interfaces/request-user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from '../teams/entities/team.entity';
import { In, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { TenantService } from 'src/common/tenant/tenant.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { TaskAssignment } from './entities/task-assignment.entity';
import { TeamMember } from '../teams/entities/team-member.entity';

@Injectable()
export class TasksService {

  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,

    @InjectRepository(TaskAssignment)
    private taskAssignmentRepo: Repository<TaskAssignment>,

    @InjectRepository(Team)
    private teamRepo: Repository<Team>,

    @InjectRepository(TeamMember)
    private teamMemberRepo: Repository<TeamMember>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    private tenantService: TenantService,
  ) { }

  async createTask(dto: CreateTaskDto, user: RequestUser) {
    const tenantId = this.tenantService.getTenantId();

    const team = await this.teamRepo.findOne({
      where: { id: dto.teamId, tenantId },
    });

    if (!team) {
      throw new BadRequestException('Invalid team');
    }

    if (!['ADMIN', 'OWNER'].includes(user.role)) {
      // check if TEAM_ADMIN
      const membership = await this.teamMemberRepo.findOne({
        where: {
          team: { id: dto.teamId },
          user: { id: user.userId },
          tenantId,
        },
      });

      if (!membership || membership.role !== 'TEAM_ADMIN') {
        throw new ForbiddenException('Not allowed to create task');
      }
    }

    const task = await this.taskRepo.save({
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      tenantId,
      team: { id: dto.teamId },
      createdBy: user.userId,
    });

    if (dto.assignedUserIds?.length) {
      const users = await this.userRepo.find({
        where: {
          id: In(dto.assignedUserIds),
        },
      });

      const invalidUser = users.find((u) => u.tenantId !== tenantId);
      if (invalidUser) {
        throw new BadRequestException('User does not belong to tenant');
      }

      const teamMembers = await this.teamMemberRepo.find({
        where: {
          team: { id: dto.teamId },
          tenantId,
        },
        relations: ['user'],
      });

      const teamUserIds = teamMembers.map((tm) => tm.user.id);

      const invalidAssignment = dto.assignedUserIds.find(
        (id) => !teamUserIds.includes(id),
      );

      if (invalidAssignment) {
        throw new BadRequestException(
          'User must belong to the team to be assigned',
        );
      }

      const assignments = dto.assignedUserIds.map((userId) => ({
        task: { id: task.id },
        user: { id: userId },
        tenantId,
        createdBy: user.userId,
      }));

      await this.taskAssignmentRepo.save(assignments);
    }

    return task;
  }

  async getTasks(user: RequestUser) {
    const tenantId = this.tenantService.getTenantId();

    if (['ADMIN', 'OWNER'].includes(user.role)) {
      return this.taskRepo.find({
        where: { tenantId },
        relations: ['team'],
        order: { createdAt: 'DESC' },
      });
    }

    const teamMemberships = await this.teamMemberRepo.find({
      where: {
        user: { id: user.userId },
        tenantId,
        role: 'TEAM_ADMIN',
      },
      relations: ['team'],
    });

    const teamIds = teamMemberships.map((tm) => tm.team.id);

    if (teamIds.length > 0) {
      return this.taskRepo.find({
        where: {
          tenantId,
          team: { id: In(teamIds) },
        },
        relations: ['team'],
        order: { createdAt: 'DESC' },
      });
    }

    const assignments = await this.taskAssignmentRepo.find({
      where: {
        user: { id: user.userId },
        tenantId,
      },
      relations: ['task'],
    });

    return assignments.map((a) => a.task);
  }

  async updateTask(
    taskId: string,
    dto: UpdateTaskDto,
    user: RequestUser,
  ) {
    const tenantId = this.tenantService.getTenantId();

    const task = await this.taskRepo.findOne({
      where: { id: taskId, tenantId },
      relations: ['team'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!['ADMIN', 'OWNER'].includes(user.role)) {
      const membership = await this.teamMemberRepo.findOne({
        where: {
          team: { id: task.team.id },
          user: { id: user.userId },
          tenantId,
        },
      });

      if (!membership || membership.role !== 'TEAM_ADMIN') {
        throw new ForbiddenException('Not allowed to update task');
      }
    }

    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.status !== undefined) task.status = dto.status;

    task.updatedBy = user.userId;

    await this.taskRepo.save(task);

    if (dto.assignedUserIds) {
      const users = await this.userRepo.find({
        where: {
          id: In(dto.assignedUserIds),
        },
      });

      const invalidUser = users.find((u) => u.tenantId !== tenantId);
      if (invalidUser) {
        throw new BadRequestException('User does not belong to tenant');
      }

      const teamMembers = await this.teamMemberRepo.find({
        where: {
          team: { id: task.team.id },
          tenantId,
        },
        relations: ['user'],
      });

      const teamUserIds = teamMembers.map((tm) => tm.user.id);

      const invalidAssignment = dto.assignedUserIds.find(
        (id) => !teamUserIds.includes(id),
      );

      if (invalidAssignment) {
        throw new BadRequestException(
          'User must belong to the team to be assigned',
        );
      }

      await this.taskAssignmentRepo.delete({
        task: { id: taskId },
        tenantId,
      });

      const newAssignments = dto.assignedUserIds.map((userId) => ({
        task: { id: taskId },
        user: { id: userId },
        tenantId,
        createdBy: user.userId,
      }));

      await this.taskAssignmentRepo.save(newAssignments);
    }

    return task;
  }

  async deleteTask(taskId: string, user: RequestUser) {
    const tenantId = this.tenantService.getTenantId();

    const task = await this.taskRepo.findOne({
      where: { id: taskId, tenantId },
      relations: ['team'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!['ADMIN', 'OWNER'].includes(user.role)) {
      const membership = await this.teamMemberRepo.findOne({
        where: {
          team: { id: task.team.id },
          user: { id: user.userId },
          tenantId,
        },
      });

      if (!membership || membership.role !== 'TEAM_ADMIN') {
        throw new ForbiddenException('Not allowed to delete task');
      }
    }

    await this.taskRepo.softDelete({
      id: taskId,
      tenantId,
    });

    return {
      message: 'Task deleted successfully',
    };
  }
}
