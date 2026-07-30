'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BookingCard from '../components/BookingCard';
import SiteNav from '../components/SiteNav';
import { PROPERTY, REVIEWS } from '../lib/content';

function Review({ r }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = r.text.length > 260;
  const shown = expanded || !isLong ? r.text : r.text.slice(0, 260).trimEnd() + '…';

  return (
    <div className="review">
      <div className="review-head">
        <strong>{r.name}</strong>
        <span className="review-meta">
          {r.place ? `${r.place} · ` : ''}{r.date} · via {r.source}
        </span>
      </div>
      <div className="review-stars">{r.rating}</div>
      {shown.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
      {isLong && (
        <button className="review-more" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

export default function HomePage() {
  const nightlyRate = Number(process.env.NIGHTLY_RATE_USD || 350);
  const cleaningFee = Number(process.env.CLEANING_FEE_USD || 150);
  const depositPercent = Number(process.env.DEPOSIT_PERCENT || 100);

  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
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
  const visibleReviews = showAllReviews ? REVIEWS : REVIEWS.slice(0, 3);

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
        .rating-line { font-size: 15px; margin: 0 0 18px; }
        .rating-line b { font-size: 19px; }
        .reviews { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 767px) { .reviews { grid-template-columns: 1fr; } }
        .review {
          border: 1px solid rgba(0,0,0,0.12); border-radius: 10px;
          padding: 16px 18px; font-size: 14px;
        }
        .review-head strong { display: block; font-size: 15px; }
        .review-meta { font-size: 12.5px; opacity: .6; }
        .review-stars { color: #2f4f3e; font-size: 13px; margin: 4px 0 8px; }
        .review p { margin: 0 0 9px; line-height: 1.55; opacity: .85; }
        .review-more {
          background: none; border: none; padding: 0; cursor: pointer;
          font-size: 13.5px; color: #2f4f3e; font-weight: 500; text-decoration: underline;
        }
        .more-reviews {
          margin-top: 14px; background: none; border: 1px solid rgba(0,0,0,0.2);
          border-radius: 8px; padding: 9px 16px; font-size: 14px; cursor: pointer;
        }
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
            <p
