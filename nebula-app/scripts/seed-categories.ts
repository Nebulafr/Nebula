import "dotenv/config";
import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const categories = [
  {
    name: "Career Prep",
    slug: "career-prep",
    isActive: true,
  },
  {
    name: "School Admissions",
    slug: "school-admissions",
    isActive: true,
  },
  {
    name: "Technology",
    slug: "technology",
    isActive: true,
  },
  {
    name: "Entertainment",
    slug: "entertainment",
    isActive: true,
  },
  {
    name: "Business & Finance",
    slug: "business-finance",
    isActive: true,
  },
  {
    name: "Creative Arts",
    slug: "creative-arts",
    isActive: true,
  },
  {
    name: "Health & Wellness",
    slug: "health-wellness",
    isActive: true,
  },
  {
    name: "Language Learning",
    slug: "language-learning",
    isActive: true,
  },
];

async function seedCategories() {
  try {
    console.log("🌱 Starting to seed categories...");

    for (const category of categories) {
      const existing = await prisma.category.findUnique({
        where: { slug: category.slug },
      });

      if (existing) {
        console.log(
          `📝 Category "${category.name}" already exists, skipping...`
        );
        continue;
      }

      const created = await prisma.category.create({
        data: category,
      });

      console.log(`✅ Created category: ${created.name}`);
    }

    console.log("🎉 Categories seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedCategories().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export default seedCategories;
