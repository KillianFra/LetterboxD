import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/server/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: "postgres://default:HKrdnX1fLUZ5@ep-raspy-tree-a4dyv7cu-pooler.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require",
  },
});