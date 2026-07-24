'use client';

import { useState } from 'react';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function toKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// A hand-rolled month grid — no calendar library dependency.
// Click a start date, then an end date, to select a range. Blocked nights
// (from Airbnb/VRBO iCal sync + existing direct bookings) can't be picked.
export default function Calendar({ blockedDates, range, onRangeChange }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const blockedSet = new Set(blockedDates);

  function isPast(y, m, d) {
    const date = new Date(y, m, d);
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < t;
  }

  function handleClick(y, m, d) {
    const key = toKey(y, m, d);
    if (blockedSet.has(key) || isPast(y, m, d)) return;

    if (!range.start || (range.start && range.end)) {
      onRangeChange({ start: key, end: null });
    } else {
      if (key > range.start) {
        // Reject if any night in between is blocked
        const start = new Date(range.start + 'T00:00:00');
        const end = new Date(key + 'T00:00:00');
        let blocked = false;
        const cursor = new Date(start);
        while (cursor < end) {
          if (blockedSet.has(cursor.toISOString().slice(0, 10))) blocked = true;
          cursor.setDate(cursor.getDate() + 1);
        }
        if (blocked) {
          onRangeChange({ start: key, end: null });
        } else {
          onRangeChange({ start: range.start, end: key });
        }
      } else {
        onRangeChange({ start: key, end: null });
      }
    }
  }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  }

  return (
    <div className="calendar">
      <div className="cal-header">
        <button type="button" className="cal-nav-btn" onClick={prevMonth}>&larr;</button>
        <span>{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button type="button" className="cal-nav-btn" onClick={nextMonth}>&rarr;</button>
      </div>
      <div className="cal-grid">
        {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} style={{ fontWeight: 600, textAlign: 'center' }}>{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="cal-day empty" />;
          const key = toKey(viewYear, viewMonth, d);
          const blocked = blockedSet.has(key) || isPast(viewYear, viewMonth, d);
          const isSelected = key === range.start || key === range.end;
          const inRange = range.start && range.end && key > range.start && key < range.end;
          return (
            <div
              key={i}
              className={`cal-day ${blocked ? 'blocked' : ''} ${isSelected ? 'selected' : ''} ${inRange ? 'in-range' : ''}`}
              onClick={() => handleClick(viewYear, viewMonth, d)}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}
