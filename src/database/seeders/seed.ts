import { AppDataSource } from '../data-source';

async function runSeed() {
    await AppDataSource.initialize();

    console.log('Seeding done');
    process.exit();
}

runSeed();