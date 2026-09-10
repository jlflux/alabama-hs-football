-- Public reads, server-only writes.
-- Browser clients use the publishable key and are limited by these RLS policies.
-- Admin/API routes use SUPABASE_SECRET_KEY on the server and bypass RLS.

alter table associations enable row level security;
alter table seasons enable row level security;
alter table schools enable row level security;
alter table school_aliases enable row level security;
alter table classifications enable row level security;
alter table regions enable row level security;
alter table team_seasons enable row level security;
alter table games enable row level security;
alter table region_team_status enable row level security;
alter table rankings enable row level security;
alter table playoff_brackets enable row level security;
alter table bracket_games enable row level security;
alter table import_batches enable row level security;
alter table import_rows enable row level security;

create policy "Public can read associations" on associations for select to anon, authenticated using (true);
create policy "Public can read seasons" on seasons for select to anon, authenticated using (true);
create policy "Public can read schools" on schools for select to anon, authenticated using (true);
create policy "Public can read classifications" on classifications for select to anon, authenticated using (true);
create policy "Public can read regions" on regions for select to anon, authenticated using (true);
create policy "Public can read team seasons" on team_seasons for select to anon, authenticated using (true);
create policy "Public can read games" on games for select to anon, authenticated using (true);
create policy "Public can read region status" on region_team_status for select to anon, authenticated using (true);
create policy "Public can read rankings" on rankings for select to anon, authenticated using (true);
create policy "Public can read published brackets" on playoff_brackets for select to anon, authenticated using (published = true);
create policy "Public can read published bracket games" on bracket_games for select to anon, authenticated using (
  exists (
    select 1 from playoff_brackets pb
    where pb.id = bracket_games.bracket_id and pb.published = true
  )
);

-- Intentionally no public policies for school_aliases, import_batches, or import_rows.
-- Those tables are admin/server-only.

alter view region_records set (security_invoker = true);

grant usage on schema public to anon, authenticated;
grant select on associations, seasons, schools, classifications, regions, team_seasons, games, region_team_status, rankings, playoff_brackets, bracket_games, region_records to anon, authenticated;
