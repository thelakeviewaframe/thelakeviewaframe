'use client';

import { useState } from 'react';
import Link from 'next/link';
import SiteNav from '../../components/SiteNav';
import { SEASONS } from '../../lib/content';

const GROUP_PHOTOS = {
  'Rocky Mountain National Park': {
    src: '/photos/rmnp-peaks.jpg',
    alt: 'Snow-lined peaks and pine forest in Rocky Mountain National Park',
    caption: 'The west entrance is about eight minutes from the house.',
  },
  'Boating the three lakes': {
    src: '/photos/grand-lake-marina.jpg',
    alt: 'Boat rental docks on Grand Lake with mountains behind',
    caption: 'Boat rentals on Grand Lake.',
  },
  'Beaches': {
    src: '/photos/grand-lake-docks.jpg',
    alt: 'Wooden docks along the shore of Grand Lake',
  },
  'More to do': {
    src: '/photos/marina-sunset.jpg',
    alt: 'Boats moored at the marina at sunset',
    caption: 'Evening light over the marina.',
  },
};

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

        .ttd-figure { margin: 0 0 14px; }
        .ttd-figure img {
          display: block; width: 100%; height: auto;
          aspect-ratio: 16 / 9; object-fit: cover;
          border-radius: 4px; background: rgba(0,0,0,0.05);
        }
        .ttd-figure figcaption {
          margin-top: 7px; font-size: 13px; line-height: 1.5;
          opacity: .62;
        }
        @media (max-width: 767px) {
          .ttd-figure img { aspect-ratio: 4 / 3; }
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

      {SEASONS[season].groups.map((group) => {
        const photo = GROUP_PHOTOS[group.title];
        return (
          <div className="ttd-group" key={group.title}>
            <h3>{group.title}</h3>
            {photo ? (
              <figure className="ttd-figure">
                <img src={photo.src} alt={photo.alt} loading="lazy" />
                {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
              </figure>
            ) : null}
            {group.items.map(([name, detail]) => (
              <div className="ttd-item" key={name}>
                <strong>{name}</strong>
                {detail ? <span>{detail}</span> : null}
              </div>
            ))}
          </div>
        );
      })}

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
