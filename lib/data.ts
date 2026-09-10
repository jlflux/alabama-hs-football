import { createPublicSupabaseClient } from '@/lib/supabase/client';

type Relation<T> = T | T[] | null;

type RelatedSchool = { id: string; slug: string; name: string };
type RelatedClassification = { name: string };
type RelatedRegion = { number: number | null };

function one<T>(value: Relation<T>): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export type TeamDirectoryItem = {
  id: string;
  slug: string;
  name: string;
  mascot: string | null;
  city: string | null;
  state: string;
  classification: string | null;
  region: number | null;
};

export type PublicGame = {
  id: string;
  week: number | null;
  kickoffAt: string | null;
  dateLabel: string | null;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  isRegionGame: boolean;
  home: RelatedSchool | null;
  away: RelatedSchool | null;
};

export async function getSiteStats() {
  const supabase = createPublicSupabaseClient();
  const [schools, games, teamSeasons, classifications, regions] = await Promise.all([
    supabase.from('schools').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('games').select('*', { count: 'exact', head: true }),
    supabase.from('team_seasons').select('*', { count: 'exact', head: true }),
    supabase.from('classifications').select('*', { count: 'exact', head: true }),
    supabase.from('regions').select('*', { count: 'exact', head: true }),
  ]);

  return {
    schools: schools.count ?? 0,
    games: games.count ?? 0,
    teamSeasons: teamSeasons.count ?? 0,
    classifications: classifications.count ?? 0,
    regions: regions.count ?? 0,
  };
}

export async function getTeams(search = ''): Promise<TeamDirectoryItem[]> {
  const supabase = createPublicSupabaseClient();
  let query = supabase
    .from('schools')
    .select(`
      id, slug, name, mascot, city, state,
      team_seasons (
        classification:classifications ( name ),
        region:regions ( number ),
        season:seasons ( year, is_current )
      )
    `)
    .eq('is_active', true)
    .order('name');

  if (search.trim()) query = query.ilike('name', `%${search.trim()}%`);

  const { data, error } = await query;
  if (error) throw new Error(`Unable to load teams: ${error.message}`);

  return (data ?? []).map((row: any) => {
    const seasons = Array.isArray(row.team_seasons) ? row.team_seasons : [];
    const current = seasons.find((item: any) => one(item.season)?.is_current) ?? seasons[0] ?? null;
    const classification = current ? one<RelatedClassification>(current.classification) : null;
    const region = current ? one<RelatedRegion>(current.region) : null;
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      mascot: row.mascot,
      city: row.city,
      state: row.state,
      classification: classification?.name ?? null,
      region: region?.number ?? null,
    };
  });
}

function normalizeGame(row: any): PublicGame {
  return {
    id: row.id,
    week: row.week,
    kickoffAt: row.kickoff_at,
    dateLabel: row.date_label,
    status: row.status,
    homeScore: row.home_score,
    awayScore: row.away_score,
    isRegionGame: row.is_region_game,
    home: one<RelatedSchool>(row.home),
    away: one<RelatedSchool>(row.away),
  };
}

