import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  createTask(
    @Body() dto: CreateTaskDto,
    @Req() req,
  ) {
    return this.tasksService.createTask(dto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get tasks based on role' })
  getTasks(@Req() req) {
    return this.tasksService.getTasks(req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  updateTask(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @Req() req,
  ) {
    return this.tasksService.updateTask(id, dto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  deleteTask(
    @Param('id') id: string,
    @Req() req,
  ) {
    return this.tasksService.deleteTask(id, req.user);
  }
}