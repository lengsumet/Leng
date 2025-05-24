import { Elysia, t } from 'elysia';
import db from '../db';
import { ConflictError, NotFoundError } from '../errors'; // Assuming you'll create an errors.ts

export const authRoutes = new Elysia({ prefix: '/api/auth' })
  .post('/register', async ({ body, set }) => {
    const { username, email, password } = body;

    // Basic validation
    if (!username || !email || !password) {
      set.status = 400;
      return { message: 'Username, email, and password are required' };
    }

    // Check if user already exists
    const existingUser = db.query('SELECT * FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existingUser) {
      set.status = 409; // Conflict
      throw new ConflictError('Username or email already exists');
    }

    // Hash password
    const passwordHash = await Bun.password.hash(password);

    // Insert user
    const result = db.prepare('INSERT INTO users (username, email, passwordHash) VALUES (?, ?, ?) RETURNING id, username, email, role, level').get(username, email, passwordHash);
    
    if (!result) {
        set.status = 500;
        return { message: 'Failed to register user' };
    }

    set.status = 201; // Created
    return { user: result };
  }, {
    body: t.Object({
      username: t.String(),
      email: t.String(),
      password: t.String()
    })
  })
  .post('/login', async ({ body, jwt, set }) => {
    const { email, password } = body;

    if (!email || !password) {
      set.status = 400;
      return { message: 'Email and password are required' };
    }

    const user = db.query('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user) {
      set.status = 401; // Unauthorized
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await Bun.password.verify(password, user.passwordHash);

    if (!isMatch) {
      set.status = 401; // Unauthorized
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = await jwt.sign({
      userId: user.id,
      role: user.role,
      level: user.level,
    });

    return { token };
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String()
    })
  });
