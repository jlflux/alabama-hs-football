import Link from 'next/link';
import { getStandingsData } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function Standings() {
  const rows = await getStandingsData();
  const groups = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = `${row.classification}|${row.region}`;
    const current = groups.get(key) ?? [];
    current.push(row);
    groups.set(key, current);
  }
  const ordered = [...groups.entries()].sort((a, b) => {
    const ar = a[1][0]; const br = b[1][0];
    return ar.classificationOrder - br.classificationOrder || ar.region - br.region;
  });

  return <>
    <div className="pagehead"><div className="wrap"><h1>Region Standings</h1><div className="muted">2026 · calculated from the live game database</div></div></div>
    <main className="wrap section">
      {ordered.length ? <div className="standings-groups">{ordered.map(([key, group]) => {
        const first = group[0];
        const sorted = [...group].sort((a,b) => b.record.regionWins - a.record.regionWins || a.record.regionLosses - b.record.regionLosses || b.record.wins - a.record.wins || a.school.name.localeCompare(b.school.name));
        return <section className="standings-section" key={key}><h2>{first.classification} Region {first.region}</h2><div className="table-wrap"><table className="table"><thead><tr><th>Team</th><th>Region</th><th>Overall</th></tr></thead><tbody>{sorted.map(row => <tr key={row.id}><td><Link href={`/teams/${row.school.slug}`}><b>{row.school.name}</b></Link></td><td>{row.record.regionWins}-{row.record.regionLosses}</td><td>{row.record.wins}-{row.record.losses}</td></tr>)}</tbody></table></div></section>;
      })}</div> : <div className="empty-state"><h3>Standings are ready, but alignments are still being loaded</h3><p className="muted">Once 2026 team-to-region assignments are populated, each classification and region will appear here automatically.</p><Link className="button-link" href="/teams">View loaded schools</Link></div>}
    </main>
  </>;
}
