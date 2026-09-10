import Link from 'next/link';
import { getSiteStats } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const stats = await getSiteStats();

  return (
    <main className="section">
      <div className="wrap">
        <div className="pagehead admin-pagehead">
          <div>
            <div className="eyebrow">Admin</div>
            <h1>Football Control Room</h1>
            <p className="muted">One place to see the live database, import scores and manage the season.</p>
          </div>
        </div>

        <div className="stats-grid admin-stats">
          <div className="card"><div className="stat">{stats.schools}</div><div className="muted">Schools</div></div>
          <div className="card"><div className="stat">{stats.games}</div><div className="muted">Games</div></div>
          <div className="card"><div className="stat">{stats.teamSeasons}</div><div className="muted">2026 alignments</div></div>
          <div className="card"><div className="stat">{stats.regions}</div><div className="muted">Regions</div></div>
        </div>

        <div className="grid admin-grid">
          <Link className="card admin-card" href="/admin/import-scores"><h3>Import Scores PDF</h3><p className="muted">Upload the weekly AHSAA sheet and preview parsed scores before anything is published.</p><span className="admin-link">Open importer →</span></Link>
          <Link className="card admin-card" href="/admin/teams"><h3>Teams & Data</h3><p className="muted">Browse every school currently loaded, including canonical public names and current alignment status.</p><span className="admin-link">Browse teams →</span></Link>
          <Link className="card admin-card" href="/scores"><h3>Published Games</h3><p className="muted">See exactly what the public score center is reading from Supabase.</p><span className="admin-link">View games →</span></Link>
          <Link className="card admin-card" href="/standings"><h3>Standings</h3><p className="muted">Region standings calculate automatically once team alignments and games are populated.</p><span className="admin-link">View standings →</span></Link>
        </div>

        <div className="card setup-note">
          <h3>Database status</h3>
          <p>The site is now connected directly to Supabase. Empty areas are no longer demo placeholders—they mean that portion of the real database has not been loaded yet.</p>
          <p className="muted">Score publishing and destructive editing will remain disabled until admin authentication is added.</p>
        </div>
      </div>
    </main>
  );
}
