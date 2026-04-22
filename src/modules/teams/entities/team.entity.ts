import {
  Entity,
  Column,
  OneToMany,
  Index,
} from 'typeorm';
import { TeamMember } from './team-member.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('teams')
@Index(['name', 'tenantId'], { unique: true }) 
export class Team extends BaseEntity{

  @Column()
  name: string;

  @Column()
  tenantId: string;

  @OneToMany(() => TeamMember, (tm) => tm.team)
  members: TeamMember[];
}