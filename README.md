# Bun Elysia Project with PostgreSQL

This project is a backend server built with Bun and Elysia.js, now using PostgreSQL as its database.

## Prerequisites

- [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/) (Recommended for local PostgreSQL setup) or a local PostgreSQL installation.

## Local Development Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install Dependencies
```bash
bun install
```

### 3. Set Up PostgreSQL Database

The project requires a PostgreSQL database.

**Using Docker (Recommended):**

Run the following command to start a PostgreSQL instance in Docker:
```bash
docker run --name dev-postgres -e POSTGRES_USER=youruser -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=yourdbname -p 5432:5432 -d postgres:latest
```
**Note:** 
- Replace `youruser`, `yourpassword`, and `yourdbname` with your desired credentials and database name.
- These values must match the environment variables you set for the application (see step 4).

**Using a Local PostgreSQL Installation:**

If you have PostgreSQL installed locally, ensure it's running and you have a database and user created for this project.

**Database Initialization:**
The application is configured to automatically create the necessary `users` table (and other related schema like triggers) on startup if it doesn't already exist, thanks to the `initializeDatabaseSchema` function in the database configuration.

### 4. Configure Environment Variables

This project requires certain environment variables to be set for database connection and JWT authentication. Create a `.env` file in the root of the backend project:

```
# .env example - Make sure this file is in your .gitignore!

# PostgreSQL Connection Details
PG_HOST=localhost
PG_PORT=5432
PG_USER=youruser       # Replace with your PostgreSQL username
PG_PASSWORD=yourpassword # Replace with your PostgreSQL password
PG_DATABASE=yourdbname   # Replace with your PostgreSQL database name

# JWT Secret
JWT_SECRET=yoursupersecretjwtkey # Replace with a strong, unique secret key

# Optional: Frontend API URL (if your frontend uses a .env file)
# VITE_API_URL=http://localhost:3000/api 
```

**Important:**
- Ensure the `PG_USER`, `PG_PASSWORD`, and `PG_DATABASE` values in your `.env` file match what you configured for your PostgreSQL instance (e.g., in the Docker command).
- Add `.env` to your `.gitignore` file to prevent committing your local environment variables.

## Running the Server

Once the database is running and environment variables are set:

1.  **Start the backend server:**
    ```bash
    bun run src/index.ts
    ```
    (If you have a `dev` script in `package.json`, like `bun run dev`, you can use that too.)

2.  The server will attempt to connect to PostgreSQL and should start on port 3000 (or as configured).
    You can access the "Hello World" endpoint at `http://localhost:3000/`. Other API endpoints will be available under `/api/...`.

## Project Structure Overview (Backend)
(You can add more details here if needed)
- `src/`: Contains the main application code.
  - `db/`: Database connection, schema initialization.
  - `routes/`: API route definitions (auth, admin, users).
  - `errors.ts`: Custom error classes.
  - `index.ts`: Main Elysia application setup and startup.
- `package.json`, `bun.lockb`: Project dependencies.
- `tsconfig.json`: TypeScript configuration.
- `README.md`: This file.

## API Endpoints
(Consider adding a brief overview or link to API documentation if available)
- `/api/auth/register`: User registration.
- `/api/auth/login`: User login.
- `/api/users/me`: Get current user profile (protected).
- `/api/admin/users`: Create new user (admin only).
```
