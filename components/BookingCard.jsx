'use client';

import { useEffect, useState } from 'react';
import Calendar from './Calendar';

// Enlaces a los listados en las plataformas.
const AIRBNB_URL = 'https://www.airbnb.com/rooms/1675528160694917343';
const VRBO_URL = 'https://www.vrbo.com/5324402';
const BOOKING_URL = 'https://www.booking.com/hotel/us/luxury-a-frame-with-hot-tub-in-moose-country';

// Cuántos meses hacia adelante se puede reservar.
const BOOKING_WINDOW_MONTHS = 12;
// ───────────────────────────────────────────────────────

export default function BookingCard({ nightlyRate, cleaningFee, depositPercent, propertyName }) {
  const [blockedDates, setBlockedDates] = useState([]);
  const [pricing, setPricing] = useState({});
  // Las tarifas llegan del servidor, no de las props. Las props se calculan
  // en el navegador, donde process.env.CLEANING_FEE_USD siempre sale vacío
  // (Next.js solo expone las que empiezan con NEXT_PUBLIC_), así que
  // llegaban con los valores de respaldo del código en vez de los reales.
  const [fees, setFees] = useState(null);
  const [range, setRange] = useState({ start: null, end: null });
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/availability')
      .then((r) => r.json())
      .then((data) => {
        setBlockedDates(data.blockedDates || []);
        setPricing(data.pricing || {});
        setFees({
          cleaningFee: data.cleaningFee,
          depositPercent: data.depositPercent,
        });
      })
      .catch(() => setError('Could not load availability — try refreshing.'));
  }, []);

  // Ventana de reserva anticipada: 12 meses móviles desde hoy, igual que
  // abren las OTAs. Se recorre sola cada día, así nadie tiene que acordarse
  // de moverla. El servidor vuelve a validarlo antes de cobrar.
  const windowEnd = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + BOOKING_WINDOW_MONTHS);
    return d.toISOString().slice(0, 10);
  })();

  // Noches del rango. La fecha de salida no cuenta: no se duerme esa noche.
  const nightKeys = [];
  if (range.start && range.end) {
    const cursor = new Date(range.start + 'T00:00:00Z');
    const end = new Date(range.end + 'T00:00:00Z');
    while (cursor < end) {
      nightKeys.push(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }
  const nights = nightKeys.length;

  // Si tenemos precio de todas las noches usamos esos. Si falta alguno,
  // caemos a la tarifa fija para no mostrar un total incompleto. El servidor
  // recalcula todo antes de cobrar, así que esto es solo lo que ve el huésped.
  const havePricesForAll = nights > 0 && nightKeys.every((k) => pricing[k]);
  const nightsSubtotal = havePricesForAll
    ? nightKeys.reduce((sum, k) => sum + pricing[k].price, 0)
    : nights * nightlyRate;

  const effectiveCleaningFee = fees?.cleaningFee ?? cleaningFee;
  const effectiveDepositPercent = fees?.depositPercent ?? depositPercent;

  const total = nights > 0 ? Math.round(nightsSubtotal + effectiveCleaningFee) : 0;
  const dueNow = Math.round((total * effectiveDepositPercent) / 100);
  const avgNight = nights > 0 ? Math.round(nightsSubtotal / nights) : 0;

  // Reglas de estancia, las mismas que rigen en las OTAs.
  const arrival = range.start ? pricing[range.start] : null;
  const departure = range.end ? pricing[range.end] : null;
  const minStay = arrival?.minStay || 0;

  let ruleWarning = '';
  if (range.start && arrival && arrival.checkIn === false) {
    ruleWarning = 'We are not able to start a stay on that date — please pick another arrival day.';
  } else if (range.end && departure && departure.checkOut === false) {
    ruleWarning = 'We are not able to end a stay on that date — please pick another departure day.';
  } else if (nights > 0 && minStay && nights < minStay) {
    ruleWarning = `Those dates require a minimum stay of ${minStay} nights.`;
  }

  const platforms = [
    { name: 'Airbnb', url: AIRBNB_URL },
    { name: 'Vrbo', url: VRBO_URL },
    { name: 'Booking.com', url: BOOKING_URL },
  ].filter((p) => p.url && !p.url.startsWith('PEGA_AQUI'));

  const canSubmit =
    nights > 0 && !ruleWarning && guestName.trim() && guestEmail.trim() && !submitting;

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
        /* Acotado a proposito: una regla global de input rompio la rejilla
           del calendario antes. */
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
        .window-note { color: #9a9a9a; font-size: 12px; }
        .rule-note {
          margin: 12px 0 0; padding: 10px 12px;
          background: rgba(187,142,101,0.09);
          border-left: 2px solid #bb8e65;
          font-size: 12.5px; line-height: 1.55; color: #6d5540;
        }
        .rate-empty {
          font-size: 15px; font-weight: 400; color: #7a7a7a;
          letter-spacing: 0; text-transform: none;
        }
        .rate-sub {
          display: block; margin-top: 2px;
          font-size: 12px; color: #9a9a9a; letter-spacing: 0;
          text-transform: none; font-weight: 400;
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

      {/* Sin fechas no hay un precio honesto que mostrar: cada noche vale
          distinto. En vez de un número fijo que después no cuadra con el
          total, invitamos a escoger fechas. */}
      <div className="rate">
        {nights > 0 ? (
          <>
            ${avgNight}<span> / night</span>
            {havePricesForAll && <span className="rate-sub">average for your dates</span>}
          </>
        ) : (
          <span className="rate-empty">Select your dates for pricing</span>
        )}
      </div>

      <Calendar
        blockedDates={blockedDates}
        range={range}
        onRangeChange={setRange}
        pricing={pricing}
        maxDate={windowEnd}
      />

      {nights > 0 && (
        <div>
          <div className="total-line">
            <span>{nights} night(s)</span><span>${Math.round(nightsSubtotal)}</span>
          </div>
          <div className="total-line">
            <span>Cleaning fee</span><span>${effectiveCleaningFee}</span>
          </div>
          {effectiveDepositPercent < 100 && (
            <div className="total-line"><span>Total</span><span>${total}</span></div>
          )}
          <div className="total-line due">
            <span>
              {effectiveDepositPercent < 100
                ? `Due now (${effectiveDepositPercent}% deposit)`
                : 'Total'}
            </span>
            <span>${dueNow}</span>
          </div>
        </div>
      )}

      {ruleWarning && <div className="rule-note">{ruleWarning}</div>}

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

      <p className="hold-note window-note">
        We take bookings up to {BOOKING_WINDOW_MONTHS} months ahead. Dates beyond
        that aren&apos;t open yet &mdash; they&apos;re not booked.
      </p>

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
