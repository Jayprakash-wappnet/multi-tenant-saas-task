import { Role } from '../enums/role.enum';

export interface RequestUser {
  userId: string;
  email: string;
  tenantId: string;
  role: Role;
}