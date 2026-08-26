import { getSupabaseServer } from '../../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

// GET /api/pricing/sync
// Una sola llamada a PriceLabs que trae dos cosas:
//   1. Precios y mínimos de noches  -> daily_prices
//   2. Disponibilidad de Booking.com -> blocked_dates (source 'bcom')
//
// Corre una vez al día por cron (ver vercel.json). PriceLabs recalcula cada
// 24 horas, así que no tiene sentido pedirlo más seguido.
//
// El sitio NUNCA le pregunta a PriceLabs mientras alguien reserva: si su
// servidor tarda o falla, se caería el checkout. Por eso guardamos aquí y el
// sitio lee de su propia base de datos.

// Los tres listings de la A-Frame comparten precio (mismo grupo en
// PriceLabs), así que los precios se piden una sola vez, desde Airbnb.
const PRICE_LISTING_ID = process.env.PRICELABS_LISTING_ID || '1675528160694917343';
const PRICE_LISTING_PMS = process.env.PRICELABS_PMS || 'airbnb';

// Booking.com nunca compartió su calendario con el sitio: era el único hueco
// real de disponibilidad que quedaba. PriceLabs sí conoce esa disponibilidad,
// y aquí la traemos para taparlo.
const BCOM_LISTING_ID = process.env.PRICELABS_BCOM_LISTING_ID || '17034590___1703459001';
const BCOM_LISTING_PMS = 'bcom';

const DAYS_AHEAD = 550;

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const apiKey = process.env.PRICELABS_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'PRICELABS_API_KEY not configured' }, { status: 500 });
  }

  const today = new Date();
  const end = new Date(today);
  end.setUTCDate(end.getUTCDate() + DAYS_AHEAD);
  const dateFrom = toISODate(today);
  const dateTo = toISODate(end);

  let payload;
  try {
    const res = await fetch('https://api.pricelabs.co/v1/listing_prices', {
      method: 'POST',
      headers: {
        // Ojo: PriceLabs distingue mayúsculas en este encabezado.
        // 'x-api-key' en minúsculas NO funciona.
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      body: JSON.stringify({
        listings: [
          { id: PRICE_LISTING_ID, pms: PRICE_LISTING_PMS, dateFrom, dateTo, reason: false },
          { id: BCOM_LISTING_ID, pms: BCOM_LISTING_PMS, dateFrom, dateTo, reason: false },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('PriceLabs error:', res.status, text);
      return Response.json({ error: `PriceLabs returned ${res.status}` }, { status: 502 });
    }

    payload = await res.json();
  } catch (err) {
    console.error('PriceLabs fetch failed:', err);
    return Response.json({ error: 'Could not reach PriceLabs' }, { status: 502 });
  }

  if (!Array.isArray(payload)) {
    return Response.json({ error: 'Unexpected response from PriceLabs' }, { status: 502 });
  }

  const supabase = getSupabaseServer();
  const result = {};

  // ---------- 1. Precios ----------
  const priceEntry = payload.find((e) => e?.id === PRICE_LISTING_ID);
  const priceDays = priceEntry?.data;

  if (!Array.isArray(priceDays) || priceDays.length === 0) {
    return Response.json({ error: 'PriceLabs returned no pricing data' }, { status: 502 });
  }

  const priceRows = priceDays
    .filter((d) => d?.date && typeof d.price === 'number' && d.price > 0)
    .map((d) => ({
      date: d.date,
      price_cents: Math.round(d.price * 100),
      min_stay: typeof d.min_stay === 'number' && d.min_stay > 0 ? d.min_stay : 2,
      // Si estos campos faltaran, lo seguro es permitir: bloquear por error
      // cuesta reservas.
      check_in_allowed: d.check_in !== false,
      check_out_allowed: d.check_out !== false,
      synced_at: new Date().toISOString(),
    }));

  if (priceRows.length === 0) {
    return Response.json({ error: 'No usable pricing rows' }, { status: 502 });
  }

  const { error: priceError } = await supabase
    .from('daily_prices')
    .upsert(priceRows, { onConflict: 'date' });

  if (priceError) {
    console.error('daily_prices upsert failed:', priceError);
    return Response.json({ error: priceError.message }, { status: 500 });
  }

  result.prices = {
    ok: true,
    days: priceRows.length,
    from: priceRows[0].date,
    to: priceRows[priceRows.length - 1].date,
  };

  // ---------- 2. Disponibilidad de Booking.com ----------
  // Un fallo aquí no debe tumbar la actualización de precios, que ya se
  // guardó arriba. Si Booking.com no responde, el sitio se queda con la
  // disponibilidad de la corrida anterior en vez de quedarse sin ninguna.
  const bcomEntry = payload.find((e) => e?.id === BCOM_LISTING_ID);
  const bcomDays = bcomEntry?.data;

  if (Array.isArray(bcomDays) && bcomDays.length > 0) {
    const occupied = bcomDays
      .filter((d) => d?.date && (d.occupancy === 1 || d.unbookable === 1))
      .map((d) => ({ date: d.date, source: 'bcom' }));

    try {
      // Reemplazo completo de esta fuente, igual que hace /api/ical/sync con
      // airbnb y vrbo. Cada fuente solo toca sus propias filas.
      await supabase.from('blocked_dates').delete().eq('source', 'bcom');
      if (occupied.length) {
        await supabase.from('blocked_dates').insert(occupied);
      }
      result.bookingDotCom = { ok: true, blockedNights: occupied.length };
    } catch (err) {
      console.error('bcom blocked_dates write failed:', err);
      result.bookingDotCom = { ok: false, error: err.message };
    }
  } else {
    result.bookingDotCom = { ok: false, error: 'No availability data returned' };
  }

  return Response.json({ ok: true, ...result });
}
