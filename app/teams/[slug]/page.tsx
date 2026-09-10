import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTeamBySlug } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getTeamBySlug(slug);
  if (!data) notFound();

  const { school, currentSeason, seasons, games, record } = data;

  return <>
    <div className="pagehead"><div className="wrap">
      <div className="team-row"><div className="logo">{school.name.slice(0,2).toUpperCase()}</div><div><h1>{school.name}{school.mascot ? ` ${school.mascot}` : ''}</h1><div className="muted">{school.city ? `${school.city}, ${school.state}` : school.state}{currentSeason?.classification ? ` · ${currentSeason.classification}${currentSeason.region != null ? ` Region ${currentSeason.region}` : ''}` : ' · 2026 alignment pending'}</div></div></div>
      <div className="recordline"><span className="pill">2026: {record.wins}-{record.losses}</span><span className="pill">Region: {record.regionWins}-{record.regionLosses}</span></div>
    </div></div>

    <main className="wrap section profile">
      <div>
        <h2>2026 Schedule & Results</h2>
        {games.length ? <div className="table-wrap"><table className="table"><thead><tr><th>Week</th><th>Opponent</th><th>Site</th><th>Result</th></tr></thead><tbody>{games.map(game => {
          const home = game.home?.id === school.id;
          const opponent = home ? game.away : game.home;
          const scored = home ? game.homeScore : game.awayScore;
          const allowed = home ? game.awayScore : game.homeScore;
          let result = game.status.replace('_', ' ');
          if (['final','forfeit'].includes(game.status) && scored != null && allowed != null) result = scored === allowed ? `T ${scored}-${allowed}` : `${scored > allowed ? 'W' : 'L'} ${scored}-${allowed}`;
          return <tr key={game.id}><td>{game.week ?? '—'}</td><td>{opponent ? <Link href={`/teams/${opponent.slug}`}><b>{opponent.name}</b></Link> : 'TBD'}{game.isRegionGame ? ' *' : ''}</td><td>{home ? 'Home' : 'Away'}</td><td className="capitalize">{result}</td></tr>;
        })}</tbody></table></div> : <div className="empty-state compact"><h3>No games loaded yet</h3><p className="muted">This program profile is live; schedule and results will fill in as games are imported.</p></div>}
      </div>

      <aside>
        <div className="card"><h3>Program snapshot</h3><p><b>Classification:</b> {currentSeason?.classification ?? 'Pending'}</p><p><b>Region:</b> {currentSeason?.region ?? 'Pending'}</p><p><b>City:</b> {school.city ?? 'Pending'}</p>{currentSeason?.headCoach && <p><b>Head coach:</b> {currentSeason.headCoach}</p>}<p className="muted">This profile uses the permanent school record, so future seasons and historical results can live on the same page.</p></div>
        <div className="card" style={{marginTop:16}}><h3>Season history</h3>{seasons.length ? seasons.sort((a,b)=>(b.year ?? 0)-(a.year ?? 0)).map(season => <div className="game" key={season.id}><span>{season.year ?? 'Season'}{season.classification ? ` · ${season.classification}${season.region != null ? ` R${season.region}` : ''}` : ''}</span></div>) : <p className="muted">Historical seasons have not been loaded yet.</p>}</div>
      </aside>
    </main>
  </>;
}
