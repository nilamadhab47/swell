import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer } from 'better-auth/plugins';
import { db } from '../db/client';
import * as schema from '../db/schema';

export const auth = db
  ? betterAuth({
      database: drizzleAdapter(db, {
        provider: 'pg',
        schema: {
          user: schema.user,
          session: schema.session,
          account: schema.account,
          verification: schema.verification,
        },
      }),
      emailAndPassword: {
        enabled: true,
      },
      plugins: [bearer()],
      trustedOrigins: ['*'],
    })
  : null;

export type AuthSession = {
  user: { id: string; name: string; email: string };
  session: { id: string; token: string };
};
