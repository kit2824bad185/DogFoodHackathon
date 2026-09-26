import { db } from './index';
import { users } from './schema';
import { logger } from '../config/logger';

async function seed() {
  logger.info('Seeding database...');
  
  try {
    // Insert dummy user
    await db.insert(users).values({
      id: 'demo-user-1',
      email: 'admin@dogfood.local',
      passwordHash: 'dummy_hash', // replace with actual hash logic when auth is implemented
      role: 'admin',
    }).onConflictDoNothing();

    logger.info('Seeding completed successfully.');
  } catch (err) {
    logger.error({ err }, 'Seeding failed');
    process.exit(1);
  }
}

seed();