export async function getGames(limit = 250): Promise<PublicGame[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from('games')
    .select(`
      id, week, kickoff_at, date_label, status, home_score, away_score, is_region_game,
      home:schools!games_home_school_id_fkey ( id, slug, name ),
      away:schools!games_away_school_id_fkey ( id, slug, name )
    `)
    .order('kickoff_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Unable to load games: ${error.message}`);
  return (data ?? []).map(normalizeGame);
}

export async function getLatestFinals(limit = 6): Promise<PublicGame[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from('games')
    .select(`
      id, week, kickoff_at, date_label, status, home_score, away_score, is_region_game,
      home:schools!games_home_school_id_fkey ( id, slug, name ),
      away:schools!games_away_school_id_fkey ( id, slug, name )
    `)
    .in('status', ['final', 'forfeit'])
    .order('kickoff_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Unable to load latest scores: ${error.message}`);
  return (data ?? []).map(normalizeGame);
}

export async function getTeamBySlug(slug: string) {
  const supabase = createPublicSupabaseClient();
  const { data: school, error } = await supabase
    .from('schools')
    .select('id, slug, name, mascot, city, state')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw new Error(`Unable to load team: ${error.message}`);
  if (!school) return null;

  const [{ data: seasonRows }, { data: gameRows }] = await Promise.all([
    supabase
      .from('team_seasons')
      .select(`id, head_coach, season:seasons(year,is_current), classification:classifications(name), region:regions(number)`)
      .eq('school_id', school.id),
    supabase
      .from('games')
      .select(`
        id, week, kickoff_at, date_label, status, home_score, away_score, is_region_game,
        home:schools!games_home_school_id_fkey ( id, slug, name ),
        away:schools!games_away_school_id_fkey ( id, slug, name )
      `)
      .or(`home_school_id.eq.${school.id},away_school_id.eq.${school.id}`)
      .order('kickoff_at', { ascending: true }),
  ]);

  const seasons = (seasonRows ?? []).map((row: any) => ({
    id: row.id,
    year: one<any>(row.season)?.year ?? null,
    isCurrent: Boolean(one<any>(row.season)?.is_current),
    classification: one<RelatedClassification>(row.classification)?.name ?? null,
    region: one<RelatedRegion>(row.region)?.number ?? null,
    headCoach: row.head_coach ?? null,
  }));
  const currentSeason = seasons.find((season) => season.isCurrent) ?? seasons[0] ?? null;
  const games = (gameRows ?? []).map(normalizeGame);

  let wins = 0;
  let losses = 0;
  let regionWins = 0;
  let regionLosses = 0;
  for (const game of games) {
    if (!['final', 'forfeit'].includes(game.status) || game.homeScore == null || game.awayScore == null) continue;
    const home = game.home?.id === school.id;
    const scored = home ? game.homeScore : game.awayScore;
    const allowed = home ? game.awayScore : game.homeScore;
    if (scored > allowed) {
      wins += 1;
      if (game.isRegionGame) regionWins += 1;
    } else if (scored < allowed) {
      losses += 1;
      if (game.isRegionGame) regionLosses += 1;
    }
  }

  return { school, seasons, currentSeason, games, record: { wins, losses, regionWins, regionLosses } };
}

export async function getStandingsData() {
  const supabase = createPublicSupabaseClient();
  const [{ data: teamRows, error: teamError }, { data: gameRows, error: gameError }] = await Promise.all([
    supabase
      .from('team_seasons')
      .select(`id, school:schools(id,slug,name), season:seasons(year,is_current), classification:classifications(name,sort_order), region:regions(id,number)`),
    supabase
      .from('games')
      .select('home_school_id, away_school_id, home_score, away_score, status, is_region_game')
      .in('status', ['final', 'forfeit']),
  ]);
  if (teamError) throw new Error(`Unable to load standings teams: ${teamError.message}`);
  if (gameError) throw new Error(`Unable to load standings games: ${gameError.message}`);

  const records = new Map<string, { wins: number; losses: number; regionWins: number; regionLosses: number }>();
  for (const game of gameRows ?? []) {
    if (game.home_score == null || game.away_score == null) continue;
    for (const [id, scored, allowed] of [
      [game.home_school_id, game.home_score, game.away_score],
      [game.away_school_id, game.away_score, game.home_score],
    ] as const) {
      const record = records.get(id) ?? { wins: 0, losses: 0, regionWins: 0, regionLosses: 0 };
      if (scored > allowed) {
        record.wins += 1;
        if (game.is_region_game) record.regionWins += 1;
      } else if (scored < allowed) {
        record.losses += 1;
        if (game.is_region_game) record.regionLosses += 1;
      }
      records.set(id, record);
    }
  }

  return (teamRows ?? [])
    .map((row: any) => {
      const school = one<RelatedSchool>(row.school);
      const season = one<any>(row.season);
      const classification = one<any>(row.classification);
      const region = one<any>(row.region);
      if (!school || !season?.is_current || !classification || !region) return null;
      return {
        id: row.id,
        school,
        classification: classification.name as string,
        classificationOrder: classification.sort_order as number,
        region: region.number as number,
        record: records.get(school.id) ?? { wins: 0, losses: 0, regionWins: 0, regionLosses: 0 },
      };
    })
    .filter(Boolean) as Array<any>;
}
