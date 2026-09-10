import Link from 'next/link';
import { getTeams } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function Teams({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams;
  const teams = await getTeams(q);

  return <>
    <div className="pagehead"><div className="wrap"><h1>Teams</h1><div className="muted">Live program directory from the Alabama football database.</div></div></div>
    <main className="wrap section">
      <form className="search light-search"><input name="q" defaultValue={q} placeholder="Search teams…"/><button>Search</button></form>
      <div className="section-head"><div><h2>{q ? `Results for “${q}”` : 'School directory'}</h2><div className="muted">{teams.length} team{teams.length === 1 ? '' : 's'} shown</div></div></div>
      {teams.length ? <div className="grid">{teams.map(t => <Link className="card team-row" href={`/teams/${t.slug}`} key={t.id}>
        <div className="logo">{t.name.slice(0,2).toUpperCase()}</div>
        <div><h3>{t.name}{t.mascot ? ` ${t.mascot}` : ''}</h3><div className="muted">{t.classification ? `${t.classification}${t.region != null ? ` · Region ${t.region}` : ''}` : '2026 alignment pending'}{t.city ? ` · ${t.city}` : ''}</div></div>
      </Link>)}</div> : <div className="empty-state"><h3>No matching schools</h3><p className="muted">Try another spelling or clear the search.</p></div>}
    </main>
  </>;
}
