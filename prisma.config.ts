import { defineConfig } from "@prisma/config";

export default defineConfig({
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgrespassword@localhost:5432/jobtracker?schema=public",
  },
});