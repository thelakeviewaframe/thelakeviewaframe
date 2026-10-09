// Discount codes (promo_codes and promo_blackouts tables in Supabase).
//
// Rules Jessica asked for:
//   1. The discount applies ONLY to the nightly rate. Never the cleaning fee.
//   2. A code can be limited to certain months (stay_months, e.g. WINTER10
//      = 12,1,2,3,4) and can have blackout dates (promo_blackouts: MLK,
//      Presidents' Day, spring break, Christmas, New Year's).
//   3. No expiration for now (empty valid_until = never expires).
//
// Checked night by night: nights outside the season or inside a blackout
// pay full price and the rest get the discount. If no night qualifies, the
// code is rejected with a clear message.
//
// To create, pause or change codes you do NOT need to touch this file:
// everything is managed from the tables in Supabase.

function nightIsEligible(promo, blackouts, night) {
  const month = Number(night.slice(5, 7));
  if (Array.isArray(promo.stay_months) && promo.stay_months.length > 0) {
    if (!promo.stay_months.map(Number).includes(month)) return false;
  }
  if (promo.stay_start && night < promo.stay_start) return false;
  if (promo.stay_end && night > promo.stay_end) return false;
  // Blackout dates are nights, and both ends are included.
  for (const b of blackouts) {
    if (night >= b.start_date && night <= b.end_date) return false;
  }
  return true;
}

// nightPrices: [{ date: 'YYYY-MM-DD', price_cents: 12345 }, ...] one per night.
// Returns { ok, code, label, percent, discountCents, eligibleNights, totalNights, message }.
export async function evaluatePromo(supabase, rawCode, nightPrices) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) return { ok: false, message: 'Please enter a code.' };
  if (!/^[A-Z0-9_-]{2,40}$/.test(code)) {
    return { ok: false, message: 'That code is not valid.' };
  }

  const { data: promo, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code)
    .maybeSingle();

  if (error) {
    console.error('promo_codes read failed:', error);
    return { ok: false, message: 'We could not check that code right now. Please try again.' };
  }
  if (!promo || !promo.active) {
    return { ok: false, message: 'That code is not valid.' };
  }

  // Today's date in Colorado time, so a code never expires early.
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' });
  if (promo.valid_until && today > promo.valid_until) {
    return { ok: false, message: 'That code has expired.' };
  }
  if (promo.max_uses && promo.times_used >= promo.max_uses) {
    return { ok: false, message: 'That code is no longer available.' };
  }

  const totalNights = nightPrices.length;
  if (promo.min_nights && totalNights < promo.min_nights) {
    return {
      ok: false,
      message: `That code requires a stay of at least ${promo.min_nights} nights.`,
    };
  }

  const { data: blackouts, error: blackoutError } = await supabase
    .from('promo_blackouts')
    .select('start_date, end_date')
    .eq('promo_code_id', promo.id);

  if (blackoutError) {
    console.error('promo_blackouts read failed:', blackoutError);
    return { ok: false, message: 'We could not check that code right now. Please try again.' };
  }

  let discountCents = 0;
  let eligibleNights = 0;
  for (const n of nightPrices) {
    if (nightIsEligible(promo, blackouts || [], n.date)) {
      eligibleNights += 1;
      discountCents += Math.round((n.price_cents * promo.discount_percent) / 100);
    }
  }

  if (eligibleNights === 0) {
    return { ok: false, message: 'That code does not apply to your dates.' };
  }

  let message = `${promo.discount_percent}% off your nightly rate.`;
  if (eligibleNights < totalNights) {
    message = `${promo.discount_percent}% off ${eligibleNights} of your ${totalNights} nights. The other nights fall outside this offer.`;
  }

  return {
    ok: true,
    code,
    label: promo.label,
    percent: promo.discount_percent,
    discountCents,
    eligibleNights,
    totalNights,
    message,
  };
}
