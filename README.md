# Swell

A craving-fighting mini-game app. One engine, many skins.

## Structure

```
swell/
├── apps/
│   ├── swell/          # Quit-smoking app (thin skin over engine)
│   └── api/            # Hono backend (Bun)
├── packages/
│   └── engine/         # Reusable craving-flow + games core
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- [Bun](https://bun.sh) (optional — API also runs on Node via tsx)
- Expo Go or a dev build (for mobile)

## Setup

```bash
# Install dependencies
pnpm install

# API: copy env and set DATABASE_URL (Neon Postgres)
cp apps/api/.env.example apps/api/.env

# Run DB migrations (once DATABASE_URL is set)
cd apps/api && bun run db:push

# Start API (port 3000) — Node/tsx or Bun
cd apps/api && pnpm dev

# Start mobile app (separate terminal)
cd apps/swell && pnpm dev
```

## Phase 1 — The Fight

The core loop is live:

1. **Home** — coral "I'M CRAVING — FIGHT IT" button
2. **Game Select** — pick Block Stack
3. **BlockStack** — Tetris-style game with coral→cyan cooling background over 3 minutes
4. **Victory** — "You beat it" + `POST /cravings`

Flow state machine: `idle → game_select → game → victory → idle`

All smoking-specific copy lives in `apps/swell/niche.config.ts`.

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/cravings` | Log a craving fight |
| GET | `/cravings/stats` | Beat count + weekly stats |
| GET/PUT | `/profile` | User profile per app |
| POST | `/storage/upload-url` | R2 presigned upload |
| POST | `/transcribe` | ElevenLabs Scribe |
| POST | `/insights` | Anthropic pattern summary |
| POST | `/revenuecat-webhook` | Subscription events |

Auth: Better Auth bearer tokens via `Authorization: Bearer <token>`.

## Adding a new niche

1. Create `apps/<niche>/` with a new `niche.config.ts`
2. Point `appId` at a unique string
3. Ship a new store listing — no engine changes needed
