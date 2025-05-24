import { Pool } from 'pg';

// Create a new PostgreSQL connection pool
const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: Number(process.env.PG_PORT) || 5432,
  // max: 20,
  // idleTimeoutMillis: 30000,
  // connectionTimeoutMillis: 2000,
});

// Export a query function that uses the pool
export const query = (text: string, params?: any[]) => pool.query(text, params);

// Export the pool itself for direct use if needed (e.g., transactions)
export const db = pool;

// DDL for User table (PostgreSQL compatible)
const createUsersTableQuery = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
  level TEXT NOT NULL DEFAULT 'silver' CHECK(level IN ('silver', 'gold', 'platinum')),
  createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
`;

// Function to create a trigger that updates 'updatedAt' timestamp
const createUpdatedAtTriggerFunctionQuery = `
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';
`;

const applyUpdatedAtTriggerQuery = `
DROP TRIGGER IF EXISTS set_timestamp ON users; -- Drop if exists to avoid errors on re-run
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
`;

export async function initializeDatabaseSchema() {
  try {
    await pool.query(createUsersTableQuery);
    console.log("Users table schema initialized successfully or already exists.");
    
    // Create or replace the trigger function
    await pool.query(createUpdatedAtTriggerFunctionQuery);
    console.log("update_updated_at_column trigger function created or updated.");

    // Apply the trigger to the users table
    await pool.query(applyUpdatedAtTriggerQuery);
    console.log("set_timestamp trigger applied to users table.");

  } catch (err: any) { // Use `any` or `unknown` and then check type if needed
    console.error("Error initializing database schema:", err.message || err);
    // Depending on the application's needs, you might want to re-throw the error
    // or exit the process if the DB schema initialization is critical.
    throw err; // Re-throw to indicate a critical startup failure
  }
}

// Connection test and schema initialization
pool.connect(async (err, client, release) => {
  if (err) {
    console.error('Error acquiring client for PostgreSQL connection test:', err.stack);
    // Consider exiting or setting an app-wide error state if DB connection is critical
    process.exit(1); // Exit if cannot connect to DB
    return;
  }
  try {
    const result = await client.query('SELECT NOW()');
    console.log('PostgreSQL connected successfully. Current time from DB:', result.rows[0].now);
    
    // Initialize schema after successful connection
    await initializeDatabaseSchema();

  } catch (initErr: any) {
    console.error('Error during initial query or schema initialization:', initErr.stack);
    process.exit(1); // Exit if core DB setup fails
  } finally {
    release(); // Release the client back to the pool
  }
});

// Note: The old SQLite table creation logic and export have been removed.
// The application's route handlers will need to be updated to use the new `query` function
// and PostgreSQL-compatible SQL syntax (e.g., $1, $2 placeholders and result.rows).
// This will be handled in the subsequent steps.
