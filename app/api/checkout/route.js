import Stripe from 'stripe';
import { randomUUID } from 'crypto';
import { getSupabaseServer } from '../../../lib/supabaseClient';
import { evaluatePromo } from '../../../lib/promo';

// POST /api/checkout  { checkIn, checkOut, guestName, guestEmail, promoCode? }
//
// Creates a Stripe session (card authorized but NOT charged, see
// capture_method: 'manual') and a 'pending' booking. Dates are not blocked
// here but in the webhook, so an abandoned checkout doesn't hold nights.
//
// The price is calculated HERE, on the server, adding up daily_prices night
// by night. A total coming from the browser is never trusted: anyone can
// edit what their own browser sends, and accepting it would let the guest
// choose how much to pay.
export async function POST(request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await request.json();
  const { checkIn, checkOut, guestName, guestEmail, promoCode } = body;

  if (!checkIn || !checkOut || !guestName || !guestEmail) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const nights = Math.round(
    (new Date(checkOut + 'T00:00:00Z') - new Date(checkIn + 'T00:00:00Z')) / 86400000
  );
  if (nights <= 0) {
    return Response.json({ error: 'Check-out must be after check-in' }, { status: 400 });
  }

  // Booking window. The browser already greys out these dates in the
  // calendar, but it's checked again here: browser checks can be bypassed,
  // server checks can't.
  const windowMonths = Number(process.env.BOOKING_WINDOW_MONTHS || 12);
  const windowEnd = new Date();
  windowEnd.setMonth(windowEnd.getMonth() + windowMonths);
  if (checkOut > windowEnd.toISOString().slice(0, 10)) {
    return Response.json(
      {
        error: `We take bookings up to ${windowMonths} months ahead. Please choose earlier dates, or contact us directly for a longer lead time.`,
      },
      { status: 409 }
    );
  }

  const supabase = getSupabaseServer();

  // Double-booking guard: stop if any night in the range is already taken.
  const { data: blocked } = await supabase
    .from('blocked_dates')
    .select('date')
    .gte('date', checkIn)
    .lt('date', checkOut);
  if (blocked && blocked.length > 0) {
    return Response.json({ error: 'Those dates are no longer available' }, { status: 409 });
  }

  // Fetch up to checkOut INCLUSIVE: that date isn't a charged night, but we
  // need to know whether check-out is allowed that day.
  const { data: priceRows, error: priceError } = await supabase
    .from('daily_prices')
    .select('date, price_cents, min_stay, check_in_allowed, check_out_allowed')
    .gte('date', checkIn)
    .lte('date', checkOut);

  if (priceError) {
    console.error('daily_prices read failed:', priceError);
    return Response.json({ error: 'Could not price those dates right now' }, { status: 500 });
  }

  const byDate = new Map((priceRows || []).map((r) => [r.date, r]));

  // If any night is missing a price, stop. Making up a price or using a
  // default is worse than asking the guest to reach out: a pricing mistake in
  // high season costs hundreds of dollars per night.
  const nightKeys = [];
  const cursor = new Date(checkIn + 'T00:00:00Z');
  const end = new Date(checkOut + 'T00:00:00Z');
  while (cursor < end) {
    nightKeys.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const missing = nightKeys.filter((k) => !byDate.has(k));
  if (missing.length > 0) {
    console.error('Missing daily_prices for:', missing);
    return Response.json(
      { error: 'We could not price those dates. Please contact us and we will help directly.' },
      { status: 409 }
    );
  }

  const arrival = byDate.get(checkIn);
  const departure = byDate.get(checkOut);

  // Check-in and check-out rules. They come from PriceLabs and match Airbnb,
  // Vrbo and Booking.com, so the direct site can't be a back door around them.
  if (arrival && arrival.check_in_allowed === false) {
    return Response.json(
      { error: 'We are not able to start a stay on that date. Please pick another arrival day.' },
      { status: 409 }
    );
  }
  if (departure && departure.check_out_allowed === false) {
    return Response.json(
      { error: 'We are not able to end a stay on that date. Please pick another departure day.' },
      { status: 409 }
    );
  }

  const minStay = arrival?.min_stay || 2;
  if (nights < minStay) {
    return Response.json(
      { error: `Those dates require a minimum stay of ${minStay} nights.` },
      { status: 409 }
    );
  }

  const nightsSubtotalCents = nightKeys.reduce((sum, k) => sum + byDate.get(k).price_cents, 0);
  const cleaningFeeCents = Math.round(Number(process.env.CLEANING_FEE_USD || 200) * 100);

  // Discount code: recalculated here even if the browser already showed it.
  // It only lowers the nightly rate, never the cleaning fee. If the guest
  // entered a code that doesn't work, we tell them instead of silently
  // charging full price.
  let promo = null;
  if (promoCode && String(promoCode).trim()) {
    promo = await evaluatePromo(
      supabase,
      promoCode,
      nightKeys.map((k) => ({ date: k, price_cents: byDate.get(k).price_cents }))
    );
    if (!promo.ok) {
      return Response.json({ error: promo.message }, { status: 409 });
    }
  }
  const discountCents = promo ? promo.discountCents : 0;

  const totalCents = nightsSubtotalCents - discountCents + cleaningFeeCents;

  const depositPercent = Number(process.env.DEPOSIT_PERCENT || 100); // 100 = full payment
  const dueNowCents = Math.round((totalCents * depositPercent) / 100);

  const reviewToken = randomUUID();

  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      guest_name: guestName,
      guest_email: guestEmail,
      check_in: checkIn,
      check_out: checkOut,
      nights,
      amount_total_cents: totalCents,
      promo_code: promo ? promo.code : null,
      discount_cents: discountCents,
      status: 'pending',
      review_token: reviewToken,
    })
    .select()
    .single();

  if (insertError) {
    return Response.json({ error: insertError.message }, { status: 500 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: guestEmail,
    // Authorize only: the money is held but not charged until the host
    // approves (or released if they decline).
    payment_intent_data: { capture_method: 'manual' },
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: dueNowCents,
          product_data: {
            name: `${process.env.NEXT_PUBLIC_PROPERTY_NAME || 'Booking'}: ${checkIn} to ${checkOut}`,
            description:
              (depositPercent < 100
                ? `${depositPercent}% deposit, ${nights} night(s), balance due at check-in`
                : `${nights} night(s) plus cleaning, full payment`) +
              (promo ? `. Includes ${promo.code} discount of $${(discountCents / 100).toFixed(2)}` : ''),
          },
        },
        quantity: 1,
      },
    ],
    metadata: { booking_id: String(booking.id), promo_code: promo ? promo.code : '' },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/booking-confirmed?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?checkout=cancelled`,
  });

  await supabase.from('bookings').update({ stripe_session_id: session.id }).eq('id', booking.id);

  return Response.json({ url: session.url });
}
