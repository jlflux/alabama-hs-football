import Link from 'next/link';
import { getTeams } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function AdminTeamsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams;
  const teams = await getTeams(q);

  return <main className="section"><div className="wrap">
    <div className="pagehead admin-pagehead"><div><div className="eyebrow">Admin / Teams</div><h1>Teams & Data</h1><p className="muted">Live view of the canonical school records currently in Supabase.</p></div></div>
    <form className="search light-search"><input name="q" defaultValue={q} placeholder="Search schools…"/><button>Search</button></form>
    <div className="section-head"><div><h2>{teams.length} loaded school{teams.length === 1 ? '' : 's'}</h2><div className="muted">Names here are the public display names used throughout the site.</div></div><Link href="/admin" className="muted">← Control room</Link></div>
    {teams.length ? <div className="table-wrap"><table className="table"><thead><tr><th>School</th><th>Classification</th><th>Region</th><th>City</th><th>Profile</th></tr></thead><tbody>{teams.map(team => <tr key={team.id}><td><b>{team.name}</b>{team.mascot ? <div className="muted small-note">{team.mascot}</div> : null}</td><td>{team.classification ?? <span className="pending-text">Pending</span>}</td><td>{team.region != null ? `Region ${team.region}` : <span className="pending-text">Pending</span>}</td><td>{team.city ?? '—'}</td><td><Link className="admin-link" href={`/teams/${team.slug}`}>View →</Link></td></tr>)}</tbody></table></div> : <div className="empty-state"><h3>No teams found</h3><p className="muted">Try another search.</p></div>}
  </div></main>;
}
