import { getSupabaseServer } from '../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

// GET /api/availability
//   -> { blockedDates: ["2026-08-01", ...],
//        pricing: { "2026-12-25": { price, minStay, checkIn, checkOut }, ... } }
//
// El calendario usa blockedDates para apagar noches ocupadas, y pricing para
// mostrar el precio de cada noche.
//
// pricing sale de daily_prices, que llena /api/pricing/sync una vez al día
// desde PriceLabs. Si esa tarea falla, este endpoint devuelve pricing vacío
// y el sitio cae de vuelta a la tarifa fija — feo, pero no se rompe.
export async function GET() {
  const supabase = getSupabaseServer();

  const [blockedRes, pricesRes] = await Promise.all([
    supabase.from('blocked_dates').select('date'),
    supabase
      .from('daily_prices')
      .select('date, price_cents, min_stay, check_in_allowed, check_out_allowed'),
  ]);

  if (blockedRes.error) {
    return Response.json({ error: blockedRes.error.message }, { status: 500 });
  }

  const blockedDates = Array.from(new Set((blockedRes.data || []).map((r) => r.date)));

  // Un fallo al leer precios no debe tumbar el calendario: sin precios el
  // sitio sigue mostrando disponibilidad, que es lo mínimo indispensable.
  const pricing = {};
  if (!pricesRes.error) {
    for (const row of pricesRes.data || []) {
      pricing[row.date] = {
        price: row.price_cents / 100,
        minStay: row.min_stay,
        checkIn: row.check_in_allowed,
        checkOut: row.check_out_allowed,
      };
    }
  } else {
    console.error('daily_prices read failed:', pricesRes.error);
  }

  return Response.json({ blockedDates, pricing });
}
