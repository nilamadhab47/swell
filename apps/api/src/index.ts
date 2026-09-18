import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { eq, and, sql } from 'drizzle-orm';
import { auth } from './auth';
import { requireAuth, getUserId, getAppId } from './auth/middleware';
import { db } from './db/client';
import { cravings, profiles, insights } from './db/schema';
import { createPresignedUploadUrl } from './storage/r2';
import { transcribeAudio } from './services/elevenlabs';
import { generateInsight } from './services/anthropic';

const app = new Hono();

app.use(
  '*',
  cors({
    origin: '*',
    allowHeaders: ['Content-Type', 'Authorization', 'X-App-Id'],
    allowMethods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  })
);

app.get('/health', (c) => c.json({ ok: true, service: 'swell-api' }));

// Better Auth handler
app.on(['POST', 'GET'], '/api/auth/**', (c) => {
  if (!auth) return c.json({ error: 'Auth not configured' }, 503);
  return auth.handler(c.req.raw);
});

// --- Cravings ---
app.post('/cravings', requireAuth, async (c) => {
  if (!db) return c.json({ error: 'DB not configured' }, 503);

  const userId = getUserId(c);
  const appId = getAppId(c);
  const body = await c.req.json<{
    beaten: boolean;
    game_played: string;
    duration_secs: number;
    trigger_note?: string;
  }>();

  const [row] = await db
    .insert(cravings)
    .values({
      userId,
      appId,
      beaten: body.beaten,
      gamePlayed: body.game_played,
      durationSecs: body.duration_secs,
      triggerNote: body.trigger_note,
      endedAt: new Date(),
    })
    .returning({ id: cravings.id });

  return c.json({ id: row.id });
});

app.get('/cravings/stats', requireAuth, async (c) => {
  if (!db) return c.json({ error: 'DB not configured' }, 503);

  const userId = getUserId(c);
  const appId = getAppId(c);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [totals] = await db
    .select({
      total_beaten: sql<number>`count(*) filter (where ${cravings.beaten} = true)`,
      beaten_this_week: sql<number>`count(*) filter (where ${cravings.beaten} = true and ${cravings.createdAt} >= ${weekAgo})`,
      total_sessions: sql<number>`count(*)`,
    })
    .from(cravings)
    .where(and(eq(cravings.userId, userId), eq(cravings.appId, appId)));

  return c.json({
    total_beaten: Number(totals?.total_beaten ?? 0),
    beaten_this_week: Number(totals?.beaten_this_week ?? 0),
    total_sessions: Number(totals?.total_sessions ?? 0),
  });
});

// --- Profile ---
app.get('/profile', requireAuth, async (c) => {
  if (!db) return c.json({ error: 'DB not configured' }, 503);

  const userId = getUserId(c);
  const appId = getAppId(c);

  const [profile] = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.userId, userId), eq(profiles.appId, appId)));

  if (!profile) {
    return c.json({
      user_id: userId,
      app_id: appId,
      reason: null,
      quit_date: null,
      meta: {},
    });
  }

  return c.json({
    user_id: profile.userId,
    app_id: profile.appId,
    reason: profile.reason,
    quit_date: profile.quitDate,
    meta: profile.meta ?? {},
  });
});

app.put('/profile', requireAuth, async (c) => {
  if (!db) return c.json({ error: 'DB not configured' }, 503);

  const userId = getUserId(c);
  const appId = getAppId(c);
  const body = await c.req.json<{
    reason?: string;
    quit_date?: string;
    meta?: Record<string, unknown>;
  }>();

  await db
    .insert(profiles)
    .values({
      userId,
      appId,
      reason: body.reason,
      quitDate: body.quit_date ? new Date(body.quit_date) : undefined,
      meta: body.meta ?? {},
    })
    .onConflictDoUpdate({
      target: [profiles.userId, profiles.appId],
      set: {
        reason: body.reason,
        quitDate: body.quit_date ? new Date(body.quit_date) : undefined,
        meta: body.meta ?? {},
      },
    });

  return c.json({ ok: true });
});

// --- Storage ---
app.post('/storage/upload-url', requireAuth, async (c) => {
  const userId = getUserId(c);
  const appId = getAppId(c);
  const body = (await c.req.json<{ content_type?: string }>().catch(
    () => ({ content_type: undefined })
  )) as { content_type?: string };

  const result = await createPresignedUploadUrl(
    userId,
    appId,
    body.content_type
  );
  return c.json(result);
});

// --- Transcribe ---
app.post('/transcribe', requireAuth, async (c) => {
  if (!db) return c.json({ error: 'DB not configured' }, 503);

  const userId = getUserId(c);
  const body = await c.req.json<{ craving_id: string; voice_note_key: string }>();

  const transcript = await transcribeAudio(body.voice_note_key);

  await db
    .update(cravings)
    .set({ transcript, voiceNoteKey: body.voice_note_key })
    .where(
      and(eq(cravings.id, body.craving_id), eq(cravings.userId, userId))
    );

  return c.json({ transcript });
});

// --- Insights ---
app.post('/insights', requireAuth, async (c) => {
  if (!db) return c.json({ error: 'DB not configured' }, 503);

  const userId = getUserId(c);
  const appId = getAppId(c);
  const body = await c.req.json<{
    system_prompt: string;
    period?: string;
  }>();

  const recent = await db
    .select({ note: cravings.triggerNote, transcript: cravings.transcript })
    .from(cravings)
    .where(and(eq(cravings.userId, userId), eq(cravings.appId, appId)))
    .orderBy(sql`${cravings.createdAt} desc`)
    .limit(20);

  const summaries = recent
    .map((r) => r.transcript ?? r.note)
    .filter(Boolean) as string[];

  const summary = await generateInsight(body.system_prompt, summaries);
  const period =
    body.period ??
    `week-${new Date().getFullYear()}-${Math.ceil(
      (Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    )}`;

  const [row] = await db
    .insert(insights)
    .values({ userId, appId, period, summary })
    .returning();

  return c.json({ id: row.id, period, summary });
});

// --- RevenueCat webhook ---
app.post('/revenuecat-webhook', async (c) => {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
  const authHeader = c.req.header('Authorization');

  if (secret && authHeader !== `Bearer ${secret}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const event = await c.req.json();
  // TODO: map RevenueCat events to user premium status
  console.log('RevenueCat event:', event.type ?? 'unknown');
  return c.json({ received: true });
});

export { app };
