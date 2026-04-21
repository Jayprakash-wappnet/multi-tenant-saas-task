import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { TenantService } from '../../common/tenant/tenant.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt'
import { Role } from 'src/common/enums/role.enum';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { RequestUser } from 'src/common/interfaces/request-user.interface';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private tenantService: TenantService,
  ) {}

  async create(dto: CreateUserDto) {
    const tenantId = this.tenantService.getTenantId();
    
    const existingUsers = await this.findByEmail(dto.email)

    if(existingUsers) {
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

  async findAll(requestUser) {
    const tenantId = this.tenantService.getTenantId();

    if(requestUser?.role === Role.MEMBER) {
      return this.userRepo.findOne({ where: {
        id: requestUser.userId,
        tenantId
      }})
    }

    return this.userRepo.find({
      where: { tenantId },
    });
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({
      where: {email: email}
    })
  }

  async changePassword (user: RequestUser, dto: ChangePasswordDTO) {
    const userExists = await this.findByEmail(user.email)

    if(!userExists){
      throw new BadRequestException("User not found")
    }

    userExists.password = await bcrypt.hash(dto.password, 10)

    await this.userRepo.save(userExists)

    return { message: 'Password changed successfully' }
  }  
}