import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TenantService } from 'src/common/tenant/tenant.service';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private tenantService: TenantService,
        private jwtService: JwtService
    ) {}

    async signup(dto: SignupDto) {
        const userexist =  await this.userService.findByEmail(dto.email)
      

        if(userexist) {
            throw new BadRequestException('User is already exists in this tenant')
        }

        const hashPassword = await bcrypt.hash(dto.password, 10)

        return this.userService.create({
            email: dto.email,
            name: dto.name,
            password: hashPassword,
        })
    }

    async login (dto: LoginDto){
        const user = await this.userService.findByEmail(dto.email)

        if(!user) {
            throw new UnauthorizedException('Invalid Credentials')
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password)

        if(!isPasswordValid){
            throw new UnauthorizedException('Invalid Credentials')
        }

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId
        }

        const accessToken = await this.jwtService.signAsync(payload)

        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                tenantId: user.tenantId
            }
        }


    }
}
