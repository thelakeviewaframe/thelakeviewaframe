'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BookingCard from '../components/BookingCard';
import SiteNav from '../components/SiteNav';
import { PROPERTY, REVIEWS } from '../lib/content';

function Stars() {
  return <span className="stars">★★★★★</span>;
}

function ReviewCard({ r, onOpen }) {
  const isLong = r.text.length > 220;
  const preview = isLong ? r.text.slice(0, 220).trimEnd() + '…' : r.text;

  return (
    <article className="review">
      <div className="review-top">
        <div className="avatar">{r.name.charAt(0)}</div>
        <div>
          <strong>{r.name}</strong>
          <span className="review-meta">{r.place ? `${r.place} · ` : ''}{r.date}</span>
        </div>
      </div>
      <div className="review-rating">
        <Stars />
        <span className="source-tag">{r.source}</span>
      </div>
      <p className="review-text">{preview}</p>
      {isLong && (
        <button className="review-more" onClick={onOpen}>Read more</button>
      )}
    </article>
  );
}

export default function HomePage() {
  const nightlyRate = Number(process.env.NIGHTLY_RATE_USD || 350);
  const cleaningFee = Number(process.env.CLEANING_FEE_USD || 150);
  const depositPercent = Number(process.env.DEPOSIT_PERCENT || 100);

  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [reviewsOpen, setReviewsOpen] = useState(false);
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

  useEffect(() => {
    if (!reviewsOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setReviewsOpen(false); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [reviewsOpen]);

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

        .stars { color: #c8853a; letter-spacing: 1px; font-size: 13px; }
        .rating-summary {
          display: flex; align-items: baseline; gap: 10px;
          margin: 0 0 20px; flex-wrap: wrap;
        }
        .rating-summary .big { font-size: 26px; font-weight: 700; line-height: 1; }
        .rating-summary .sub { font-size: 14px; opacity: .65; }

        .reviews { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; align-items: start; }
        @media (max-width: 900px) { .reviews { grid-template-columns: 1fr; } }

        .review {
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(0,0,0,0.09);
          border-radius: 14px; padding: 20px 22px;
        }
        .review-top { display: flex; align-items: center; gap: 11px; margin-bottom: 10px; }
        .avatar {
          width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
          background: #2f4f3e; color: #fff; font-weight: 600; font-size: 16px;
          display: flex; align-items: center; justify-content: center;
        }
        .review-top strong { display: block; font-size: 15px; line-height: 1.3; }
        .review-meta { font-size: 12.5px; opacity: .6; }
        .review-rating { display: flex; align-items: center; gap: 9px; margin-bottom: 11px; }
        .source-tag {
          font-size: 11px; text-transform: uppercase; letter-spacing: .05em;
          opacity: .5; font-weight: 600;
        }
        .review-text { margin: 0 0 10px; font-size: 14.5px; line-height: 1.62; opacity: .88; }
        .review-more {
          background: none; border: none; padding: 0; cursor: pointer;
          font-size: 13.5px; color: #2f4f3e; font-weight: 600; text-decoration: underline;
        }
        .more-reviews {
          margin-top: 18px; background: #fff; border: 1px solid rgba(0,0,0,0.25);
          border-radius: 9px; padding: 11px 20px; font-size: 14.5px;
          font-weight: 500; cursor: pointer;
        }
        .more-reviews:hover { border-color: #2f4f3e; }

        .modal-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.55);
          z-index: 9998; display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .modal {
          background: #faf7f2; border-radius: 16px; max-width: 720px; width: 100%;
          max-height: 85vh; overflow-y: auto; padding: 28px 30px; position: relative;
        }
        @media (max-width: 767px) { .modal { padding: 22px 20px; max-height: 90vh; } }
        .modal h2 { margin: 0 0 4px; }
        .modal-close {
          position: absolute; top: 16px; right: 18px; background: none; border: none;
          font-size: 30px; line-height: 1; cursor: pointer; opacity: .6;
        }
        .modal .review { background: none; border: none; border-bottom: 1px solid rgba(0,0,0,0.09);
          border-radius: 0; padding: 20px 0; }
        .modal .review:last-child { border-bottom: none; }

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
            <h2>Guest reviews</h2>
            <div className="rating-summary">
              <span className="big">5.0</span>
              <Stars />
              <span className="sub">{REVIEWS.length} reviews · Airbnb &amp; Vrbo</span>
            </div>

            <div className="reviews">
              {REVIEWS.slice(0, 4).map((r) => (
                <ReviewCard key={r.name + r.date} r={r} onOpen={() => setReviewsOpen(true)} />
              ))}
            </div>

            <button className="more-reviews" onClick={() => setReviewsOpen(true)}>
              Show all {REVIEWS.length} reviews
            </button>
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

      {reviewsOpen && (
        <div className="modal-backdrop" onClick={() => setReviewsOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setReviewsOpen(false)} aria-label="Close">×</button>
            <h2>Guest reviews</h2>
            <div className="rating-summary">
              <span className="big">5.0</span>
              <Stars />
              <span className="sub">{REVIEWS.length} reviews · Airbnb &amp; Vrbo</span>
            </div>
            {REVIEWS.map((r) => (
              <article className="review" key={r.name + r.date}>
                <div className="review-top">
                  <div className="avatar">{r.name.charAt(0)}</div>
                  <div>
                    <strong>{r.name}</strong>
                    <span className="review-meta">{r.place ? `${r.place} · ` : ''}{r.date}</span>
                  </div>
                </div>
                <div className="review-rating">
                  <Stars />
                  <span className="source-tag">{r.source}</span>
                </div>
                {r.text.split('\n\n').map((para, i) => (
                  <p className="review-text" key={i}>{para}</p>
                ))}
              </article>
            ))}
          </div>
        </div>
      )}

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
