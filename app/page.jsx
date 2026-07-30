'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BookingCard from '../components/BookingCard';
import SiteNav from '../components/SiteNav';
import { PROPERTY } from '../lib/content';

export default function HomePage() {
  const nightlyRate = Number(process.env.NIGHTLY_RATE_USD || 350);
  const cleaningFee = Number(process.env.CLEANING_FEE_USD || 150);
  const depositPercent = Number(process.env.DEPOSIT_PERCENT || 100);

  const [lightboxIndex, setLightboxIndex] = useState(null);
  const isOpen = lightboxIndex !== null;

  const close = () => setLightboxIndex(null);
  const next = () => setLightboxIndex((i) => (i + 1) % PROPERTY.photos.length);
  const prev = () => setLightboxIndex((i) => (i - 1 + PROPERTY.photos.length) % PROPERTY.photos.length);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const cellStyle = { width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'pointer' };

  return (
    <main className="container">
      <style>{`
        .photo-grid {
          position: relative; display: grid;
          grid-template-columns: 2fr 1fr; grid-template-rows: 1fr 1fr;
          gap: 8px; height: 440px; margin-bottom: 22px;
          border-radius: 12px; overflow: hidden;
        }
        .photo-grid .main { grid-row: 1 / 3; }
        @media (max-width: 767px) { .photo-grid { height: 300px; gap: 5px; border-radius: 10px; } }
        .show-all-btn {
          position: absolute; bottom: 14px; right: 14px; background: #fff;
          border: 1px solid rgba(0,0,0,0.2); border-radius: 8px; padding: 8px 14px;
          font-size: 14px; font-weight: 500; cursor: pointer; box-shadow: 0 1px 5px rgba(0,0,0,0.22);
        }
        @media (max-width: 767px) { .show-all-btn { bottom: 10px; right: 10px; padding: 7px 11px; font-size: 13px; } }
        .facts { display: flex; flex-wrap: wrap; gap: 12px 28px; margin: 0 0 20px; padding: 0; list-style: none; }
        .facts li { font-size: 14px; }
        .facts b { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; opacity: .55; font-weight: 600; }
        .teasers { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 8px; }
        @media (max-width: 767px) { .teasers { grid-template-columns: 1fr; } }
        .teaser {
          display: block; text-decoration: none; color: inherit;
          border: 1px solid rgba(0,0,0,0.13); border-radius: 10px;
          padding: 18px 20px; transition: border-color .15s;
        }
        .teaser:hover { border-color: #2f4f3e; }
        .teaser h3 { margin: 0 0 6px; font-size: 16px; }
        .teaser p { margin: 0 0 10px; font-size: 14px; opacity: .75; line-height: 1.5; }
        .teaser span { font-size: 14px; color: #2f4f3e; font-weight: 500; }
      `}</style>

      <SiteNav />

      <div className="photo-grid">
        <img className="main" src={PROPERTY.photos[0]} alt={PROPERTY.name} onClick={() => setLightboxIndex(0)} style={cellStyle} />
        <img src={PROPERTY.photos[1]} alt="" onClick={() => setLightboxIndex(1)} style={cellStyle} />
        <img src={PROPERTY.photos[2]} alt="" onClick={() => setLightboxIndex(2)} style={cellStyle} />
        <button className="show-all-btn" onClick={() => setLightboxIndex(0)}>
          Show all {PROPERTY.photos.length} photos
        </button>
      </div>

      <h1>{PROPERTY.name}</h1>
      <p className="subtitle">{PROPERTY.location} · {PROPERTY.tagline}</p>

      <div className="layout">
        <div>
          <div className="section">
            <ul className="facts">
              {PROPERTY.quickFacts.map(([k, v]) => (
                <li key={k}><b>{k}</b>{v}</li>
              ))}
            </ul>
            <h2>About this place</h2>
            {PROPERTY.description.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
          </div>

          <div className="section">
            <h2>Amenities</h2>
            <ul className="amenities">
              {PROPERTY.amenities.map((a) => <li key={a}>{a}</li>)}
            </ul>
          </div>

          <div className="section">
            <div className="teasers">
              <Link href="/things-to-do" className="teaser">
                <h3>Things to do</h3>
                <p>
                  Rocky Mountain National Park is minutes away. Boating, beaches and trails in
                  summer; snowmobiling, Nordic skiing and sleigh rides in winter.
                </p>
                <span>Explore the area →</span>
              </Link>

              <Link href="/about" className="teaser">
                <h3>About us</h3>
                <p>
                  We&apos;re Koren and Jess. We moved to Colorado in 2018 and kept coming back to
                  Grand Lake until we finally bought a place of our own here.
                </p>
                <span>Meet your hosts →</span>
              </Link>
            </div>
          </div>
        </div>

        <BookingCard
          nightlyRate={nightlyRate}
          cleaningFee={cleaningFee}
          depositPercent={depositPercent}
          propertyName={PROPERTY.name}
        />
      </div>

      {isOpen && (
        <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.94)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={close} aria-label="Close" style={{ position: 'absolute', top: 16, right: 20, fontSize: 34, lineHeight: 1, color: '#fff', background: 'none', border: 'none', cursor: 'pointer', zIndex: 2 }}>×</button>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous photo" style={{ position: 'absolute', left: 6, fontSize: 42, lineHeight: 1, color: '#fff', background: 'none', border: 'none', cursor: 'pointer', padding: '14px 16px', zIndex: 2 }}>‹</button>
          <img src={PROPERTY.photos[lightboxIndex]} alt="" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '92vw', maxHeight: '86vh', objectFit: 'contain', borderRadius: 4 }} />
          <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next photo" style={{ position: 'absolute', right: 6, fontSize: 42, lineHeight: 1, color: '#fff', background: 'none', border: 'none', cursor: 'pointer', padding: '14px 16px', zIndex: 2 }}>›</button>
          <div style={{ position: 'absolute', bottom: 16, color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
            {lightboxIndex + 1} / {PROPERTY.photos.length}
          </div>
        </div>
      )}
    </main>
  );
}
