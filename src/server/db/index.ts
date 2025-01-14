import './config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

const connectionString = process.env.DATABASE_URL;
// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString!, { prepare: false })
export const db = drizzle(client);

