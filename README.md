# 960 Dojo

960 Dojo is a full-stack Chess960 training and play platform built with Next.js, Supabase, Redis, and chess-focused tooling (`chess.js`, `chessground`, `chessops`).

It combines:
- **Tactics training** generated from real games
- **Opening training** against database + engine fallback
- **Analysis tools** for PGN/FEN import and engine review
- **Live player-vs-player queue + matchmaking** with real-time game state sync
- **Profiles, ratings, activity history, streaks, notifications, and social features**

---

## Core Features

### Practice
- **Tactics**
  - Puzzle solving with Chess960 positions
  - Correct/incorrect feedback, rating impact, and replay
  - Open solved/failed lines directly in Analysis
- **Openings**
  - Training and rated modes
  - Position-specific Chess960 opening work
  - Opponent move sourcing via database and/or engine
  - Session persistence and rating updates

### Tools
- **Analysis**
  - Import PGN/FEN
  - Chess960-aware move tree browsing
  - Engine evaluation and multipv support
  - Move list navigation (buttons, wheel, click)
  - Player panels and rating display from PGN/import context
- **Position Generator**
  - Utility flow for creating and exploring positions

### Play (Live PvP)
- Queue-based matchmaking by time control (`1+0`, `3+2`, etc.)
- Real-time game updates (SSE stream + Redis Pub/Sub fanout)
- Server-authoritative move validation and clocks
- Draw offers, resign, rematch, play-again flows
- Pre-game readiness handshake and connection timeout handling
- Game archival to PGN with headers (players, ratings, time control, result)
- Queue/activity banners and notifications integration

### Profile & Social
- Profile pages with tabs and rating graphs
- Game history with final board previews and analysis links
- Colored W/L/D outcomes and rating deltas
- Friend request flow
- Streak tracking and refresh

---

## Tech Stack

- **Frontend**: Next.js, React
- **Backend/API**: Next.js API routes
- **Database/Auth**: Supabase (Postgres + Auth)
- **Realtime + queue/state**: Redis
- **Chess logic/UI**:
  - `chess.js`
  - `chessground` / `@lichess-org/chessground`
  - `chessops`
- **Charts/UI extras**: Recharts, React Icons

---

## Project Structure

- `pages/` - Next.js pages (`/`, `/tactics`, `/openings`, `/analysis`, `/play`, profiles, auth views)
- `pages/api/` - API endpoints for auth, tactics, openings share, profile activity, play, streak, feedback
- `components/` - Reusable UI pieces (board wrappers, move lists, rating displays, page-specific widgets)
- `lib/` - Core business logic (play server logic, redis client, auth helpers, chess utilities, ratings)
- `src/styles/` - Global/component/page CSS
- `supabase/` - SQL setup scripts for RLS, streak, play-related tables/policies

---

## Local Development Setup

## 1) Requirements
- Node.js 18+ (recommended latest LTS)
- npm
- Supabase project
- Redis instance (Upstash or equivalent; local Redis also works for development)

## 2) Install dependencies

```bash
npm install
```

## 3) Configure environment variables

Create `.env` (or `.env.local`) with your project values:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Redis (used for live play queue/game state/pubsub)
REDIS_URL=...
```

If your Redis provider requires additional fields (token/user/password/TLS), configure them to match your `lib/playRedis.js` expectations.

## 4) Run required SQL in Supabase

At minimum, run:
- `supabase/rls.sql`
- `supabase/streak_init.sql`
- `supabase/streak_table.sql`
- `supabase/streak_daily_reset.sql`
- `supabase/play_setup.sql`

If needed, `supabase/rls_revert.sql` can help rollback policy changes.

## 5) Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

- `npm run dev` - Start Next.js dev server with Turbopack
- `npm run build` - Production build
- `npm run start` - Run production server
- `npm run lint` - Lint codebase
- `npm run pull:lichess-assets` - Pull/update Lichess-related assets

---

## Live Play Architecture (High Level)

The live play system is designed to scale beyond a single node:

1. Client sends move/action to API (`/api/play/move`, `/api/play/action`)
2. Server validates and mutates canonical game state
3. State is stored in Redis (queue/game/active mappings)
4. Events are published via Redis Pub/Sub channel per game
5. Clients consume updates over SSE (`/api/play/stream/[id]`)
6. Completed games are archived into the `Game` table with full PGN metadata

This keeps game logic server-authoritative while preserving low-latency UX.

---

## Key Play API Endpoints

- `GET /api/play/status` - queue + active game + queue presence
- `POST /api/play/queue` - join/cancel queue
- `GET /api/play/game/[id]` - snapshot of game
- `GET /api/play/stream/[id]` - SSE game stream
- `POST /api/play/move` - submit move
- `POST /api/play/action` - resign/draw/rematch/actions
- `POST /api/play/ready` - pre-game handshake ready signal
- `GET /api/play/notifications` - list/count notifications
- `POST /api/play/notifications/[id]` - mark notification read

---

## Deployment Notes

- Deploy frontend/API on Vercel (or any Node-compatible Next.js host)
- Use managed Supabase for DB/Auth
- Use managed Redis (commonly Upstash on Vercel)
- Ensure environment variables are set in deployment environment
- Ensure Supabase RLS and grants from SQL scripts are applied in production

---

## Troubleshooting

- **401 Unauthorized on play endpoints**
  - Check Supabase session/token state
  - Re-login and ensure `Authorization: Bearer ...` is sent
- **Permission denied on play tables**
  - Re-run `supabase/play_setup.sql`
  - Verify grants/policies for `PlayNotification` and `PlayRatingState`
- **No live updates in games**
  - Verify Redis connectivity and credentials
  - Check SSE route and network tab for stream stability
- **Queue works but match/game state is inconsistent**
  - Verify Redis TTL/state keys are not being externally cleared
  - Confirm only one environment is writing to the same Redis namespace

---

## Notes

- Chess logic is Chess960-first throughout the project.
- Game/activity entries support deep linking into analysis via imported PGN payloads.
- Rating displays and profile links are shared components reused across pages for consistency.
