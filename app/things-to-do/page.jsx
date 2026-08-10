'use client';

import { useState } from 'react';
import Link from 'next/link';
import SiteNav from '../../components/SiteNav';
import { SEASONS } from '../../lib/content';

const GALLERY = [
  { src: '/photos/rmnp-peaks.jpg', alt: 'Snow-lined peaks above pine forest in Rocky Mountain National Park' },
  { src: '/photos/rmnp-ridge.jpg', alt: 'A rocky ridge and evergreen forest in the Colorado Rockies' },
  { src: '/photos/grand-lake-marina.jpg', alt: 'Boat rental docks on Grand Lake with mountains behind' },
  { src: '/photos/grand-lake-docks.jpg', alt: 'Wooden docks along the shore of Grand Lake' },
  { src: '/photos/alpine-lake.jpg', alt: 'A calm mountain lake ringed by pines' },
  { src: '/photos/marina-sunset.jpg', alt: 'Boats moored at the marina in evening light' },
  { src: '/photos/marina-sunset-boats.jpg', alt: 'Pontoon boats at the dock at sunset' },
];

export default function ThingsToDoPage() {
  const [season, setSeason] = useState(0);
  const [slide, setSlide] = useState(0);

  const next = () => setSlide((i) => (i + 1) % GALLERY.length);
  const prev = () => setSlide((i) => (i - 1 + GALLERY.length) % GALLERY.length);

  return (
    <main className="container">
      <style>{`
        .ttd-carousel, .season-tabs, .ttd-group, .ttd-note, .ttd-foot {
          max-width: 780px;
        }

        .ttd-carousel {
          position: relative; overflow: hidden;
          border-radius: 4px; margin: 18px 0 34px;
          background: rgba(0,0,0,0.05);
        }
        .ttd-track { display: flex; transition: transform .45s ease; }
        .ttd-track img {
          flex: 0 0 100%; width: 100%; display: block;
          aspect-ratio: 3 / 2; object-fit: cover;
        }
        .ttd-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 42px; height: 42px; border-radius: 50%;
          border: none; cursor: pointer; z-index: 2;
          background: rgba(255,255,255,0.92); color: #2f4f3e;
          font-size: 26px; line-height: 1; padding: 0 0 3px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.18);
        }
        .ttd-arrow.left { left: 12px; }
        .ttd-arrow.right { right: 12px; }
        .ttd-dots {
          position: absolute; bottom: 12px; left: 0; right: 0; z-index: 2;
          display: flex; justify-content: center; gap: 7px;
        }
        .ttd-dots button {
          width: 8px; height: 8px; padding: 0; border-radius: 50%;
          border: none; cursor: pointer; background: rgba(255,255,255,0.55);
        }
        .ttd-dots button[data-on="1"] { background: #fff; }

        .season-tabs { display: flex; gap: 8px; margin: 0 0 34px; }
        .season-tabs button {
          border: 1px solid rgba(0,0,0,0.15); background: transparent;
          padding: 7px 15px; border-radius: 20px; font-size: 14px; cursor: pointer;
        }
        .season-tabs button[data-on="1"] { background: #2f4f3e; color: #fff; border-color: #2f4f3e; }

        .ttd-group { margin-bottom: 34px; }
        .ttd-group h3 {
          margin: 0 0 2px; font-size: 12px; font-weight: 600;
          text-transform: uppercase; letter-spacing: .16em; color: #2f4f3e;
        }
        .ttd-item { padding: 13px 0; border-top: 1px solid rgba(0,0,0,0.09); }
        .ttd-item strong {
          display: block; font-weight: 600; font-size: 16px;
          line-height: 1.35; margin-bottom: 2px;
        }
        .ttd-item span { font-size: 14.5px; opacity: .72; line-height: 1.6; }

        .ttd-note {
          background: rgba(47,79,62,0.07); border-left: 3px solid #2f4f3e;
          padding: 15px 18px; border-radius: 5px; font-size: 14px; line-height: 1.6;
          margin-bottom: 30px;
        }
        .ttd-note strong { display: block; margin-bottom: 5px; }
        .ttd-foot { margin-bottom: 48px; }
        .back-cta {
          display: inline-block; background: #2f4f3e; color: #fff;
          padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 15px;
        }

        @media (max-width: 767px) {
          .ttd-arrow { width: 34px; height: 34px; font-size: 21px; }
          .ttd-arrow.left { left: 8px; }
          .ttd-arrow.right { right: 8px; }
        }
      `}</style>

      <SiteNav />

      <h1>Things to do and see</h1>
      <p className="subtitle">Grand Lake &amp; Rocky Mountain National Park</p>

      <div className="ttd-carousel">
        <div className="ttd-track" style={{ transform: `translateX(-${slide * 100}%)` }}>
          {GALLERY.map((p) => (
            <img key={p.src} src={p.src} alt={p.alt} loading="lazy" />
          ))}
        </div>
        <button className="ttd-arrow left" onClick={prev} aria-label="Previous photo">&#8249;</button>
        <button className="ttd-arrow right" onClick={next} aria-label="Next photo">&#8250;</button>
        <div className="ttd-dots">
          {GALLERY.map((p, i) => (
            <button
              key={p.src}
              data-on={slide === i ? '1' : '0'}
              onClick={() => setSlide(i)}
              aria-label={`Go to photo ${i + 1}`}
            />
          ))}
        </div>
      </div>

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

      <p className="ttd-foot">
        <Link href="/" className="back-cta">Check availability</Link>
      </p>
    </main>
  );
}
