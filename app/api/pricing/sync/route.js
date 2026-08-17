import { getSupabaseServer } from '../../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

// GET /api/pricing/sync
// Trae los precios de PriceLabs y los guarda en daily_prices.
// Corre una vez al día por cron (ver vercel.json). PriceLabs recalcula
// cada 24 horas, así que no tiene sentido pedirlos más seguido.
//
// El sitio NUNCA le pregunta a PriceLabs en el momento de reservar: si su
// servidor tarda o falla, se caería el checkout. Por eso guardamos aquí y
// el sitio lee de su propia base de datos.

// Los tres listings de la A-Frame comparten precio (mismo grupo en
// PriceLabs), así que basta con preguntar por uno. Usamos el de Airbnb.
const LISTING_ID = process.env.PRICELABS_LISTING_ID || '1675528160694917343';
const LISTING_PMS = process.env.PRICELABS_PMS || 'airbnb';

// Cuántos días hacia adelante traer. 18 meses cubre de sobra la ventana
// de reserva de las OTAs.
const DAYS_AHEAD = 550;

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

export async function GET(request) {
  // Mismo esquema de protección que /api/ical/sync.
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
          {
            id: LISTING_ID,
            pms: LISTING_PMS,
            dateFrom: toISODate(today),
            dateTo: toISODate(end),
            // reason trae el desglose de por qué ese precio. No lo
            // necesitamos y hace la respuesta enorme, así que va apagado.
            reason: false,
          },
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

  const days = payload?.[0]?.data;
  if (!Array.isArray(days) || days.length === 0) {
    return Response.json({ error: 'PriceLabs returned no pricing data' }, { status: 502 });
  }

  const rows = days
    .filter((d) => d?.date && typeof d.price === 'number' && d.price > 0)
    .map((d) => ({
      date: d.date,
      price_cents: Math.round(d.price * 100),
      min_stay: typeof d.min_stay === 'number' && d.min_stay > 0 ? d.min_stay : 2,
      // check_in / check_out vienen como booleanos. Si faltaran, lo seguro
      // es permitir: bloquear por accidente cuesta reservas.
      check_in_allowed: d.check_in !== false,
      check_out_allowed: d.check_out !== false,
      synced_at: new Date().toISOString(),
    }));

  if (rows.length === 0) {
    return Response.json({ error: 'No usable rows in PriceLabs response' }, { status: 502 });
  }

  const supabase = getSupabaseServer();
  const { error } = await supabase.from('daily_prices').upsert(rows, { onConflict: 'date' });

  if (error) {
    console.error('daily_prices upsert failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    ok: true,
    daysStored: rows.length,
    from: rows[0].date,
    to: rows[rows.length - 1].date,
  });
}
