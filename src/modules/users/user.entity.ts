import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('users')
@Index(['email', 'tenantId'], { unique: true }) // same email allowed in different tenants
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column()
  tenantId: string;

  @Column({ default: 'changeme' })
  password: string;

  @Column({
    type: 'enum',
    enum: ['ADMIN', 'MEMBER'],
    default: 'MEMBER',
  })
  role: 'ADMIN' | 'MEMBER';

  @Column({ default: true })
  isActive: boolean;
}
