import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/server/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: "postgresql://postgres.dmgyvngrstdlxqigyfgs:ynovtest2024@aws-0-us-east-1.pooler.supabase.com:6543/postgres",
  },
});