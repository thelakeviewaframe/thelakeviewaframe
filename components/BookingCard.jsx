'use client';

import { useEffect, useState } from 'react';
import Calendar from './Calendar';

export default function BookingCard({ nightlyRate, cleaningFee, depositPercent, propertyName }) {
  const [blockedDates, setBlockedDates] = useState([]);
  const [range, setRange] = useState({ start: null, end: null });
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [loading, setLoading] = useState(false);
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

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!range.start || !range.end) {
      setError('Select your check-in and check-out dates.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIn: range.start,
          checkOut: range.end,
          guestName,
          guestEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="booking-card">
      <div className="rate">
        ${nightlyRate}<span> / night</span>
      </div>

      <Calendar blockedDates={blockedDates} range={range} onRangeChange={setRange} />

      <form className="booking-form" onSubmit={handleSubmit}>
        <input
          placeholder="Full name"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          required
        />

        {nights > 0 && (
          <div>
            <div className="total-line"><span>{nights} night(s)</span><span>${nights * nightlyRate}</span></div>
            <div className="total-line"><span>Cleaning fee</span><span>${cleaningFee}</span></div>
            {depositPercent < 100 && (
              <div className="total-line"><span>Total</span><span>${total}</span></div>
            )}
            <div className="total-line due">
              <span>{depositPercent < 100 ? `Due now (${depositPercent}% deposit)` : 'Due now'}</span>
              <span>${dueNow}</span>
            </div>
          </div>
        )}

        {error && <div className="error-text">{error}</div>}

        <button className="btn-primary" type="submit" disabled={loading || nights <= 0}>
          {loading ? 'Redirecting to payment…' : 'Request to Book'}
        </button>
      </form>
    </div>
  );
}
