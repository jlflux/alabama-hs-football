"use client";

import { FormEvent, useState } from "react";

type PreviewRow = {
  sourceLine: string;
  date: string;
  time?: string;
  homeDisplayName: string;
  homeScore?: number;
  visitorDisplayName: string;
  visitorScore?: number;
  homeClass?: string;
  homeRegion?: string;
  status: "final" | "scheduled" | "suspended" | "review";
  note?: string;
};

type Preview = {
  fileName: string;
  rows: PreviewRow[];
  summary: { total: number; final: number; review: number; suspended: number };
};

export default function ImportScoresPage() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setPreview(null);

    const response = await fetch("/api/admin/import-scores/preview", {
      method: "POST",
      body: new FormData(event.currentTarget),
    });

    const body = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(body.error ?? "The PDF could not be read.");
      return;
    }
    setPreview(body);
  }

  return (
    <main className="section">
      <div className="wrap">
        <div className="pagehead admin-pagehead">
          <div>
            <div className="eyebrow">Admin / Scores</div>
            <h1>Import Friday Scores</h1>
            <p className="muted">Upload the weekly AHSAA PDF. Nothing publishes until you review and approve it.</p>
          </div>
        </div>

        <div className="card admin-upload-card">
          <form onSubmit={submit}>
            <label className="upload-box">
              <strong>AHSAA scores PDF</strong>
              <span className="muted">Select the weekly schedule/results PDF.</span>
              <input name="file" type="file" accept="application/pdf,.pdf" required />
            </label>
            <button className="button" disabled={loading}>{loading ? "Reading PDF..." : "Read PDF & Preview"}</button>
          </form>
          {error && <p className="import-error">{error}</p>}
        </div>

        {preview && (
          <section className="section">
            <div className="section-head">
              <div>
                <h2>Import preview</h2>
                <p className="muted">{preview.fileName}</p>
              </div>
              <div className="recordline">
                <span className="pill">{preview.summary.final} finals</span>
                <span className="pill">{preview.summary.suspended} suspended</span>
                <span className="pill">{preview.summary.review} need review</span>
              </div>
            </div>

            <div className="table-wrap">
              <table className="table import-table">
                <thead>
                  <tr><th>Status</th><th>Home</th><th>Score</th><th>Visitor</th><th>Score</th><th>Class / Region</th></tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, index) => (
                    <tr key={`${row.sourceLine}-${index}`} className={row.status === "review" ? "needs-review" : ""}>
                      <td><span className="pill">{row.status}</span></td>
                      <td>{row.homeDisplayName || <span className="muted">Review source row</span>}</td>
                      <td className="score">{row.homeScore ?? "-"}</td>
                      <td>{row.visitorDisplayName || "-"}</td>
                      <td className="score">{row.visitorScore ?? "-"}</td>
                      <td>{row.homeClass ? `${row.homeClass}${row.homeRegion ? ` ${row.homeRegion}` : ""}` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-actions">
              <button className="button" disabled title="Database matching and approval comes next">Approve & Publish Scores</button>
              <span className="muted">Publishing is intentionally disabled until school matching and Supabase writes are connected.</span>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
