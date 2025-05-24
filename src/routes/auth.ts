import { Elysia, t } from 'elysia';
import { query } from '../db'; // Import the pg-compatible query function
import { ConflictError, NotFoundError, UnauthorizedError } from '../errors'; 

// Define expected user structure from DB, excluding passwordHash for responses
interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  level: 'silver' | 'gold' | 'platinum';
  // Add createdAt, updatedAt if you want them in the profile
}

export const authRoutes = new Elysia({ prefix: '/api/auth' })
  .post('/register', 
    async ({ body, set }) => {
      const { username, email, password } = body;
      // Input validation is handled by Elysia's schema

      try {
        // Check if user already exists
        const checkUserResult = await query('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
        if (checkUserResult.rows.length > 0) {
          set.status = 409; // Conflict
          throw new ConflictError('Username or email already exists');
        }

        // Hash password
        const passwordHash = await Bun.password.hash(password, { algorithm: "bcrypt", cost: 10 });

        // Insert user
        // Default role 'user' and level 'silver' are set by the DB schema
        const insertResult = await query(
          'INSERT INTO users (username, email, passwordHash) VALUES ($1, $2, $3) RETURNING id, username, email, role, level',
          [username, email, passwordHash]
        );
        
        const newUser: UserProfile | undefined = insertResult.rows[0];

        if (!newUser) {
          set.status = 500;
          // Log this server-side for investigation
          console.error("User registration: RETURNING clause did not return user data.", { username, email });
          return { message: 'Failed to register user due to a server error.' };
        }

        set.status = 201; // Created
        return { user: newUser };

      } catch (err: any) {
        // Log the error for debugging
        console.error("Registration Error:", err.message);
        if (err instanceof ConflictError) {
            set.status = 409;
            return { message: err.message };
        }
        // Handle other potential errors (e.g., DB connection issues)
        set.status = 500;
        return { message: 'An unexpected error occurred during registration.' };
      }
    }, 
    { // Elysia validation schema
      body: t.Object({
        username: t.String({ minLength: 3, maxLength: 50 }),
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 8, maxLength: 100 })
      }),
      response: { // Define expected response schemas
        201: t.Object({ user: t.Object({
            id: t.Number(),
            username: t.String(),
            email: t.String(),
            role: t.String(),
            level: t.String()
        }) }),
        400: t.Object({ message: t.String(), errors: t.Optional(t.Any()) }),
        409: t.Object({ message: t.String() }),
        500: t.Object({ message: t.String() })
      }
    }
  )
  .post('/login', 
    async ({ body, jwt, set }) => {
      const { email, password } = body;
      // Input validation handled by Elysia

      try {
        const result = await query('SELECT id, username, email, passwordHash, role, level FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
          set.status = 401; // Unauthorized
          throw new UnauthorizedError('Invalid credentials. User not found.');
        }

        const isMatch = await Bun.password.verify(password, user.passwordhash); // Note: pg returns lowercase column names by default

        if (!isMatch) {
          set.status = 401; // Unauthorized
          throw new UnauthorizedError('Invalid credentials. Password mismatch.');
        }

        // Ensure JWT secret is loaded correctly
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("JWT_SECRET is not set!");
            set.status = 500;
            return { message: "Authentication configuration error." };
        }
        
        const token = await jwt.sign({
          userId: user.id,
          role: user.role,
          level: user.level,
        });

        return { token };

      } catch (err: any) {
        console.error("Login Error:", err.message);
        if (err instanceof UnauthorizedError) {
            set.status = 401;
            return { message: err.message };
        }
        set.status = 500;
        return { message: 'An unexpected error occurred during login.' };
      }
    }, 
    { // Elysia validation schema
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String()
      }),
      response: {
        200: t.Object({ token: t.String() }),
        400: t.Object({ message: t.String(), errors: t.Optional(t.Any()) }),
        401: t.Object({ message: t.String() }),
        500: t.Object({ message: t.String() })
      }
    }
  );
