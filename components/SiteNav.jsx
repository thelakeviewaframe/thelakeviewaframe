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
    <nav style={{ padding: '14px 0 8px', position: 'relative' }}>
      <style>{`
        .nav-links { display: flex; gap: 22px; align-items: center; }
        .nav-links a { text-decoration: none; font-size: 15px; opacity: .8; }
        .nav-links a:hover { opacity: 1; }
        .nav-toggle { display: none; background: none; border: none; font-size: 24px; cursor: pointer; padding: 4px 8px; }
        @media (max-width: 767px) {
          .nav-toggle { display: block; }
          .nav-links {
            display: none; flex-direction: column; gap: 0;
            position: absolute; top: 100%; left: 0; right: 0;
            background: #fff; border: 1px solid rgba(0,0,0,0.12);
            border-radius: 10px; padding: 6px 0; z-index: 50;
            box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          }
          .nav-links[data-open="1"] { display: flex; }
          .nav-links a { padding: 12px 18px; font-size: 16px; }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', fontWeight: 600, fontSize: 16 }}>
          Lakeview A-Frame
        </Link>

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
