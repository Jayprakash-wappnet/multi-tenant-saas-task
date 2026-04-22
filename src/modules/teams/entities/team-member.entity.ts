import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Team } from './team.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('team_members')
@Index(['team', 'user'], { unique: true }) 
export class TeamMember extends BaseEntity {
  @Column()
  tenantId: string;

  @Column({
    type: 'enum',
    enum: ['TEAM_ADMIN', 'MEMBER'],
    default: 'MEMBER',
  })
  role: 'TEAM_ADMIN' | 'MEMBER';

  @ManyToOne(() => Team, (team) => team.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}