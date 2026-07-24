import Stripe from 'stripe';
import { getSupabaseServer } from '../../../../lib/supabaseClient';
import { sendEmail } from '../../../../lib/email';

export const dynamic = 'force-dynamic';

// GET /api/booking/respond?token=...&action=approve|decline
// The one-click links from the "New booking request" email land here.
// No login - the random review_token in the link is the only credential,
// so anyone who has the email (i.e. the host) can act on it once.
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const action = searchParams.get('action');

  if (!token || !['approve', 'decline'].includes(action)) {
        return htmlResponse('Invalid link', 'This link is missing a token or a valid action.', 400);
  }

  const supabase = getSupabaseServer();
    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('review_token', token)
      .single();

  if (!booking) {
        return htmlResponse('Not found', 'No booking request matches this link.', 404);
  }

  if (booking.status !== 'pending_review') {
        return htmlResponse(
                'Already handled',
                `This request was already marked "${booking.status}" - no further action was taken.`,
                200
              );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  if (action === 'approve') {
        try {
                await stripe.paymentIntents.capture(booking.stripe_payment_intent_id);
        } catch (err) {
                return htmlResponse('Stripe error', `Could not capture payment: ${err.message}`, 500);
        }

      await supabase
          .from('bookings')
          .update({ status: 'confirmed', amount_paid_cents: booking.amount_total_cents })
          .eq('id', booking.id);

      await sendEmail({
              to: booking.guest_email,
              subject: `You're booked! ${booking.check_in} to ${booking.check_out}`,
              html: `
                      <p>Hi ${booking.guest_name},</p>
                              <p>Your booking is confirmed for ${booking.check_in} &rarr; ${booking.check_out}
                                      (${booking.nights} night(s)). Your card has been charged $${(booking.amount_total_cents / 100).toFixed(2)}.</p>
                                              <p>See you soon!</p>
                                                    `,
      });

      return htmlResponse(
              'Booking approved',
              `${booking.guest_name}'s card was charged $${(booking.amount_total_cents / 100).toFixed(2)} and they've been emailed a confirmation.`,
              200
            );
  }

  // action === 'decline'
  try {
        await stripe.paymentIntents.cancel(booking.stripe_payment_intent_id);
  } catch (err) {
        return htmlResponse('Stripe error', `Could not release the card hold: ${err.message}`, 500);
  }

  await supabase.from('bookings').update({ status: 'declined' }).eq('id', booking.id);
    await supabase.from('blocked_dates').delete().eq('booking_id', booking.id);

  await sendEmail({
        to: booking.guest_email,
        subject: `Update on your request for ${booking.check_in} to ${booking.check_out}`,
        html: `
              <p>Hi ${booking.guest_name},</p>
                    <p>Unfortunately we're not able to accommodate ${booking.check_in} &rarr; ${booking.check_out}.
                          Your card was never charged - the authorization hold has been released.</p>
                              `,
  });

  return htmlResponse(
        'Booking declined',
        `The hold was released - ${booking.guest_name}'s card was never charged, and the dates are open again.`,
        200
      );
}

function htmlResponse(title, message, status) {
    return new Response(
          `<!doctype html><html><body style="font-family:sans-serif;max-width:480px;margin:80px auto;text-align:center;">
                <h2>${title}</h2><p>${message}</p>
                    </body></html>`,
  { status, headers: { 'Content-Type': 'text/html' } }
        );
}
