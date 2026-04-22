import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { TenantService } from '../../common/tenant/tenant.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt'
import { Role } from 'src/common/enums/role.enum';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { RequestUser } from 'src/common/interfaces/request-user.interface';
import { SelectQueryBuilder } from 'typeorm/browser';
import { GetUsersDto } from './dto/get-users.dto';
import { UserVm } from './vm/user.vm';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private tenantService: TenantService,
  ) { }

  async create(dto: CreateUserDto) {
    const tenantId = this.tenantService.getTenantId();

    const existingUsers = await this.findByEmail(dto.email)

    if (existingUsers) {
      throw new BadRequestException('User is already exists in this tenant')
    }

    const hashPassword = await bcrypt.hash(dto.password, 10)

    const payload = {
      email: dto.email,
      name: dto.name,
      password: hashPassword,
      tenantId: tenantId
    }
    const user = this.userRepo.create(payload);

    return this.userRepo.save(user);
  }

  async findAll(query: GetUsersDto, currentUser: RequestUser) {
    const tenantId = this.tenantService.getTenantId();

    const {
      page,
      per_page,
      search,
      sort_by = 'createdAt',
      sort_order = 'DESC',
      isActive,
    } = query;

    const qb: SelectQueryBuilder<User> =
      this.userRepo.createQueryBuilder('user');

    qb.where('user.tenantId = :tenantId', { tenantId });

    if (!['ADMIN', 'OWNER'].includes(currentUser.role)) {
      qb.andWhere('user.id = :userId', {
        userId: currentUser.userId,
      });
    }

    if (isActive !== undefined) {
      qb.andWhere('user.isActive = :isActive', {
        isActive: isActive === 'true',
      });
    }

    if (search) {
      qb.andWhere(
        '(user.email ILIKE :search OR user.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const allowedSortFields: (keyof User)[] = [
      'name',
      'email',
      'createdAt',
    ];

    const sortField = allowedSortFields.includes(sort_by as keyof User)
      ? sort_by
      : 'createdAt';

    qb.orderBy(`user.${sortField}`, sort_order);

    if (!['ADMIN', 'OWNER'].includes(currentUser.role)) {
      const user = await qb.getOne();

      return {
        data: user ? [UserVm] : [],
        meta: null,
      };
    }

    if (!page || !per_page) {
      const users = await qb.getMany();

      return {
        data: users,
        meta: null,
      };
    }

    const skip = (page - 1) * per_page;

    qb.skip(skip).take(per_page);

    const [users, total] = await qb.getManyAndCount();

    return {
      data: users,
      meta: {
        total,
        page,
        per_page,
        total_pages: Math.ceil(total / per_page),
      },
    };
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({
      where: { email: email }
    })
  }

  async changePassword(user: RequestUser, dto: ChangePasswordDTO) {
    const userExists = await this.findByEmail(user.email)

    if (!userExists) {
      throw new BadRequestException("User not found")
    }

    userExists.password = await bcrypt.hash(dto.password, 10)

    await this.userRepo.save(userExists)

    return { message: 'Password changed successfully' }
  }
}