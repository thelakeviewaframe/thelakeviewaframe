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

  const scrollTo = (i) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(i, PROPERTY.photos.length - 1));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: 'smooth' });
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    setCurrent(Math.round(track.scrollLeft / track.clientWidth));
  };

  return (
    <main className="container">
      <div className="hero">
        <img
          src={PROPERTY.photos[0]}
          alt={PROPERTY.name}
          onClick={() => setLightboxIndex(0)}
          style={{ cursor: 'zoom-in' }}
        />
        <div className="hero-side">
          <img src={PROPERTY.photos[1]} alt="" onClick={() => setLightboxIndex(1)} style={{ cursor: 'zoom-in' }} />
          <img src={PROPERTY.photos[2]} alt="" onClick={() => setLightboxIndex(2)} style={{ cursor: 'zoom-in' }} />
        </div>
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

          <div className="section">
            <h2>Photos</h2>

            <div style={{ position: 'relative' }}>
              <div
                ref={trackRef}
                onScroll={onScroll}
                style={{
                  display: 'flex',
                  overflowX: 'auto',
                  scrollSnapType: 'x mandatory',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  borderRadius: 8,
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {PROPERTY.photos.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    loading={i < 2 ? 'eager' : 'lazy'}
                    onClick={() => setLightboxIndex(i)}
                    style={{
                      flex: '0 0 100%',
                      width: '100%',
                      aspectRatio: '3 / 2',
                      objectFit: 'cover',
                      scrollSnapAlign: 'start',
                      cursor: 'zoom-in',
                      display: 'block',
                    }}
                  />
                ))}
              </div>

              <button
                onClick={() => scrollTo(current - 1)}
                aria-label="Previous"
                style={{
                  position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                  width: 36, height: 36, borderRadius: '50%', border: 'none',
                  background: 'rgba(255,255,255,0.9)', cursor: 'pointer',
                  fontSize: 20, lineHeight: 1, display: current === 0 ? 'none' : 'block',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                }}
              >
                ‹
              </button>

              <button
                onClick={() => scrollTo(current + 1)}
                aria-label="Next"
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  width: 36, height: 36, borderRadius: '50%', border: 'none',
                  background: 'rgba(255,255,255,0.9)', cursor: 'pointer',
                  fontSize: 20, lineHeight: 1,
                  display: current >= PROPERTY.photos.length - 1 ? 'none' : 'block',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                }}
              >
                ›
              </button>

              <div
                style={{
                  position: 'absolute', bottom: 10, right: 12,
                  background: 'rgba(0,0,0,0.6)', color: '#fff',
                  fontSize: 12, padding: '3px 8px', borderRadius: 12,
                }}
              >
                {current + 1} / {PROPERTY.photos.length}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
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
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <button
            onClick={close}
            aria-label="Close"
            style={{ position: 'absolute', top: 20, right: 24, fontSize: 34, lineHeight: 1, color: '#fff', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ×
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous photo"
            style={{ position: 'absolute', left: 16, fontSize: 44, lineHeight: 1, color: '#fff', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px' }}
          >
            ‹
          </button>

          <img
            src={PROPERTY.photos[lightboxIndex]}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 4 }}
          />

          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next photo"
            style={{ position: 'absolute', right: 16, fontSize: 44, lineHeight: 1, color: '#fff', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px' }}
          >
            ›
          </button>

          <div style={{ position: 'absolute', bottom: 20, color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
            {lightboxIndex + 1} / {PROPERTY.photos.length}
          </div>
        </div>
      )}
    </main>
  );
}
