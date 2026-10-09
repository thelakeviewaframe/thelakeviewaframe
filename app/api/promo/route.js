import { getSupabaseServer } from '../../../lib/supabaseClient';
import { evaluatePromo } from '../../../lib/promo';

export const dynamic = 'force-dynamic';

// POST /api/promo  { code, checkIn, checkOut }
//
// Only used to show the guest how much they save before paying.
// The real discount is recalculated by /api/checkout on the server, so nobody
// can invent a discount by editing what their browser sends.
export async function POST(request) {
  const { code, checkIn, checkOut } = await request.json();

  if (!code || !checkIn || !checkOut || checkOut <= checkIn) {
    return Response.json({ ok: false, message: 'Please pick your dates first.' }, { status: 400 });
  }

  const supabase = getSupabaseServer();

  const { data: priceRows, error } = await supabase
    .from('daily_prices')
    .select('date, price_cents')
    .gte('date', checkIn)
    .lt('date', checkOut);

  if (error) {
    console.error('daily_prices read failed:', error);
    return Response.json(
      { ok: false, message: 'We could not check that code right now. Please try again.' },
      { status: 500 }
    );
  }

  const result = await evaluatePromo(supabase, code, priceRows || []);
  return Response.json(result, { status: result.ok ? 200 : 409 });
}
