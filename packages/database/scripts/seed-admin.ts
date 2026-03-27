import "dotenv/config";
import {
  prisma,
  UserRole,
  UserStatus,
} from "../index";
import bcrypt from "bcryptjs";

async function createAdminUser() {
  try {
    console.log("🚀 Seeding admin user...");

    // Admin user details
    const adminEmail = "admin@nebula.com";
    const adminDisplayName = "Nebula Admin";
    const adminPass = "admin123!";
    
    // Check if admin user exists
    let prismaUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!prismaUser) {
      // Generate avatar URL
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        "NA"
      )}&background=random&color=fff&size=200&rounded=true`;
      const hashedPassword = await bcrypt.hash(adminPass, 12);
      
      console.log("📄 Creating user document in database...");
      prismaUser = await prisma.user.create({
        data: {
          email: adminEmail,
          hashedPassword,
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
          fullName: adminDisplayName,
          avatarUrl: avatarUrl,
        },
      });
      console.log("✅ User document created with admin role");
    } else {
      // Update existing user to ensure admin role
      if (prismaUser.role !== UserRole.ADMIN) {
        console.log("📝 Updating existing user to admin role...");
        prismaUser = await prisma.user.update({
          where: { email: adminEmail },
          data: { role: UserRole.ADMIN, status: UserStatus.ACTIVE },
        });
        console.log("✅ User role updated to admin");
      } else {
        console.log("ℹ️  Database admin user already exists with correct role");
      }
    }

    console.log("\n🎉 Admin user setup complete!");
    console.log("==========================================");
    console.log("📧 Email:    ", adminEmail);
    console.log("🆔 Database ID: ", prismaUser.id);
    console.log("🔐 Role:     ", prismaUser.role);
    console.log("==========================================");
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log("\n✅ Admin seeding completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });

export default createAdminUser;
