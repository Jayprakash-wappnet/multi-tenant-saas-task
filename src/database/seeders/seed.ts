import { AppDataSource } from '../data-source';
import { seedUsers } from './user.seeder';

async function runSeed() {
    await AppDataSource.initialize();

    console.log('Seeding started...');

    await seedUsers(AppDataSource);

    console.log('Seeding completed');

    await AppDataSource.destroy();

    process.exit();
}

runSeed();