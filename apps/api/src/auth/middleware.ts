import type { Context, Next } from 'hono';
import { auth } from '../auth';

export async function requireAuth(c: Context, next: Next) {
  if (!auth) {
    return c.json({ error: 'Auth not configured — set DATABASE_URL' }, 503);
  }

  const header = c.req.header('Authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const session = await auth.api.getSession({
    headers: new Headers({ Authorization: `Bearer ${token}` }),
  });

  if (!session?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('userId', session.user.id);
  await next();
}

export function getUserId(c: Context): string {
  return c.get('userId') as string;
}

export function getAppId(c: Context): string {
  return c.req.query('app_id') ?? c.req.header('X-App-Id') ?? 'swell';
}
