'use client';

import { useState } from 'react';

export default function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, website }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setStatus('sent');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  return (
    <div className="section">
      <style>{`
        .contact-box {
          background: #fff;
          border: 1px solid rgba(187,142,101,0.18);
          border-radius: 3px;
          padding: 32px 34px;
        }
        .contact-box > p {
          margin: 0 0 24px;
          font-size: 14.5px;
          line-height: 1.7;
          color: #545454;
        }
        .contact-form { display: grid; gap: 12px; }
        .contact-form .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .contact-form input[type="text"],
        .contact-form input[type="email"],
        .contact-form textarea {
          width: 100%;
          box-sizing: border-box;
          background: #f4f3f1;
          border: 1px solid rgba(187,142,101,0.28);
          border-radius: 2px;
          padding: 12px 14px;
          font-size: 15px;
          font-family: inherit;
          color: #545454;
        }
        .contact-form textarea { min-height: 120px; resize: vertical; }
        .contact-form input:focus,
        .contact-form textarea:focus {
          outline: none; border-color: #bb8e65;
        }
        .contact-form .hp { position: absolute; left: -9999px; width: 1px; height: 1px; }
        .contact-send {
          justify-self: start;
          margin-top: 4px;
          background: #bb8e65; color: #fff;
          border: 1px solid #bb8e65; border-radius: 2px;
          padding: 13px 30px; cursor: pointer;
          font-size: 11.5px; font-weight: 600;
          letter-spacing: .14em; text-transform: uppercase;
          transition: opacity .2s;
        }
        .contact-send:disabled { opacity: .55; cursor: default; }
        .contact-note { margin: 4px 0 0; font-size: 13.5px; line-height: 1.6; }
        .contact-note.ok { color: #4a7a5c; }
        .contact-note.bad { color: #a4553f; }

        .contact-lines {
          display: flex; flex-wrap: wrap; gap: 14px 40px;
          margin-top: 26px; padding-top: 22px;
          border-top: 1px solid rgba(187,142,101,0.18);
        }
        .contact-line b {
          display: block; font-size: 10.5px; text-transform: uppercase;
          letter-spacing: .13em; color: #bb8e65; font-weight: 600; margin-bottom: 4px;
        }
        .contact-line a {
          font-size: 16px; color: #545454; text-decoration: none;
          border-bottom: 1px solid rgba(187,142,101,0.45); padding-bottom: 1px;
          transition: color .2s, border-color .2s;
        }
        .contact-line a:hover { color: #bb8e65; border-color: #bb8e65; }

        @media (max-width: 767px) {
          .contact-box { padding: 26px 22px; }
          .contact-form .row { grid-template-columns: 1fr; }
          .contact-lines { flex-direction: column; gap: 18px; }
          .contact-send { justify-self: stretch; text-align: center; }
        }
      `}</style>

      <h2>Get in Touch</h2>

      <div className="contact-box">
        <p>
          Questions about the house, the area, or your dates? Send us a note and
          we&apos;ll get back to you.
        </p>

        {status === 'sent' ? (
          <p className="contact-note ok">
            Thanks &mdash; your message is on its way. We&apos;ll reply by email soon.
          </p>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="row">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <textarea
              placeholder="How can we help? Let us know your dates if you have them."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />

            <input
              className="hp"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              aria-hidden="true"
            />

            {error && <p className="contact-note bad">{error}</p>}

            <button className="contact-send" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}

        <div className="contact-lines">
          <div className="contact-line">
            <b>Email</b>
            <a href="mailto:jkrealestate221@gmail.com">jkrealestate221@gmail.com</a>
          </div>
          <div className="contact-line">
            <b>Phone</b>
            <a href="tel:+13057332664">(305) 733-2664</a>
          </div>
        </div>
      </div>
    </div>
  );
}
