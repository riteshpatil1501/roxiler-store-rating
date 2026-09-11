const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

dotenv.config();

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),

  // Render → Aiven can take longer than Prisma 7's
  // default 1-second connection timeout.
  connectTimeout: 10000,
  acquireTimeout: 30000,

  ssl: {
    rejectUnauthorized: false,
  },
});

const prisma = new PrismaClient({ adapter });

module.exports = prisma;