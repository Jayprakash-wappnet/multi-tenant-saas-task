import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Task } from './task.entity';
import { User } from '../users/user.entity';

@Entity('task_assignments')
@Index(['task', 'user'], { unique: true })
export class TaskAssignment extends BaseEntity {
  @Column()
  tenantId: string;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}