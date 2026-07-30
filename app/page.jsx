'use client';

import { useState, useEffect } from 'react';
import BookingCard from '../components/BookingCard';

const PROPERTY = {
  name: 'Lakeview A-Frame',
  location: 'Grand Lake, Colorado',
  tagline: 'A classic A-frame cabin steps from the water, with mountain views from every window.',
  description: `Wake up to lake views in this cozy, fully-renovated A-frame cabin on Grand Lake.
Vaulted wood-beam ceilings, a wraparound deck, and a private dock make this the perfect basecamp
for a mountain getaway — 10 minutes from Rocky Mountain National Park's west entrance.`,
  amenities: [
    'Lake access & private dock',
    'Hot tub',
    'Wood-burning fireplace',
    'Full kitchen',
    'Free WiFi',
    'Washer & dryer',
    'Parking for 2 cars',
    'Pet friendly',
  ],
  photos: [
    '/photos/hero-1.jpg',
    '/photos/hero-2.jpg',
    '/photos/hero-3.jpg',
    '/photos/hero-4.jpg',
    '/photos/hero-5.jpg',
    '/photos/hero-6.jpg',
    '/photos/hero-7.jpg',
    '/photos/hero-8.jpg',
    '/photos/hero-9.jpg',
    '/photos/hero-10.jpg',
    '/photos/hero-11.jpg',
    '/photos/hero-12.jpg',
    '/photos/hero-13.jpg',
    '/photos/hero-14.jpg',
  ],
};

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

  const cellStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    cursor: 'pointer',
  };

  return (
    <main className="container">
      <style>{`
        .photo-grid {
          position: relative;
          display: grid;
          grid-template-columns: 2fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 8px;
          height: 440px;
          margin-bottom: 20px;
          border-radius: 12px;
          overflow: hidden;
        }
        .photo-grid .main { grid-row: 1 / 3; }
        @media (max-width: 767px) {
          .photo-grid {
            height: 300px;
            gap: 5px;
            border-radius: 10px;
          }
        }
        .show-all-btn {
          position: absolute;
          bottom: 14px;
          right: 14px;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.2);
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          box-shadow: 0 1px 5px rgba(0,0,0,0.22);
        }
        @media (max-width: 767px) {
          .show-all-btn {
            bottom: 10px;
            right: 10px;
            padding: 7px 11px;
            font-size: 13px;
          }
        }
      `}</style>

      <div className="photo-grid">
        <img
          className="main"
          src={PROPERTY.photos[0]}
          alt={PROPERTY.name}
          onClick={() => setLightboxIndex(0)}
          style={cellStyle}
        />
        <img src={PROPERTY.photos[1]} alt="" onClick={() => setLightboxIndex(1)} style={cellStyle} />
        <img src={PROPERTY.photos[2]} alt="" onClick={() => setLightboxIndex(2)} style={cellStyle} />

        <button className="show-all-btn" onClick={() => setLightboxIndex(0)}>
          Ver las {PROPERTY.photos.length} fotos
        </button>
      </div>

      <h1>{PROPERTY.name}</h1>
      <p className="subtitle">{PROPERTY.location} · {PROPERTY.tagline}</p>

      <div className="layout">
        <div>
          <div className="section">
            <h2>About this place</h2>
            <p>{PROPERTY.description}</p>
          </div>
          <div className="section">
            <h2>Amenities</h2>
            <ul className="amenities">
              {PROPERTY.amenities.map((a) => <li key={a}>{a}</li>)}
            </ul>
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
        <div
          onClick={close}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.94)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <button
            onClick={close}
            aria-label="Cerrar"
            style={{ position: 'absolute', top: 16, right: 20, fontSize: 34, lineHeight: 1, color: '#fff', background: 'none', border: 'none', cursor: 'pointer', zIndex: 2 }}
          >
            ×
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Foto anterior"
            style={{ position: 'absolute', left: 6, fontSize: 42, lineHeight: 1, color: '#fff', background: 'none', border: 'none', cursor: 'pointer', padding: '14px 16px', zIndex: 2 }}
          >
            ‹
          </button>

          <img
            src={PROPERTY.photos[lightboxIndex]}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '92vw', maxHeight: '86vh', objectFit: 'contain', borderRadius: 4 }}
          />

          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Foto siguiente"
            style={{ position: 'absolute', right: 6, fontSize: 42, lineHeight: 1, color: '#fff', background: 'none', border: 'none', cursor: 'pointer', padding: '14px 16px', zIndex: 2 }}
          >
            ›
          </button>

          <div style={{ position: 'absolute', bottom: 16, color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
            {lightboxIndex + 1} / {PROPERTY.photos.length}
          </div>
        </div>
      )}
    </main>
  );
}
