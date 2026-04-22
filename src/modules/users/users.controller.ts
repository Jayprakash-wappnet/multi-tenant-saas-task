import { Controller, Get, Post, Body, UseGuards, Req, Put, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { GetUsersDto } from './dto/get-users.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users for tenant' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  findAll(
    @Query() query: GetUsersDto,
    @Req() req) {
    return this.usersService.findAll(query, req.user);
  }

  @Put('change-password')
  @ApiOperation({summary: "Change password"})
  changePassword(@Req() req, @Body() dto: ChangePasswordDTO){
    return this.usersService.changePassword(req.user, dto)
  }
}