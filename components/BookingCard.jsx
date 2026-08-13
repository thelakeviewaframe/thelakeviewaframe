'use client';

import { useEffect, useState } from 'react';
import Calendar from './Calendar';

// Enlaces a los listados en las plataformas.
const AIRBNB_URL = 'https://www.airbnb.com/rooms/1675528160694917343';
const VRBO_URL = 'https://www.vrbo.com/5324402';
const BOOKING_URL = 'https://www.booking.com/hotel/us/luxury-a-frame-with-hot-tub-in-moose-country';
// ───────────────────────────────────────────────────────

export default function BookingCard({ nightlyRate, cleaningFee, depositPercent, propertyName }) {
  const [blockedDates, setBlockedDates] = useState([]);
  const [range, setRange] = useState({ start: null, end: null });
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/availability')
      .then((r) => r.json())
      .then((data) => setBlockedDates(data.blockedDates || []))
      .catch(() => setError('Could not load availability — try refreshing.'));
  }, []);

  const nights = range.start && range.end
    ? Math.round((new Date(range.end) - new Date(range.start)) / 86400000)
    : 0;
  const total = nights > 0 ? nights * nightlyRate + cleaningFee : 0;
  const dueNow = Math.round((total * depositPercent) / 100);

  const platforms = [
    { name: 'Airbnb', url: AIRBNB_URL },
    { name: 'Vrbo', url: VRBO_URL },
    { name: 'Booking.com', url: BOOKING_URL },
  ].filter((p) => p.url && !p.url.startsWith('PEGA_AQUI'));

  const canSubmit = nights > 0 && guestName.trim() && guestEmail.trim() && !submitting;

  async function handleRequest() {
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIn: range.start,
          checkOut: range.end,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setSubmitting(false);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      setError('Could not reach the server. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="booking-card">
      <style>{`
        .guest-fields { margin-top: 18px; display: flex; flex-direction: column; gap: 10px; }
        .guest-fields label {
          font-size: 11.5px; font-weight: 600; letter-spacing: .12em;
          text-transform: uppercase; color: #8a8a8a; margin-bottom: 4px; display: block;
        }
        /* Scoped on purpose: a global input rule broke the calendar grid before. */
        .guest-fields input[type="text"],
        .guest-fields input[type="email"] {
          width: 100%; box-sizing: border-box;
          padding: 11px 12px; font-size: 14px; color: #3d3d3d;
          border: 1px solid rgba(187,142,101,0.4); border-radius: 2px;
          background: #fff; font-family: inherit;
        }
        .guest-fields input:focus { outline: none; border-color: #bb8e65; }
        .request-btn {
          width: 100%; box-sizing: border-box; margin-top: 16px;
          padding: 14px 16px; border: none; border-radius: 2px;
          background: #bb8e65; color: #fff; cursor: pointer;
          font-size: 11.5px; font-weight: 600;
          letter-spacing: .14em; text-transform: uppercase;
          font-family: inherit; transition: opacity .2s;
        }
        .request-btn:disabled { opacity: .45; cursor: not-allowed; }
        .hold-note {
          margin: 12px 0 0; font-size: 12.5px; line-height: 1.6; color: #7a7a7a;
        }
        .ota-block {
          margin-top: 22px; padding-top: 22px;
          border-top: 1px solid rgba(187,142,101,0.28);
        }
        .ota-block h4 {
          margin: 0 0 6px; font-size: 15px; font-weight: 600;
          color: #545454; letter-spacing: -0.01em;
        }
        .ota-block p {
          margin: 0 0 16px; font-size: 13.5px; line-height: 1.6; color: #7a7a7a;
        }
        .ota-links { display: flex; flex-direction: column; gap: 9px; }
        .ota-links a {
          display: block; text-align: center; text-decoration: none;
          padding: 12px 16px; border-radius: 2px;
          border: 1px solid #bb8e65; color: #bb8e65;
          font-size: 11.5px; font-weight: 600;
          letter-spacing: .14em; text-transform: uppercase;
          transition: background .2s, color .2s;
        }
        .ota-links a:hover { background: #bb8e65; color: #fff; }
        .ota-empty {
          font-size: 13px; line-height: 1.6; color: #9a9a9a; margin: 0;
        }
      `}</style>

      <div className="rate">
        ${nightlyRate}<span> / night</span>
      </div>

      <Calendar blockedDates={blockedDates} range={range} onRangeChange={setRange} />

      {nights > 0 && (
        <div>
          <div className="total-line"><span>{nights} night(s)</span><span>${nights * nightlyRate}</span></div>
          <div className="total-line"><span>Cleaning fee</span><span>${cleaningFee}</span></div>
          {depositPercent < 100 && (
            <div className="total-line"><span>Total</span><span>${total}</span></div>
          )}
          <div className="total-line due">
            <span>{depositPercent < 100 ? `Due now (${depositPercent}% deposit)` : 'Total'}</span>
            <span>${dueNow}</span>
          </div>
        </div>
      )}

      <div className="guest-fields">
        <div>
          <label htmlFor="guest-name">Name</label>
          <input
            id="guest-name"
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Your full name"
          />
        </div>
        <div>
          <label htmlFor="guest-email">Email</label>
          <input
            id="guest-email"
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
      </div>

      <button className="request-btn" onClick={handleRequest} disabled={!canSubmit}>
        {submitting ? 'One moment…' : 'Request to book'}
      </button>

      <p className="hold-note">
        Your card is held, not charged. We confirm every request within 24 hours,
        and you&apos;re only charged once we do.
      </p>

      {error && <div className="error-text">{error}</div>}

      <div className="ota-block">
        <h4>Prefer to book elsewhere?</h4>
        <p>You can also find us on Airbnb, Vrbo and Booking.com.</p>
        {platforms.length > 0 ? (
          <div className="ota-links">
            {platforms.map((p) => (
              <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer">
                Book on {p.name}
              </a>
            ))}
          </div>
        ) : (
          <p className="ota-empty">
            Search for {propertyName} on Airbnb, Vrbo or Booking.com to check these dates.
          </p>
        )}
      </div>
    </div>
  );
}
