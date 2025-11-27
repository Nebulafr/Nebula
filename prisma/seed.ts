import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync } from "fs";
import { join } from "path";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

// Load categories data for seeding
const dataDir = join(process.cwd(), "data");
const categories = JSON.parse(readFileSync(join(dataDir, "categories.json"), "utf-8"));

async function seedCategories() {
  console.log("🌱 Seeding categories...");

  for (const category of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug: category.slug },
    });

    if (existing) {
      console.log(`📝 Category "${category.name}" already exists, skipping...`);
      continue;
    }

    const created = await prisma.category.create({
      data: category,
    });

    console.log(`✅ Created category: ${created.name}`);
  }

  console.log("🎉 Categories seeded successfully!");
}

async function main() {
  try {
    console.log("🚀 Starting database seed...");

    await seedCategories();

    console.log("✨ Database seed completed successfully!");
    console.log("📝 Note: Mock data for coaches, students, programs, etc. is available in the /data directory for development use.");
  } catch (error) {
    console.error("❌ Error during seed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
