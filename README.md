# Alabama HS Football

Working title for a standalone Alabama high school football information platform.

## Product goal

Build a fast, Alabama-only football database with schedules, scores, standings, brackets, rankings, team profiles, and historical records without the clutter of a national sports network.

## Stack

- Next.js + TypeScript
- Supabase / PostgreSQL
- Vercel
- GitHub

## Local environment

Copy `.env.example` to `.env.local` and provide:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

The publishable key may be used by browser-safe code governed by Row Level Security. `SUPABASE_SECRET_KEY` is server-only and must never be committed or exposed to client components.

## Database setup

Apply the SQL migrations in order:

1. `supabase/migrations/0001_initial_schema.sql`
2. `supabase/migrations/0002_security.sql`

The first migration creates the football data model. The second enables Row Level Security and allows public reads while leaving writes and import tables server/admin-only.

## Branch workflow

- `main` = deployable production baseline
- `develop` = active development and preview deployments

## Initial product surfaces

- Statewide home dashboard
- Team directory and search
- Permanent team profile pages
- Current schedules and results
- Region standings
- Historical season structure
- Rankings and playoff bracket foundations
- Admin Friday-night PDF score import preview

The initial public UI still uses clearly marked demo data while the real 2026 school database and ingestion workflow are connected.

## Data-source policy

AHSFHS.org is intentionally excluded from this project. Do not scrape, query, mirror, or use it as a source. Current AHSAA documents and approved official/public sources may be used, with manual review before imported scores are published.
