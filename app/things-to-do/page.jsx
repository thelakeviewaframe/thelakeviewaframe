'use client';

import { useState } from 'react';
import Link from 'next/link';
import SiteNav from '../../components/SiteNav';
import { SEASONS } from '../../lib/content';

export default function ThingsToDoPage() {
  const [season, setSeason] = useState(0);

  return (
    <main className="container">
      <style>{`
        .season-tabs { display: flex; gap: 8px; margin: 6px 0 24px; }
        .season-tabs button {
          border: 1px solid rgba(0,0,0,0.15); background: transparent;
          padding: 7px 15px; border-radius: 20px; font-size: 14px; cursor: pointer;
        }
        .season-tabs button[data-on="1"] { background: #2f4f3e; color: #fff; border-color: #2f4f3e; }
        .ttd-group { margin-bottom: 26px; }
        .ttd-group h3 { margin: 0 0 8px; font-size: 17px; }
        .ttd-item { padding: 8px 0; border-top: 1px solid rgba(0,0,0,0.08); }
        .ttd-item strong { display: block; font-weight: 600; }
        .ttd-item span { font-size: 14px; opacity: .78; line-height: 1.5; }
        .ttd-note {
          background: rgba(47,79,62,0.07); border-left: 3px solid #2f4f3e;
          padding: 12px 15px; border-radius: 5px; font-size: 14px; line-height: 1.55;
          margin-bottom: 28px;
        }
        .ttd-note strong { display: block; margin-bottom: 4px; }
        .back-cta {
          display: inline-block; background: #2f4f3e; color: #fff;
          padding: 11px 20px; border-radius: 8px; text-decoration: none; font-size: 15px;
        }
      `}</style>

      <SiteNav />

      <h1>Things to do and see</h1>
      <p className="subtitle">Grand Lake, Colorado</p>

      <div className="season-tabs">
        {SEASONS.map((s, i) => (
          <button key={s.season} data-on={season === i ? '1' : '0'} onClick={() => setSeason(i)}>
            {s.season}
          </button>
        ))}
      </div>

      {SEASONS[season].groups.map((group) => (
        <div className="ttd-group" key={group.title}>
          <h3>{group.title}</h3>
          {group.items.map(([name, detail]) => (
            <div className="ttd-item" key={name}>
              <strong>{name}</strong>
              {detail ? <span>{detail}</span> : null}
            </div>
          ))}
        </div>
      ))}

      <div className="ttd-note">
        <strong>Before you go: park reservations</strong>
        From May 22 through October 12, 2026, Rocky Mountain National Park requires a timed
        entry reservation to enter between 9 a.m. and 2 p.m. You can enter before 9 a.m. or
        after 2 p.m. without one. Reservations open on Recreation.gov on the 1st of each month
        at 8 a.m. MDT for the following month, with more released at 7 p.m. the night before.
        A park pass is required separately.
      </div>

      <p style={{ marginBottom: 40 }}>
        <Link href="/" className="back-cta">Check availability</Link>
      </p>
    </main>
  );
}
