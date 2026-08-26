import { getSupabaseServer } from '../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

// GET /api/availability
//   -> { blockedDates: [...], pricing: {...}, cleaningFee, depositPercent }
//
// Este endpoint corre en el servidor, y por eso es el único lugar donde se
// pueden leer variables como CLEANING_FEE_USD. En un componente de navegador
// process.env solo funciona con nombres que empiezan con NEXT_PUBLIC_, así
// que ahí esas variables salen vacías y el sitio cae a sus valores de
// respaldo -- que fue exactamente por qué la limpieza se quedaba en $150 por
// más que se cambiara en Vercel.
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

  return Response.json({
    blockedDates,
    pricing,
    // Mismos valores que usa /api/checkout para cobrar. Salen de aquí para
    // que lo que ve el huésped y lo que se le cobra no puedan separarse.
    cleaningFee: Number(process.env.CLEANING_FEE_USD || 200),
    depositPercent: Number(process.env.DEPOSIT_PERCENT || 100),
  });
}
