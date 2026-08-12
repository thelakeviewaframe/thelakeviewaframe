'use client';

import Link from 'next/link';
import { useState } from 'react';

const LINKS = [
  ['/', 'Home'],
  ['/things-to-do', 'Things to Do'],
  ['/about', 'Your Hosts'],
  ['/#contact', 'Contact'],
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav style={{ padding: '18px 0 12px', position: 'relative' }}>
      <style>{`
        .nav-logo { display: block; height: 62px; width: auto; }
        @media (max-width: 767px) { .nav-logo { height: 46px; } }
        .nav-links { display: flex; gap: 30px; align-items: center; }
        .nav-links a {
          text-decoration: none; font-size: 11.5px; text-transform: uppercase;
          letter-spacing: .14em; font-weight: 600; color: #545454; transition: color .2s;
        }
        .nav-links a:hover { color: #bb8e65; }
        .nav-ig { display: flex; align-items: center; gap: 9px; }
        .nav-ig svg { width: 19px; height: 19px; display: block; }
        .nav-ig-label { display: none; }
        .nav-toggle {
          display: none; background: none; border: none;
          font-size: 22px; cursor: pointer; padding: 4px 8px; color: #bb8e65;
        }
        @media (max-width: 767px) {
          .nav-toggle { display: block; }
          .nav-links {
            display: none; flex-direction: column; gap: 0; align-items: stretch;
            position: absolute; top: 100%; left: 0; right: 0;
            background: #fff; border: 1px solid rgba(187,142,101,0.22);
            border-radius: 2px; padding: 4px 0; z-index: 50;
            box-shadow: 0 6px 20px rgba(0,0,0,0.10);
          }
          .nav-links[data-open="1"] { display: flex; }
          .nav-links a { padding: 15px 20px; font-size: 12px; }
          .nav-ig-label { display: inline; }
        }
        @media (max-width: 900px) and (min-width: 768px) {
          .nav-links { gap: 20px; }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/">
          <img className="nav-logo" src="/photos/logo-nav.png" alt="The Lakeview A-Frame" />
        </Link>

        <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? '×' : '☰'}
        </button>

        <div className="nav-links" data-open={open ? '1' : '0'}>
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>
          ))}

          
            className="nav-ig"
            href="https://www.instagram.com/thelakeviewaframe/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            onClick={() => setOpen(false)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
              <circle cx="12" cy="12" r="4.2" />
              <circle cx="17.4" cy="6.6" r="1.15" fill="currentColor" stroke="none" />
            </svg>
            <span className="nav-ig-label">Instagram</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
