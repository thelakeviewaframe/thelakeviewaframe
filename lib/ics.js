// Minimal iCal (.ics) feed generator — no extra dependency needed.
// This is the feed you'll give Airbnb/VRBO to import, so a booking made on
// your own site blocks the dates on those platforms too.

function toIcsDate(d) {
  // All-day event format: YYYYMMDD
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

function escapeText(str = '') {
  return str.replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');
}

/**
 * bookings: [{ id, check_in, check_out, guest_name, status }]
 * Only 'paid' or 'pending' (not 'cancelled') bookings should be passed in.
 */
export function buildIcsFeed(bookings, { propertyName = 'Direct Booking Site' } = {}) {
  const now = toIcsDate(new Date()) + 'T000000Z';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//' + propertyName + '//Direct Booking Site//EN',
    'CALSCALE:GREGORIAN',
  ];

  for (const b of bookings) {
    const checkIn = new Date(b.check_in + 'T00:00:00Z');
    const checkOut = new Date(b.check_out + 'T00:00:00Z');
    lines.push(
      'BEGIN:VEVENT',
      `UID:direct-booking-${b.id}@${propertyName.replace(/\s+/g, '').toLowerCase()}`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${toIcsDate(checkIn)}`,
      `DTEND;VALUE=DATE:${toIcsDate(checkOut)}`,
      `SUMMARY:${escapeText('Reserved - Direct Booking')}`,
      `DESCRIPTION:${escapeText('Booked directly on ' + propertyName + ' website.')}`,
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
