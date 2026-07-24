import Stripe from 'stripe';
import { getSupabaseServer } from '../../../lib/supabaseClient';

// POST /api/checkout  { checkIn, checkOut, guestName, guestEmail }
// Creates a Stripe Checkout session and a 'pending' booking row.
// Dates are NOT blocked yet — that only happens in the webhook once payment
// actually succeeds, so an abandoned checkout doesn't lock out other guests.
export async function POST(request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await request.json();
  const { checkIn, checkOut, guestName, guestEmail } = body;

  if (!checkIn || !checkOut || !guestName || !guestEmail) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const nights = Math.round(
    (new Date(checkOut + 'T00:00:00Z') - new Date(checkIn + 'T00:00:00Z')) / 86400000
  );
  if (nights <= 0) {
    return Response.json({ error: 'Check-out must be after check-in' }, { status: 400 });
  }

  const nightlyRate = Number(process.env.NIGHTLY_RATE_USD || 350);
  const cleaningFee = Number(process.env.CLEANING_FEE_USD || 150);
  const depositPercent = Number(process.env.DEPOSIT_PERCENT || 100); // 100 = pay in full
  const totalCents = Math.round((nights * nightlyRate + cleaningFee) * 100);
  const dueNowCents = Math.round((totalCents * depositPercent) / 100);

  const supabase = getSupabaseServer();

  // Double-booking guard: refuse if any night in range is already blocked.
  const { data: blocked } = await supabase
    .from('blocked_dates')
    .select('date')
    .gte('date', checkIn)
    .lt('date', checkOut);
  if (blocked && blocked.length > 0) {
    return Response.json({ error: 'Those dates are no longer available' }, { status: 409 });
  }

  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      guest_name: guestName,
      guest_email: guestEmail,
      check_in: checkIn,
      check_out: checkOut,
      nights,
      amount_total_cents: totalCents,
      status: 'pending',
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
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: dueNowCents,
          product_data: {
            name: `${process.env.NEXT_PUBLIC_PROPERTY_NAME || 'Booking'}: ${checkIn} to ${checkOut}`,
            description:
              depositPercent < 100
                ? `${depositPercent}% deposit — ${nights} night(s), balance due at check-in`
                : `${nights} night(s), full payment`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { booking_id: String(booking.id) },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/booking-confirmed?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?checkout=cancelled`,
  });

  await supabase.from('bookings').update({ stripe_session_id: session.id }).eq('id', booking.id);

  return Response.json({ url: session.url });
}
