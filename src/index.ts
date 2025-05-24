import { Elysia } from 'elysia';
import { jwt, JWTPayloadSpec } from '@elysiajs/jwt'; // Import JWTPayloadSpec
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { adminRoutes } from './routes/admin'; // Import adminRoutes
import { ConflictError, NotFoundError, UnauthorizedError } from './errors';

// Define a type for our expected JWT payload
interface UserJWTPayload extends JWTPayloadSpec {
  userId: number;
  role: 'user' | 'admin';
  level: 'silver' | 'gold' | 'platinum';
  // Add other fields if they exist in your JWT payload
}

const app = new Elysia()
  .use(jwt({
    name: 'jwt', // This is how we access jwt functions: context.jwt.sign, context.jwt.verify
    secret: process.env.JWT_SECRET || 'YOUR_SECRET_KEY_REPLACE_ME_IN_PROD', 
    // schema: t.Object({ // Optional: Define expected payload schema for validation by jwt plugin
    //   userId: t.Number(),
    //   role: t.String(),
    //   level: t.String()
    // })
  }))
  .derive(async ({ jwt, cookie: { auth } }) => { // Derive user from JWT if present
    if (!auth || !auth.value) {
      return { user: null };
    }
    try {
      const payload = await jwt.verify(auth.value) as UserJWTPayload | false;
      if (payload) {
        return { user: payload }; // Make user payload available as context.user
      }
      return { user: null };
    } catch (error) {
      // Token verification failed (expired, invalid, etc.)
      return { user: null };
    }
  })
  .onError(({ code, error, set }) => {
    // console.error("Global Error:", code, error.message); // For debugging
    if (error instanceof ConflictError) {
      set.status = 409;
      return { message: error.message };
    }
    if (error instanceof NotFoundError) {
      set.status = 404;
      return { message: error.message };
    }
    if (error instanceof UnauthorizedError) {
      set.status = 401;
      return { message: error.message };
    }
    if (code === 'VALIDATION') { // Handle Elysia's built-in validation errors
        set.status = 400;
        return { message: "Validation Error", errors: error.message }; // error.message contains details
    }
    if (code === 'NOT_FOUND') {
        set.status = 404;
        return { message: "Endpoint not found." };
    }
    // Default error handling
    set.status = 500;
    return { message: 'Internal Server Error' };
  })
  .get('/', () => 'Hello World')
  .group('/api', (group) => group // Changed to (group) => group.use(...)
    .use(authRoutes)
    .use(userRoutes)
    .use(adminRoutes) // Add admin routes
  );


// Replace YOUR_SECRET_KEY with a strong secret, ideally from an environment variable
if (!process.env.JWT_SECRET) {
  console.warn("Warning: JWT_SECRET is not set. Using default secret. THIS IS NOT SAFE FOR PRODUCTION.");
}

app.listen(3000, () => {
  console.log('Server listening on port 3000. JWT Secret: ' + (process.env.JWT_SECRET ? "Loaded from ENV" : "Default (Insecure)"));
});
