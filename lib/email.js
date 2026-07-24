// Minimal Resend (https://resend.com) wrapper - no SDK needed, just a fetch
// call to their REST API. Requires RESEND_API_KEY in env vars.
//
// RESEND_FROM_EMAIL defaults to Resend's shared test sender, which only
// delivers to the email you signed up with. Once you verify your own domain
// in Resend (Domains > Add Domain), set RESEND_FROM_EMAIL to an address on
// that domain (e.g. bookings@thelakeviewaframe.com) so guest emails work too.
export async function sendEmail({ to, subject, html }) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
          console.error('sendEmail skipped: RESEND_API_KEY is not set.');
          return { ok: false, error: 'RESEND_API_KEY not configured' };
    }

  const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
        const errText = await res.text();
        console.error('sendEmail failed:', res.status, errText);
        return { ok: false, error: errText };
  }

  return { ok: true };
}
