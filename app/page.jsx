'use client';

import { useState, useEffect } from 'react';
import BookingCard from '../components/BookingCard';

const PROPERTY = {
  name: 'Lakeview A-Frame',
  location: 'Grand Lake, Colorado',
  tagline: 'A luxury mountain retreat designed for gathering, relaxing, and making memories.',
  description: `Welcome to our Grand Lake A-frame. Sip your morning coffee in the sun-filled great room,
unwind with an evening glass of wine in the hot tub beneath the stars, and look for moose and wildlife.
Just minutes from Grand Lake and Rocky Mountain National Park, this thoughtfully designed home offers
the perfect blend of adventure, comfort, and modern mountain charm.

Enjoy the fully equipped kitchen, coffee and tea station, and dry bar for crafting your favorite evening
drinks. Dine inside or al fresco on the deck while taking in the fresh mountain air. Get comfy in the
upstairs reading nook for quiet moments of relaxation.`,
  quickFacts: [
    ['Sleeps', '8 guests'],
    ['Layout', '3 bedrooms · 2 bathrooms'],
    ['Check-in', '4:00 PM'],
    ['Check-out', '11:00 AM'],
  ],
  amenities: [
    'Lake access & private dock',
    'Hot tub',
    'Wood-burning fireplace',
    'Full kitchen',
    'Free WiFi',
    'Washer & dryer',
    'Parking for 2 cars',
    'Pet friendly',
    'Private hot tub',
    'Coffee & tea station',
    'Dry bar',
    'Deck dining, al fresco',
    'Upstairs reading nook',
    'Sleeps 8 · 3 bed / 2 bath',
  ],
  photos: [
    '/photos/hero-1.jpg', '/photos/hero-2.jpg', '/photos/hero-3.jpg',
    '/photos/hero-4.jpg', '/photos/hero-5.jpg', '/photos/hero-6.jpg',
    '/photos/hero-7.jpg', '/photos/hero-8.jpg', '/photos/hero-9.jpg',
    '/photos/hero-10.jpg', '/photos/hero-11.jpg', '/photos/hero-12.jpg',
    '/photos/hero-13.jpg', '/photos/hero-14.jpg',
  ],
};

const SEASONS = [
  {
    season: 'Spring & Summer',
    groups: [
      {
        title: 'Rocky Mountain National Park',
        items: [
          ['Via Trail Ridge Road', "Just minutes away. Breathtaking alpine scenery, abundant wildlife, scenic drives, and endless hiking."],
        ],
      },
      {
        title: 'Boating the three lakes',
        items: [
          ['Trail Ridge Marina', 'Very close to the house.'],
          ['Grand Lake Marina & Boater\u2019s Choice', 'Rent pontoon boats, kayaks, paddle boats and canoes to explore Grand Lake, Lake Granby and Shadow Mountain Lake.'],
        ],
      },
      {
        title: 'Beaches',
        items: [
          ['Pine Beach Picnic Site', 'The closest one.'],
          ['Surprise Beach', 'On Lake Granby.'],
          ['Grand Lake Town Beach & Dock', 'Sandy shore just off the boardwalk.'],
        ],
      },
      {
        title: 'Mountain biking',
        items: [
          ['Trestle Bike Park', 'One of the premier downhill destinations in North America \u2014 over 40 miles of lift-served trails, from beginner flow to expert downhill.'],
        ],
      },
      {
        title: 'More to do',
        items: [
          ['Stroll Grand Avenue', "Local shops, an ice cream cone, a patio lunch, and the charm of Grand Lake's historic boardwalk."],
          ['Grand Lake Golf Course', ''],
          ['Fishing', ''],
          ['Whitewater rafting', ''],
          ['Grand Adventure Balloon Tours', ''],
          ['Granby and Fraser rodeos', ''],
        ],
      },
    ],
  },
  {
    season: 'Fall & Winter',
    groups: [
      {
        title: 'Rocky Mountain National Park',
        items: [
          ['Trail Ridge Road, partial access', 'Weather permitting, you can drive the first 10\u201312 miles from the Grand Lake entrance before the road closes at the Colorado River Trailhead \u2014 passing Kawuneeche Valley, Farview Curve Overlook and the Colorado River Trailhead.'],
        ],
      },
      {
        title: 'Snowmobiling',
        items: [
          ['The Snowmobiling Capital of Colorado', 'Unforgettable winter riding for all experience levels, across miles of scenic forest trails with stunning mountain views.'],
        ],
      },
      {
        title: 'Skiing',
        items: [
          ['Winter Park Ski Resort', '34 miles away \u2014 our favorite local resort and town.'],
          ['Steamboat Ski Resort', '90 miles to Steamboat Springs.'],
          ['Grand Lake Nordic Center', 'Roughly 35 km of groomed trails for classic and skate skiing, plus a free tubing hill.'],
        ],
      },
      {
        title: 'In town',
        items: [
          ['Grand Lake Town Park Ice Rink', '1028 Grand Ave, Grand Lake.'],
          ['Stroll historic downtown Grand Lake', ''],
          ['Sleigh rides', ''],
          ['Ice fishing', ''],
          ['Snowshoeing', ''],
        ],
      },
    ],
  },
];

export default function HomePage() {
  const nightlyRate = Number(process.env.NIGHTLY_RATE_USD || 350);
  const cleaningFee = Number(process.env.CLEANING_FEE_USD || 150);
  const depositPercent = Number(process.env.DEPOSIT_PERCENT || 100);

  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [season, setSeason] = useState(0);
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
          gap: 8px; height: 440px; margin-bottom: 20px;
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
        .facts { display: flex; flex-wrap: wrap; gap: 10px 26px; margin: 0 0 18px; padding: 0; list-style: none; }
        .facts li { font-size: 14px; }
        .facts b { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; opacity: .55; font-weight: 600; }
        .season-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
        .season-tabs button {
          border: 1px solid rgba(0,0,0,0.15); background: transparent;
          padding: 7px 15px; border-radius: 20px; font-size: 14px; cursor: pointer;
        }
        .season-tabs button[data-on="1"] { background: #2f4f3e; color: #fff; border-color: #2f4f3e; }
        .ttd-group { margin-bottom: 24px; }
        .ttd-group h3 { margin: 0 0 8px; font-size: 16px; }
        .ttd-item { padding: 8px 0; border-top: 1px solid rgba(0,0,0,0.08); }
        .ttd-item strong { display: block; font-weight: 600; }
        .ttd-item span { font-size: 14px; opacity: .78; line-height: 1.5; }
        .ttd-note {
          background: rgba(47,79,62,0.07); border-left: 3px solid #2f4f3e;
          padding: 12px 15px; border-radius: 5px; font-size: 14px; line-height: 1.55;
        }
        .ttd-note strong { display: block; margin-bottom: 4px; }
      `}</style>

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
            <h2>Things to do and see</h2>

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
