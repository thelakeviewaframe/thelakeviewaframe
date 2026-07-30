'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [current, setCurrent] = useState(0);
  const trackRef = useRef(null);
  const isOpen = lightboxIndex !== null;
  const total = PROPERTY.photos.length;

  const close = () => setLightboxIndex(null);
  const next = () => setLightboxIndex((i) => (i + 1) % total);
  const prev = () => setLightboxIndex((i) => (i - 1 + total) % total);

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

  const scrollTo = (i) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(i, total - 1));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: 'smooth' });
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    setCurrent(Math.round(track.scrollLeft / track.clientWidth));
  };

  const arrowStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(255,255,255,0.92)',
    cursor: 'pointer',
    fontSize: 22,
    lineHeight: 1,
    boxShadow: '0 1px 6px rgba(0,0,0,0.28)',
  };

  return (
    <main className="container">
      <style>{`
        .lv-hero { position: relative; margin-bottom: 20px; }
        .lv-track {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          border-radius: 10px;
        }
        .lv-track::-webkit-scrollbar { display: none; }
        .lv-slide {
          flex: 0 0 100%;
          width: 100%;
          aspect-ratio: 4 / 3;
          object-fit: cover;
          scroll-snap-align: start;
          cursor: zoom-in;
          display: block;
        }
        .lv-arrow { display: none; }
        @media (min-width: 768px) {
          .lv-slide { aspect-ratio: 16 / 9; }
          .lv-arrow { display: block; }
        }
      `}</style>

      <div className="lv-hero">
        <div className="lv-track" ref={trackRef} onScroll={onScroll}>
          {PROPERTY.photos.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={i === 0 ? PROPERTY.name : ''}
              loading={i < 2 ? 'eager' : 'lazy'}
              className="lv-slide"
              onClick={() => setLightboxIndex(i)}
            />
          ))}
        </div>

        {current > 0 && (
          <button className="lv-arrow" style={{ ...arrowStyle, left: 10 }} onClick={() => scrollTo(current - 1)} aria-label="Previous">‹</button>
        )}
        {current < total - 1 && (
          <button className="lv-arrow" style={{ ...arrowStyle, right: 10 }} onClick={() => scrollTo(current + 1)} aria-label="Next">›</button>
        )}

        <div
          style={{
            position: 'absolute', bottom: 12, right: 14,
            background: 'rgba(0,0,0,0.6)', color: '#fff',
            fontSize: 12, padding: '4px 10px', borderRadius: 12,
          }}
        >
          {current + 1} / {total}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {PROPERTY.photos.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`Photo ${i + 1}`}
            style={{
              width: 7, height: 7, borderRadius: '50%', border: 'none', padding: 0,
              cursor: 'pointer',
              background: i === current ? '#2f4f3e' : 'rgba(0,0,0,0.2)',
            }}
          />
        ))}
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
            aria-label="Close"
            style={{ position: 'absolute', top: 18, right: 22, fontSize: 34, lineHeight: 1, color: '#fff', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ×
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous photo"
            style={{ position: 'absolute', left: 10, fontSize: 42, lineHeight: 1, color: '#fff', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 14px' }}
          >
            ‹
          </button>

          <img
            src={PROPERTY.photos[lightboxIndex]}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '94vw', maxHeight: '86vh', objectFit: 'contain', borderRadius: 4 }}
          />

          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next photo"
            style={{ position: 'absolute', right: 10, fontSize: 42, lineHeight: 1, color: '#fff', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 14px' }}
          >
            ›
          </button>

          <div style={{ position: 'absolute', bottom: 18, color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
            {lightboxIndex + 1} / {total}
          </div>
        </div>
      )}
    </main>
  );
}
