import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TenantService } from 'src/common/tenant/tenant.service';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { ResetPasswordDto } from './dto/reset-password.dto';


@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private tenantService: TenantService,
        private jwtService: JwtService,

        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) { }

    async signup(dto: SignupDto) {
        const userexist = await this.userService.findByEmail(dto.email)


        if (userexist) {
            throw new BadRequestException('User is already exists in this tenant')
        }

        const hashPassword = await bcrypt.hash(dto.password, 10)

        return this.userService.create({
            email: dto.email,
            name: dto.name,
            password: hashPassword,
        })
    }

    async login(dto: LoginDto) {
        const user = await this.userService.findByEmail(dto.email)

        if (!user) {
            throw new UnauthorizedException('Invalid Credentials')
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password)

        if (!isPasswordValid) {
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

    async forgotPassword(dto: ForgotPasswordDto) {
        const user = await this.userService.findByEmail(dto.email);

        if (!user) {
            return { message: 'If email exists, reset link sent' };
        }

        const token = crypto.randomBytes(32).toString('hex');

        user.resetToken = token;
        user.resetTokenExpiry = new Date(Date.now() + 1000 * 60);

        await this.userRepo.save(user);
    }

    async resetPassword(dto: ResetPasswordDto) {
        const user = await this.userRepo.findOne({
            where: { resetToken: dto.token },
        });

        if (!user) {
            throw new BadRequestException('Invalid token');
        }

        if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            throw new BadRequestException('Token expired');
        }

        user.password = await bcrypt.hash(dto.newPassword, 10);
        user.resetToken = null;
        user.resetTokenExpiry = null;

        await this.userRepo.save(user);

        return { message: 'Password reset successful' };
    }
}
