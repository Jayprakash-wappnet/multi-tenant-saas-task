import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { TenantService } from '../../common/tenant/tenant.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt'
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

  async findAll() {
    const tenantId = this.tenantService.getTenantId();

    return this.userRepo.find({
      where: { tenantId },
    });
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({
      where: {email: email}
    })
  }
}