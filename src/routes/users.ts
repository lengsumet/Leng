import { Elysia, t } from 'elysia';
import db from '../db';
import { NotFoundError, UnauthorizedError } from '../errors';

export const userRoutes = new Elysia({ prefix: '/api/users' })
  .get('/me', async ({ jwt, set, cookie: { auth } }) => { // Assuming cookie name is 'auth'
    const profile = await jwt.verify(auth.value); // auth.value to get cookie string
    if (!profile) {
      set.status = 401;
      throw new UnauthorizedError('Unauthorized');
    }

    const user = db.query('SELECT id, username, email, role, level FROM users WHERE id = ?').get(profile.userId);

    if (!user) {
      set.status = 404;
      throw new NotFoundError('User not found');
    }

    return user;
  });
