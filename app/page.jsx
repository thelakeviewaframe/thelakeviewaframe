'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BookingCard from '../components/BookingCard';
import SiteNav from '../components/SiteNav';
import { PROPERTY, REVIEWS } from '../lib/content';

function Stars() {
  return <span className="stars">★★★★★</span>;
}

function ReviewBody({ r }) {
  return (
    <>
      <div className="review-top">
        <div className="avatar">{r.name.charAt(0)}</div>
        <div>
          <strong>{r.name}</strong>
          <span className="review-meta">{r.place ? `${r.place} · ` : ''}{r.date}</span>
        </div>
        <span className="source-tag">{r.source}</span>
      </div>
      <Stars />
    </>
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
          gap: 10px; height: 470px; margin-bottom: 6px;
          border-radius: 3px; overflow: hidden;
        }
        .photo-grid .main { grid-row: 1 / 3; }
        .photo-grid img { transition: opacity .35s ease; }
        .photo-grid img:hover { opacity: .9; }
        @media (max-width: 767px) { .photo-grid { height: 290px; gap: 6px; } }

        .show-all-btn {
          position: absolute; bottom: 18px; right: 18px;
          background: rgba(255,255,255,0.95); border: none;
          border-radius: 2px; padding: 11px 20px;
          font-size: 11.5px; font-weight: 600; letter-spacing: .12em;
          text-transform: uppercase; color: #545454; cursor: pointer;
          box-shadow: 0 2px 14px rgba(0,0,0,0.16);
        }
        @media (max-width: 767px) {
          .show-all-btn { bottom: 11px; right: 11px; padding: 9px 14px; font-size: 10px; }
        }

        .eyebrow {
          font-size: 11.5px; text-transform: uppercase; letter-spacing: .2em;
          color: #bb8e65; font-weight: 600; margin: 34px 0 0;
        }

        .facts {
          display: flex; flex-wrap: wrap; gap: 0; margin: 0 0 34px; padding: 20px 0;
          list-style: none; border-top: 1px solid rgba(187,142,101,0.22);
          border-bottom: 1px solid rgba(187,142,101,0.22);
        }
        .facts li { flex: 1 1 auto; min-width: 120px; padding-right: 24px; font-size: 15px; }
        .facts b {
          display: block; font-size: 10.5px; text-transform: uppercase;
          letter-spacing: .13em; color: #bb8e65; font-weight: 600; margin-bottom: 3px;
        }

        .stars { color: #bb8e65; letter-spacing: 2.5px; font-size: 12px; }

        .rating-summary { display: flex; align-items: center; gap: 13px; margin: 0 0 26px; flex-wrap: wrap; }
        .rating-summary .big {
          font-size: 40px; font-weight: 600; line-height: 1;
          color: #bb8e65; letter-spacing: -0.02em;
        }
        .rating-summary .sub { font-size: 13.5px; color: #7a7a7a; }

        .reviews { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; align-items: start; }
        @media (max-width: 900px) { .reviews { grid-template-columns: 1fr; } }

        .review {
          background: #fff; border: 1px solid rgba(187,142,101,0.18);
          border-radius: 3px; padding: 26px 28px;
        }
        @media (max-width: 767px) { .review { padding: 22px 20px; } }

        .review-top { display: flex; align-items: center; gap: 12px; margin-bottom: 9px; }
        .avatar {
          width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
          background: #bb8e65; color: #fff; font-weight: 500; font-size: 16px;
          display: flex; align-items: center; justify-content: center;
        }
        .review-top strong { display: block; font-size: 15px; font-weight: 600; color: #545454; line-height: 1.3; }
        .review-meta { font-size: 12.5px; color: #9a9a9a; }
        .source-tag {
          margin-left: auto; font-size: 9.5px; text-transform: uppercase;
          letter-spacing: .13em; color: #bb8e65; font-weight: 600;
          border: 1px solid rgba(187,142,101,0.35); border-radius: 2px; padding: 3px 8px;
        }
        .review-text { margin: 11px 0 0; font-size: 14.5px; line-height: 1.72; color: #545454; }
        .review-more {
          background: none; border: none; padding: 0; margin-top: 13px; cursor: pointer;
          font-size: 11.5px; text-transform: uppercase; letter-spacing: .12em;
          color: #bb8e65; font-weight: 600;
        }
        .more-reviews {
          margin-top: 24px; background: none; border: 1px solid #bb8e65;
          border-radius: 2px; padding: 14px 30px;
          font-size: 11.5px; text-transform: uppercase; letter-spacing: .14em;
          font-weight: 600; color: #bb8e65; cursor: pointer; transition: all .2s;
        }
        .more-reviews:hover { background: #bb8e65; color: #fff; }

        .modal-backdrop {
          position: fixed; inset: 0; background: rgba(40,35,30,0.6);
          z-index: 9998; display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .modal {
          background: #f4f3f1; border-radius: 3px; max-width: 740px; width: 100%;
          max-height: 86vh; overflow-y: auto; padding: 40px 44px; position: relative;
        }
        @media (max-width: 767px) { .modal { padding: 30px 22px; max-height: 90vh; } }
        .modal-close {
          position: absolute; top: 18px; right: 22px; background: none; border: none;
          font-size: 30px; line-height: 1; cursor: pointer; color: #bb8e65;
        }
        .modal .review { border: none; border-bottom: 1px solid rgba(187,142,101,0.22);
          background: none; border-radius: 0; padding: 26px 0; }
        .modal .review:last-child { border-bottom: none; }

        .teasers { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        @media (max-width: 767px) { .teasers { grid-template-columns: 1fr; } }
        .teaser {
          display: block; text-decoration: none; background: #fff;
          border: 1px solid rgba(187,142,101,0.18); border-radius: 3px;
          padding: 30px 32px; transition: border-color .25s;
        }
        .teaser:hover { border-color: #bb8e65; }
        .teaser h3 { color: #bb8e65; font-size: 19px; font-weight: 600; margin: 0 0 9px; }
        .teaser p { margin: 0 0 16px; font-size: 14.5px; color: #545454; line-height: 1.65; }
        .teaser em {
          font-style: normal; font-size: 11.5px; text-transform: uppercase;
          letter-spacing: .13em; color: #bb8e65; font-weight: 600;
        }
      `}</style>

      <SiteNav />

      <div className="photo-grid">
        <img className="main" src={PROPERTY.photos[0]} alt={PROPERTY.name} onClick={() => setLightboxIndex(0)} style={cellStyle} />
        <img src={PROPERTY.photos[1]} alt="" onClick={() => setLightboxIndex(1)} style={cellStyle} />
        <img src={PROPERTY.photos[2]} alt="" onClick={() => setLightboxIndex(2)} style={cellStyle} />
        <button className="show-all-btn" onClick={() => setLightboxIndex(0)}>
          View all {PROPERTY.photos.length} photos
        </button>
      </div>

      <p className="eyebrow">{PROPERTY.location}</p>
      <h1>{PROPERTY.name}</h1>
      <p className="subtitle">{PROPERTY.tagline}</p>

      <div className="layout">
        <div>
          <div className="section">
            <ul className="facts">
              {PROPERTY.quickFacts.map(([k, v]) => (
                <li key={k}><b>{k}</b>{v}</li>
              ))}
            </ul>
            <h2>The Space</h2>
            {PROPERTY.description.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
          </div>

          <div className="section">
            <h2>Amenities</h2>
            <ul className="amenities">
              {PROPERTY.amenities.map((a) => <li key={a}>{a}</li>)}
            </ul>
          </div>

          <div className="section">
            <h2>Guest Reviews</h2>
            <div className="rating-summary">
              <span className="big">5.0</span>
              <Stars />
              <span className="sub">{REVIEWS.length} reviews · Airbnb &amp; Vrbo</span>
            </div>

            <div className="reviews">
              {REVIEWS.slice(0, 4).map((r) => {
                const isLong = r.text.length > 210;
                const preview = isLong ? r.text.slice(0, 210).trimEnd() + '…' : r.text;
                return (
                  <article className="review" key={r.name + r.date}>
                    <ReviewBody r={r} />
                    <p className="review-text">{preview}</p>
                    {isLong && (
                      <button className="review-more" onClick={() => setReviewsOpen(true)}>
                        Read full review
                      </button>
                    )}
                  </article>
                );
              })}
            </div>

            <button className="more-reviews" onClick={() => setReviewsOpen(true)}>
              Read all {REVIEWS.length} reviews
            </button>
          </div>

          <div className="section">
            <div className="teasers">
              <Link href="/things-to-do" className="teaser">
                <h3>Things to Do</h3>
                <p>
                  Rocky Mountain National Park is minutes away. Boating, beaches and trails in
                  summer; snowmobiling, Nordic skiing and sleigh rides in winter.
                </p>
                <em>Explore the area →</em>
              </Link>

              <Link href="/about" className="teaser">
                <h3>Your Hosts</h3>
                <p>
                  We&apos;re Koren and Jess. We moved to Colorado in 2018 and kept coming back to
                  Grand Lake until we finally bought a place of our own here.
                </p>
                <em>Meet us →</em>
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
            <h2>Guest Reviews</h2>
            <div className="rating-summary">
              <span className="big">5.0</span>
              <Stars />
              <span className="sub">{REVIEWS.length} reviews · Airbnb &amp; Vrbo</span>
            </div>
            {REVIEWS.map((r) => (
              <article className="review" key={r.name + r.date}>
                <ReviewBody r={r} />
                {r.text.split('\n\n').map((para, i) => (
                  <p className="review-text" key={i}>{para}</p>
                ))}
              </article>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(30,26,22,0.96)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={close} aria-label="Close" style={{ position: 'absolute', top: 16, right: 22, fontSize: 34, lineHeight: 1, color: '#bb8e65', background: 'none', border: 'none', cursor: 'pointer', zIndex: 2 }}>×</button>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous photo" style={{ position: 'absolute', left: 6, fontSize: 42, lineHeight: 1, color: '#bb8e65', background: 'none', border: 'none', cursor: 'pointer', padding: '14px 16px', zIndex: 2 }}>‹</button>
          <img src={PROPERTY.photos[lightboxIndex]} alt="" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '92vw', maxHeight: '86vh', objectFit: 'contain' }} />
          <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next photo" style={{ position: 'absolute', right: 6, fontSize: 42, lineHeight: 1, color: '#bb8e65', background: 'none', border: 'none', cursor: 'pointer', padding: '14px 16px', zIndex: 2 }}>›</button>
          <div style={{ position: 'absolute', bottom: 18, color: 'rgba(255,255,255,0.6)', fontSize: 12, letterSpacing: '.1em' }}>
            {lightboxIndex + 1} / {PROPERTY.photos.length}
          </div>
        </div>
      )}
    </main>
  );
}
