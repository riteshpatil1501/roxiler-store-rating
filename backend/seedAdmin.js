const bcrypt = require("bcryptjs");
const prisma = require("./src/config/prisma");

const createAdmin = async () => {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
      },
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("Admin@1234", 10);

    const admin = await prisma.user.create({
      data: {
        name: "System Administrator",
        email: "admin@roxiler.com",
        password: hashedPassword,
        address: "Roxiler Office",
        role: "ADMIN",
      },
    });

    console.log("Admin created successfully");
    console.log(`Admin email: ${admin.email}`);
  } catch (error) {
    console.error("Failed to create admin:", error);
  } finally {
    await prisma.$disconnect();
  }
};

createAdmin();