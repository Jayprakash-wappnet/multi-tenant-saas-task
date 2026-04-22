import { User } from "../entities/user.entity";

export class UserVm {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.role = user.role;
    this.isActive = user.isActive;
    this.createdAt = user.createdAt;
  }

  static fromEntity(user: User): UserVm {
    return new UserVm(user);
  }

  static fromEntities(users: User[]): UserVm[] {
    return users.map((user) => new UserVm(user));
  }
}