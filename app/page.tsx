import Link from 'next/link';
import { getLatestFinals, getSiteStats, getTeams } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [finals, stats, teams] = await Promise.all([
    getLatestFinals(6),
    getSiteStats(),
    getTeams(),
  ]);

  return <>
    <section className="hero">
      <div className="wrap">
        <div className="eyebrow">Alabama football, without the clutter</div>
        <h1>Every team. Every score. One place.</h1>
        <p>Schedules, scores, standings, rankings, playoff paths and program history for Alabama high school football.</p>
        <form className="search" action="/teams"><input name="q" placeholder="Search for a school…"/><button>Find Team</button></form>
      </div>
    </section>

    <main className="wrap">
      <section className="section">
        <div className="section-head"><div><h2>Live database</h2><div className="muted">Everything shown here now comes from Supabase.</div></div><Link href="/admin" className="muted">Open data hub →</Link></div>
        <div className="stats-grid">
          <div className="card"><div className="stat">{stats.schools}</div><div className="muted">Schools loaded</div></div>
          <div className="card"><div className="stat">{stats.games}</div><div className="muted">Games loaded</div></div>
          <div className="card"><div className="stat">{stats.teamSeasons}</div><div className="muted">Season alignments</div></div>
          <div className="card"><div className="stat">{stats.classifications}</div><div className="muted">Classifications</div></div>
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>Latest scores</h2><Link href="/scores" className="muted">All scores →</Link></div>
        {finals.length ? <div className="grid">{finals.map(g => <div className="card" key={g.id}>
          <div className="muted">{g.week != null ? `Week ${g.week}` : 'Football'}{g.dateLabel ? ` · ${g.dateLabel}` : ''}</div>
          <div className="game"><b>{g.away?.name ?? 'Visitor'}</b><span className="score">{g.awayScore ?? '—'}</span></div>
          <div className="game"><b>{g.home?.name ?? 'Home'}</b><span className="score">{g.homeScore ?? '—'}</span></div>
        </div>)}</div> : <div className="empty-state"><h3>No scores published yet</h3><p className="muted">The database is connected. Scores will appear here as soon as games are imported or entered.</p><Link className="button-link" href="/admin/import-scores">Import scores PDF</Link></div>}
      </section>

      <section className="section">
        <div className="section-head"><h2>Teams</h2><Link href="/teams" className="muted">View all {stats.schools} →</Link></div>
        {teams.length ? <div className="grid">{teams.slice(0, 6).map(t => <Link className="card team-row" href={`/teams/${t.slug}`} key={t.id}>
          <div className="logo">{t.name.slice(0,2).toUpperCase()}</div>
          <div><h3>{t.name}{t.mascot ? ` ${t.mascot}` : ''}</h3><div className="muted">{t.classification ? `${t.classification}${t.region != null ? ` · Region ${t.region}` : ''}` : '2026 alignment pending'}{t.city ? ` · ${t.city}` : ''}</div></div>
        </Link>)}</div> : <div className="empty-state"><h3>No schools loaded yet</h3><p className="muted">Schools will appear here as the master program list is loaded.</p></div>}
      </section>
    </main>
  </>;
}
