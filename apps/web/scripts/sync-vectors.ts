import { prisma } from '@nebula/database';
import { vectorHubService } from '@nebula/integrations';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  console.log('🚀 Starting full vector synchronization...');

  try {
    // 1. Sync Coaches
    console.log('\n--- Syncing Coaches ---');
    const coaches = await prisma.coach.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: { fullName: true, email: true, avatarUrl: true, role: true },
        },
        specialties: { include: { category: true } },
        experiences: { orderBy: { startDate: 'desc' } },
      },
    });

    console.log(`Found ${coaches.length} active coaches.`);

    for (const coach of coaches) {
      // We need to transform the Prisma coach to the format the service expects if needed
      // But for simplicity, we can just use the mapping logic or pass it as is if it matches
      const transformedCoach = {
        ...coach,
        fullName: coach.user?.fullName || '',
        specialties: coach.specialties.map(s => s.category.name),
      };
      
      await vectorHubService.syncCoachToVector(transformedCoach);
      console.log(`✅ Synced Coach: ${transformedCoach.fullName}`);
    }

    // 2. Sync Programs
    console.log('\n--- Syncing Programs ---');
    const programs = await prisma.program.findMany({
      where: { isActive: true, status: 'ACTIVE' },
      include: {
        category: true,
      },
    });

    console.log(`Found ${programs.length} active programs.`);

    for (const program of programs) {
      await vectorHubService.syncProgramToVector(program);
      console.log(`✅ Synced Program: ${program.title}`);
    }

    console.log('\n✨ Vector synchronization completed successfully!');
  } catch (error) {
    console.error('\n❌ Vector synchronization failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
