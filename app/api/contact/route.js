import { sendEmail } from '../../../lib/email';

export const dynamic = 'force-dynamic';

// POST /api/contact  { name, email, message, website }
// Sends the message to HOST_EMAIL via Resend. "website" is a hidden honeypot
// field: real people leave it empty, bots fill it in.

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(req) {
  try {
    const body = await req.json();
    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const message = (body.message || '').trim();

    // Honeypot: pretend it worked, send nothing.
    if (body.website) {
      return Response.json({ ok: true });
    }

    if (!name || !email || !message) {
      return Response.json(
        { error: 'Please fill in your name, email and message.' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { error: 'That email address does not look right.' },
        { status: 400 }
      );
    }

    if (message.length > 3000) {
      return Response.json(
        { error: 'Please keep your message under 3000 characters.' },
        { status: 400 }
      );
    }

    const to = process.env.HOST_EMAIL;
    if (!to) {
      console.error('Contact form: HOST_EMAIL is not set.');
      return Response.json(
        { error: 'We could not send your message. Please email us directly.' },
        { status: 500 }
      );
    }

    const html = `
      <h2 style="font-family:sans-serif;">New message from the website</h2>
      <p style="font-family:sans-serif;"><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p style="font-family:sans-serif;"><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p style="font-family:sans-serif;"><strong>Message:</strong></p>
      <p style="font-family:sans-serif;white-space:pre-wrap;">${escapeHtml(message)}</p>
      <hr />
      <p style="font-family:sans-serif;font-size:12px;color:#777;">
        Reply directly to ${escapeHtml(email)} to answer this guest.
      </p>
    `;

    const result = await sendEmail({
      to,
      subject: `Website message from ${name}`,
      html,
    });

    if (!result.ok) {
      return Response.json(
        { error: 'We could not send your message. Please email us directly.' },
        { status: 500 }
      );
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return Response.json(
      { error: 'Something went wrong. Please email us directly.' },
      { status: 500 }
    );
  }
}
