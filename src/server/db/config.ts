import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

// Define the database connection string
export const connectionString = process.env.DATABASE_URL
// Compare this snippet from src/server/db/schema.ts: