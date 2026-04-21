import { Body, Controller, Post } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) {}

    @Post('signup')
    @ApiHeader({
        name: 'x-tenant-id',
        required: true,
        description: 'Tenant ID'
    })
    @ApiOperation({summary: 'Sign-up API'})
    signup(@Body() dto: SignupDto){
        return this.authService.signup(dto)
    }

    @Post('login')
    @ApiOperation({summary: 'Log-in API'})
    @ApiResponse({status: 200, description: 'Login successfull'})
    login(@Body() dto: LoginDto){
        return this.authService.login(dto)
    }
}
