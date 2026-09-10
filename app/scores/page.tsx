import Link from 'next/link';
import { getGames } from '@/lib/data';

export const dynamic = 'force-dynamic';

function displayDate(value: string | null, fallback: string | null) {
  if (fallback) return fallback;
  if (!value) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export default async function Scores() {
  const games = await getGames();

  return <>
    <div className="pagehead"><div className="wrap"><h1>Scores</h1><div className="muted">Statewide score center · live database</div></div></div>
    <main className="wrap section">
      <div className="section-head"><div><h2>2026 games</h2><div className="muted">{games.length} game{games.length === 1 ? '' : 's'} currently loaded</div></div></div>
      {games.length ? <div className="scores">{games.map(g => <div className="card score-card" key={g.id}>
        <div className="score-meta"><span>{g.week != null ? `Week ${g.week}` : 'Football'}{displayDate(g.kickoffAt, g.dateLabel) ? ` · ${displayDate(g.kickoffAt, g.dateLabel)}` : ''}</span><span className="pill">{g.status.replace('_', ' ')}</span></div>
        <div className="game"><Link href={g.away ? `/teams/${g.away.slug}` : '#'}><b>{g.away?.name ?? 'Visitor'}</b></Link><span className="score">{['final','forfeit','in_progress'].includes(g.status) ? (g.awayScore ?? '—') : '—'}</span></div>
        <div className="game"><Link href={g.home ? `/teams/${g.home.slug}` : '#'}><b>{g.home?.name ?? 'Home'}</b></Link><span className="score">{['final','forfeit','in_progress'].includes(g.status) ? (g.homeScore ?? '—') : '—'}</span></div>
        {g.isRegionGame && <div className="muted small-note">Region game</div>}
      </div>)}</div> : <div className="empty-state"><h3>No games have been published yet</h3><p className="muted">Use the admin score importer to read an AHSAA weekly PDF. Games will appear here after they are matched and published.</p><Link className="button-link" href="/admin/import-scores">Go to score importer</Link></div>}
    </main>
  </>;
}
