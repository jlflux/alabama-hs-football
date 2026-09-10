import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="section">
      <div className="wrap">
        <div className="pagehead admin-pagehead">
          <div>
            <div className="eyebrow">Admin</div>
            <h1>Football Control Room</h1>
            <p className="muted">Fast score entry, imports, schedules, teams and data cleanup.</p>
          </div>
        </div>
        <div className="grid admin-grid">
          <Link className="card admin-card" href="/admin/import-scores"><h3>Import Scores PDF</h3><p className="muted">Upload the weekly AHSAA sheet, review parsed scores and stage the batch.</p></Link>
          <div className="card admin-card"><h3>Quick Score Entry</h3><p className="muted">Manual Friday-night score entry and corrections. Coming next.</p></div>
          <div className="card admin-card"><h3>Games & Schedules</h3><p className="muted">Add, edit, postpone or cancel games. Coming next.</p></div>
          <div className="card admin-card"><h3>Teams</h3><p className="muted">Canonical names, aliases, classifications and regions. Coming next.</p></div>
        </div>
      </div>
    </main>
  );
}
