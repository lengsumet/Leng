import { Elysia, t, type Static } from 'elysia';
import db from '../db';
import { ConflictError } from '../errors'; // UnauthorizedError can be removed if global error handling in index.ts covers it or if .derive handles auth failure

// Define the expected user payload type from JWT (consistent with src/index.ts)
interface UserJWTPayload {
  userId: number;
  role: 'user' | 'admin';
  level: 'silver' | 'gold' | 'platinum';
  // Add other potential JWT claims like iat, exp if needed for type safety
}

// Define schema for request body for type safety and validation by Elysia
const CreateUserBodySchema = t.Object({
  username: t.String({ minLength: 3, maxLength: 50, error: "Username must be between 3 and 50 characters." }),
  email: t.String({ format: 'email', error: "Invalid email format." }),
  password: t.String({ minLength: 8, maxLength: 100, error: "Password must be between 8 and 100 characters." })
});

// Define schema for the successful response payload
const UserResponseSchema = t.Object({
  id: t.Integer(),
  username: t.String(),
  email: t.String(),
  role: t.String(), // For more specific validation: t.Union([t.Literal('user'), t.Literal('admin')])
  level: t.String(), // Similarly: t.Union([t.Literal('silver'), t.Literal('gold'), t.Literal('platinum')])
});

export const adminRoutes = new Elysia({ prefix: '/api/admin' })
  .decorate('db', db)
  // Apply a guard to all routes within this admin plugin
  .guard({
    beforeHandle: ({ set, user }) => { // `user` is derived in src/index.ts
      const currentUser = user as UserJWTPayload | null; // Type assertion
      if (!currentUser) {
        set.status = 401; // Unauthorized
        // This message will be overridden by the global onError if UnauthorizedError is thrown
        // or if the response schema for 401 is defined.
        return { message: 'Unauthorized: Authentication required.' }; 
      }
      if (currentUser.role !== 'admin') {
        set.status = 403; // Forbidden
        return { message: 'Forbidden: Admin role required.' };
      }
    }
  })
  .post('/users', 
    async ({ db, body, set }) => { 
      // Role check is handled by the .guard above.
      // Input validation (format, length) is handled by Elysia via `body: CreateUserBodySchema`.
      const { username, email, password } = body; // `body` is already validated

      // Check for existing users (username or email)
      const { rows: existingUsers } = await query('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
      if (existingUsers.length > 0) {
        set.status = 409; // Conflict
        // Use the ConflictError class for consistency with global error handling
        throw new ConflictError('Username or email already exists.'); 
      }

      // Hash password using Bun.password
      const passwordHash = await Bun.password.hash(password, {
        algorithm: "bcrypt", // Explicitly state algorithm
        cost: 10,            // Default cost factor for Bun.password is 10
      });

      // Insert new user. Role is 'user', level is 'silver' by default.
      try {
        const insertResult = await query(
          'INSERT INTO users (username, email, passwordHash, role, level) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role, level',
          [username, email, passwordHash, 'user', 'silver']
        );
        const newUser = insertResult.rows[0] as Static<typeof UserResponseSchema> | undefined;

        if (!newUser) {
          // This should ideally not happen if the query is correct and DB is responsive,
          // unless there's a very specific trigger or constraint not allowing the insert
          // that doesn't throw an error (which is unusual).
          set.status = 500;
          return { message: 'Failed to create user due to an unexpected database error.' };
        }
        
        set.status = 201; // Created
        return { user: newUser };

      } catch (e: any) {
        console.error("Admin User Creation Error:", e.message);
        // Check if the error is due to a unique constraint violation (race condition, etc.)
        if (e.code === 'SQLITE_CONSTRAINT_UNIQUE' || e.message.includes('UNIQUE constraint failed')) {
            set.status = 409;
            throw new ConflictError('Username or email already exists.');
        }
        // For other DB errors or unexpected issues:
        set.status = 500;
        // It's often better to throw an error here and let the global onError handle it
        // for consistent error response formatting.
        throw new Error('An unexpected error occurred while creating the user.');
      }
    },
    { // Route-specific configuration
      body: CreateUserBodySchema, // Validates request body
      response: { // Defines expected response structure for different status codes
        201: t.Object({ user: UserResponseSchema }),
        // Error responses will be handled by global .onError or can be defined here too
        // For example, if global onError doesn't format validation errors the way you want for this specific route:
        // 400: t.Object({ message: t.String(), errors: t.Optional(t.Any()) }), 
        // 409: t.Object({ message: t.String() })
      },
      detail: { // OpenAPI documentation details
        summary: 'Admin: Create New User',
        description: 'Allows an administrator to create a new user with default role "user" and level "silver".',
        tags: ['Admin', 'Users']
      }
    }
  );
