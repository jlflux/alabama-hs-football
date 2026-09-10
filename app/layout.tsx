import './globals.css';
import Link from 'next/link';

export const metadata = { title: 'Alabama HS Football', description: 'Schedules, scores, standings and history for Alabama high school football.' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <header className="topbar"><div className="wrap nav"><Link href="/" className="brand">Alabama HS Football</Link><Link href="/scores">Scores</Link><Link href="/teams">Teams</Link><Link href="/standings">Standings</Link><Link href="/rankings">Rankings</Link><Link href="/playoffs">Playoffs</Link><Link href="/admin" className="admin-nav">Admin</Link></div></header>
    {children}
    <footer className="footer"><div className="wrap footer-row"><span>Alabama high school football information.</span><Link href="/admin">Data & Admin</Link></div></footer>
  </body></html>;
}
