import { Database } from 'bun:sqlite';

const db = new Database('mydb.sqlite', { create: true });

// Create users table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
    level TEXT NOT NULL DEFAULT 'silver' CHECK(level IN ('silver', 'gold', 'platinum'))
  )
`);

export default db;
