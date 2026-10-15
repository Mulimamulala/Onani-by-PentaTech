# Onani by PentaTech

Streaming platform for films and series. Web first; an Expo mobile app can join the monorepo later and reuse `packages/*`.

## Stack

| Layer | Tool |
|---|---|
| Web | Next.js 16 (App Router, Cache Components), Tailwind v4 |
| Auth + database | Supabase (Postgres + RLS, email magic links) |
| Video | Mux (direct uploads, signed playback, Mux Player) |
| Payments | Flutterwave or DPO (not wired yet) |
| Hosting | Vercel |

## Layout

```
apps/web/            Next.js site: viewer pages + /admin
packages/core/       Shared logic (entitlement, formatting): no web-only imports
packages/db/         Database types
supabase/            Migrations, seed data, local config
```

## How playback is protected

1. An admin creates a video in `/admin` and the server creates a Mux direct upload. The browser uploads straight to Mux.
2. Mux calls `/api/webhooks/mux` when the video is ready, and the playback ID is saved.
3. Videos use a **signed** playback policy. `/watch/[id]` checks the user's subscription (or that the title is free) and only then signs short-lived tokens.

## Local setup

Requirements: Node 22+, Docker Desktop (for local Supabase), Supabase CLI.

```bash
npm install
supabase start                    # prints the local URL and keys
cp apps/web/.env.example apps/web/.env.local   # fill in the values
supabase db reset                 # applies migrations + seed
npm run db:types                  # replace hand-written DB types with generated ones
npm run dev                       # http://localhost:3000
```

Magic-link emails in local dev appear in Mailpit at http://127.0.0.1:54324.

### Make yourself an admin

After signing in once, run this in the Supabase SQL editor (Studio at http://127.0.0.1:54323 locally):

```sql
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
where email = 'you@example.com';
```

Sign out and back in so your session picks up the role.

### Mux

1. Create an account at mux.com and an access token (Video: read + write).
2. Settings → Signing Keys → create a key. Set `MUX_SIGNING_KEY` (key ID) and `MUX_PRIVATE_KEY` (base64 private key).
3. Settings → Webhooks → add `https://<your-site>/api/webhooks/mux` and set `MUX_WEBHOOK_SECRET`.
   For local testing, expose port 3000 with a tunnel (e.g. `cloudflared tunnel --url http://localhost:3000`).

## Costs

Everything here has a free tier for building and testing. Check the providers' pricing pages for current limits.

- **Supabase Free:** fine for development. Free projects pause after a week of inactivity. The built-in email sender is heavily rate-limited, so add an SMTP provider (e.g. Resend free tier) before launch.
- **Mux Free plan:** about 10 stored videos and 100,000 delivered minutes a month, capped at 1080p. Once the catalog grows, you pay per minute stored and delivered.
- **Vercel Hobby:** free, but for **non-commercial use only**. A paid streaming service needs Vercel Pro (about $20/month) or another host.
- **Flutterwave / DPO:** no monthly fee; a percentage per transaction.

## Next steps

- [ ] Payments: Flutterwave checkout + webhook that inserts/activates `subscriptions`
- [ ] Poster/backdrop uploads to Supabase Storage (admin currently pastes URLs)
- [ ] Search (Postgres full-text on `titles`)
- [ ] Custom SMTP for auth emails
- [ ] Sentry + PostHog
- [ ] `apps/mobile` (Expo) reusing `packages/core` and `packages/db`
