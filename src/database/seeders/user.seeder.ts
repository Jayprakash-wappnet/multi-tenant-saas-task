import { DataSource } from 'typeorm';
import { User } from '../../modules/users/user.entity';
import * as bcrypt from 'bcrypt';

export async function seedUsers(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);

  const users = [
    {
      email: 'admin1@yopmail.com',
      name: 'Admin Tenant 1',
      password: await bcrypt.hash('Wappnet@123', 10),
      role: 'ADMIN' as const,
      tenantId: 'tenant1',
      isActive: true,
    },
    {
      email: 'admin2@yopmail.com',
      name: 'Admin Tenant 2',
      password: await bcrypt.hash('Wappnet@123', 10),
      role: 'ADMIN' as const,
      tenantId: 'tenant2',
      isActive: true,
    },
  ];

  for (const userData of users) {
    const exists = await userRepo.findOne({
      where: {
        email: userData.email,
        tenantId: userData.tenantId,
      },
    });

    if (!exists) {
      const user = userRepo.create(userData);
      await userRepo.save(user);
      console.log(`Seeded: ${user.email}`);
    } else {
      console.log(` Already exists: ${exists.email}`);
    }
  }
}