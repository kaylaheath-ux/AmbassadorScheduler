import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Next.js loads .env automatically, so we read DATABASE_URL directly.
const connectionString = `${process.env.DATABASE_URL}`;

// In development, Next.js hot-reloads modules on every change, which would
// otherwise spawn a fresh PrismaClient (and a new connection pool) each time.
// Caching the client on globalThis keeps a single instance across reloads.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma };
