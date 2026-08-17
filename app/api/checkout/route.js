import Stripe from 'stripe';
import { randomUUID } from 'crypto';
import { getSupabaseServer } from '../../../lib/supabaseClient';

// POST /api/checkout  { checkIn, checkOut, guestName, guestEmail }
//
// Crea una sesión de Stripe (tarjeta autorizada pero NO cobrada, ver
// capture_method: 'manual') y una reserva 'pending'. Las fechas no se
// bloquean aquí sino en el webhook, para que un checkout abandonado no
// aparte noches.
//
// El precio se calcula AQUÍ, en el servidor, sumando daily_prices noche por
// noche. Nunca se confía en un total que venga del navegador: cualquiera
// puede editar lo que manda su propio navegador, y aceptarlo sería dejar que
// el huésped elija cuánto pagar.
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

  const supabase = getSupabaseServer();

  // Guarda contra doble reserva: si alguna noche del rango ya está apartada.
  const { data: blocked } = await supabase
    .from('blocked_dates')
    .select('date')
    .gte('date', checkIn)
    .lt('date', checkOut);
  if (blocked && blocked.length > 0) {
    return Response.json({ error: 'Those dates are no longer available' }, { status: 409 });
  }

  // Traemos hasta checkOut INCLUSIVE: esa fecha no es una noche que se cobre,
  // pero sí necesitamos saber si ese día se permite salir.
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

  // Si falta el precio de alguna noche, paramos. Inventar un precio o usar
  // uno por defecto es peor que pedirle al huésped que escriba: un error de
  // precio en temporada alta cuesta cientos de dólares por noche.
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

  // Reglas de entrada y salida. Vienen de PriceLabs y son las mismas que
  // rigen en Airbnb, Vrbo y Booking.com, así que el sitio directo no puede
  // ser la puerta trasera que las evade.
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
  const totalCents = nightsSubtotalCents + cleaningFeeCents;

  const depositPercent = Number(process.env.DEPOSIT_PERCENT || 100); // 100 = pago completo
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
    // Solo autoriza: el dinero se aparta pero no se cobra hasta que el
    // anfitrión aprueba (o se libera si rechaza).
    payment_intent_data: { capture_method: 'manual' },
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: dueNowCents,
          product_data: {
            name: `${process.env.NEXT_PUBLIC_PROPERTY_NAME || 'Booking'}: ${checkIn} to ${checkOut}`,
            description:
              depositPercent < 100
                ? `${depositPercent}% deposit, ${nights} night(s), balance due at check-in`
                : `${nights} night(s) plus cleaning, full payment`,
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
