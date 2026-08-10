export default function ContactSection() {
  return (
    <div className="section">
      <style>{`
        .contact-box {
          background: #fff;
          border: 1px solid rgba(187,142,101,0.18);
          border-radius: 3px;
          padding: 32px 34px;
        }
        .contact-box p {
          margin: 0 0 22px;
          font-size: 14.5px;
          line-height: 1.7;
          color: #545454;
        }
        .contact-lines {
          display: flex;
          flex-wrap: wrap;
          gap: 14px 40px;
        }
        .contact-line b {
          display: block;
          font-size: 10.5px;
          text-transform: uppercase;
          letter-spacing: .13em;
          color: #bb8e65;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .contact-line a {
          font-size: 16px;
          color: #545454;
          text-decoration: none;
          border-bottom: 1px solid rgba(187,142,101,0.45);
          padding-bottom: 1px;
          transition: color .2s, border-color .2s;
        }
        .contact-line a:hover { color: #bb8e65; border-color: #bb8e65; }
        @media (max-width: 767px) {
          .contact-box { padding: 26px 22px; }
          .contact-lines { flex-direction: column; gap: 18px; }
        }
      `}</style>

      <h2>Get in Touch</h2>

      <div className="contact-box">
        <p>
          Questions about the house, the area, or your dates? Send us a note or give
          us a call &mdash; we&apos;re happy to help you plan your stay.
        </p>

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
