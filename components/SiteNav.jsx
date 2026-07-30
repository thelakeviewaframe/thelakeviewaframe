'use client';

import Link from 'next/link';
import { useState } from 'react';

const LINKS = [
  ['/', 'Home'],
  ['/things-to-do', 'Things to do'],
  ['/about', 'About us'],
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav style={{ padding: '16px 0 10px', position: 'relative' }}>
      <style>{`
        .nav-brand { text-decoration: none; font-weight: 700; font-size: 17px; color: #1c2b22; }
        .nav-links { display: flex; gap: 24px; align-items: center; }
        .nav-links a { text-decoration: none; font-size: 15px; color: #1c2b22; opacity: .72; }
        .nav-links a:hover { opacity: 1; }
        .nav-toggle {
          display: none; background: none; border: none;
          font-size: 24px; cursor: pointer; padding: 4px 8px; color: #1c2b22;
        }
        @media (max-width: 767px) {
          .nav-toggle { display: block; }
          .nav-links {
            display: none; flex-direction: column; gap: 0; align-items: stretch;
            position: absolute; top: 100%; left: 0; right: 0;
            background: #fff; border: 1px solid rgba(0,0,0,0.12);
            border-radius: 10px; padding: 6px 0; z-index: 50;
            box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          }
          .nav-links[data-open="1"] { display: flex; }
          .nav-links a { padding: 13px 18px; font-size: 16px; opacity: .9; }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" className="nav-brand">Lakeview A-Frame</Link>

        <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? '×' : '☰'}
        </button>

        <div className="nav-links" data-open={open ? '1' : '0'}>
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
