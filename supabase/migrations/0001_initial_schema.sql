-- Alabama HS Football
-- Initial relational schema. Designed for historical seasons, multiple associations,
-- out-of-state opponents, manual score entry, and reviewable PDF imports.

create extension if not exists pgcrypto;

create type game_status as enum ('scheduled', 'in_progress', 'final', 'postponed', 'cancelled', 'forfeit');
create type import_status as enum ('uploaded', 'parsing', 'needs_review', 'ready', 'published', 'failed');
create type import_row_status as enum ('pending', 'matched', 'needs_review', 'ignored', 'published');

create table associations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  abbreviation text not null,
  created_at timestamptz not null default now()
);

create table seasons (
  id uuid primary key default gen_random_uuid(),
  year integer not null unique check (year >= 1900 and year <= 2200),
  label text not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index one_current_season on seasons (is_current) where is_current = true;

create table schools (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_name text,
  mascot text,
  city text,
  state text not null default 'AL',
  county text,
  association_id uuid references associations(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index schools_name_idx on schools (name);
create index schools_state_idx on schools (state);

-- Stores spelling/abbreviation variations encountered in imported documents.
create table school_aliases (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  alias text not null,
  normalized_alias text not null unique,
  source text,
  created_at timestamptz not null default now()
);

create table classifications (
  id uuid primary key default gen_random_uuid(),
  association_id uuid not null references associations(id),
  season_id uuid not null references seasons(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  unique (association_id, season_id, name)
);

create table regions (
  id uuid primary key default gen_random_uuid(),
  classification_id uuid not null references classifications(id) on delete cascade,
  number integer,
  name text,
  unique (classification_id, number)
);

-- One row per program per season. This preserves historical alignment changes.
create table team_seasons (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id),
  season_id uuid not null references seasons(id),
  association_id uuid references associations(id),
  classification_id uuid references classifications(id),
  region_id uuid references regions(id),
  head_coach text,
  notes text,
  unique (school_id, season_id)
);

create index team_seasons_season_idx on team_seasons (season_id);
create index team_seasons_region_idx on team_seasons (region_id);

create table games (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons(id),
  week integer,
  kickoff_at timestamptz,
  date_label text,
  home_school_id uuid not null references schools(id),
  away_school_id uuid not null references schools(id),
  home_score integer check (home_score is null or home_score >= 0),
  away_score integer check (away_score is null or away_score >= 0),
  status game_status not null default 'scheduled',
  is_region_game boolean not null default false,
  is_playoff_game boolean not null default false,
  playoff_round text,
  neutral_site boolean not null default false,
  location text,
  source_label text,
  source_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (home_school_id <> away_school_id)
);

create index games_season_idx on games (season_id);
create index games_home_idx on games (home_school_id);
create index games_away_idx on games (away_school_id);
create index games_kickoff_idx on games (kickoff_at);

-- Optional manual ordering/qualification metadata layered over calculated records.
-- This is useful when official tiebreakers cannot be safely inferred from W/L alone.
create table region_team_status (
  id uuid primary key default gen_random_uuid(),
  region_id uuid not null references regions(id) on delete cascade,
  team_season_id uuid not null references team_seasons(id) on delete cascade,
  official_seed integer,
  playoff_status text,
  tiebreak_note text,
  unique (region_id, team_season_id)
);

create table rankings (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons(id),
  week integer not null,
  ranking_name text not null,
  classification_id uuid references classifications(id),
  school_id uuid not null references schools(id),
  rank integer not null check (rank > 0),
  points numeric,
  created_at timestamptz not null default now(),
  unique (season_id, week, ranking_name, classification_id, school_id)
);

create table playoff_brackets (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons(id),
  classification_id uuid not null references classifications(id),
  name text not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  unique (season_id, classification_id, name)
);

create table bracket_games (
  id uuid primary key default gen_random_uuid(),
  bracket_id uuid not null references playoff_brackets(id) on delete cascade,
  game_id uuid references games(id),
  round_number integer not null,
  slot_number integer not null,
  next_game_id uuid references bracket_games(id),
  unique (bracket_id, round_number, slot_number)
);

-- Every PDF upload is staged first. Nothing parsed from a PDF should publish directly.
create table import_batches (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id),
  source_type text not null default 'pdf',
  source_label text,
  original_filename text,
  storage_path text,
  status import_status not null default 'uploaded',
  parser_version text,
  row_count integer not null default 0,
  matched_count integer not null default 0,
  review_count integer not null default 0,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table import_rows (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references import_batches(id) on delete cascade,
  row_number integer not null,
  raw_text text not null,
  parsed_home_name text,
  parsed_away_name text,
  parsed_home_score integer,
  parsed_away_score integer,
  matched_home_school_id uuid references schools(id),
  matched_away_school_id uuid references schools(id),
  match_confidence numeric,
  status import_row_status not null default 'pending',
  error_message text,
  created_at timestamptz not null default now(),
  unique (batch_id, row_number)
);

-- Public-safe calculated standings. Official seed remains a separate admin-controlled field.
create view region_records as
with region_games as (
  select g.*
  from games g
  where g.status in ('final', 'forfeit') and g.is_region_game = true
), team_games as (
  select season_id, home_school_id as school_id,
    case when home_score > away_score then 1 else 0 end as win,
    case when home_score < away_score then 1 else 0 end as loss
  from region_games
  union all
  select season_id, away_school_id as school_id,
    case when away_score > home_score then 1 else 0 end as win,
    case when away_score < home_score then 1 else 0 end as loss
  from region_games
)
select ts.id as team_season_id, ts.region_id, ts.school_id, ts.season_id,
  coalesce(sum(tg.win), 0)::int as region_wins,
  coalesce(sum(tg.loss), 0)::int as region_losses
from team_seasons ts
left join team_games tg on tg.school_id = ts.school_id and tg.season_id = ts.season_id
group by ts.id, ts.region_id, ts.school_id, ts.season_id;

insert into associations (slug, name, abbreviation)
values ('ahsaa', 'Alabama High School Athletic Association', 'AHSAA')
on conflict (slug) do nothing;

insert into seasons (year, label, is_current)
values (2026, '2026 Football Season', true)
on conflict (year) do nothing;
