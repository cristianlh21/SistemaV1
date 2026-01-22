// prisma.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // CAMBIO: Usamos tsx y forzamos la lectura del .env desde el comando
    seed: 'npx tsx --env-file=.env ./prisma/seed.ts', 
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});