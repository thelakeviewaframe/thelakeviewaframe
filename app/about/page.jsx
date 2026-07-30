import Link from 'next/link';
import SiteNav from '../../components/SiteNav';

export default function AboutPage() {
  return (
    <main className="container">
      <style>{`
        .about-body { max-width: 640px; }
        .about-body p { line-height: 1.65; margin-bottom: 18px; }
        .about-photo {
          width: 200px; height: 200px; object-fit: cover;
          border-radius: 50%; display: block; margin: 26px 0 30px;
        }
        .about-cta {
          display: inline-block; background: #2f4f3e; color: #fff;
          padding: 12px 22px; border-radius: 8px;
          text-decoration: none; font-size: 15px; font-weight: 500;
        }
        .about-cta:hover { opacity: .9; }
        @media (max-width: 767px) {
          .about-photo { width: 150px; height: 150px; margin: 20px 0 24px; }
        }
      `}</style>

      <SiteNav />

      <h1 style={{ marginTop: 26 }}>About us</h1>
      <p className="subtitle">Koren &amp; Jess · Your hosts</p>

      <div className="about-body">
        <img className="about-photo" src="/photos/hosts.jpg" alt="Koren, Jess and family at the cabin" />

        <p>
          We moved to Colorado in 2018 and over the years we explored every corner of this
          beautiful state. No matter where our adventures took us, we always found ourselves
          returning to this special area. The charm of Rocky Mountain National Park, Winter Park
          Ski Resort, Grand Lake, and the incredible wildlife and natural beauty continually
          drew us back.
        </p>

        <p>
          Along the way, we developed a passion for real estate and helping others find places
          where they can create lasting memories with the people they love. In 2025, we finally
          purchased a home of our own here, with hopes of one day retiring in the place we&apos;ve
          grown to love so deeply.
        </p>

        <p>
          Please make yourself at home and enjoy your stay. Thank you for choosing to stay with
          us — we truly appreciate it and hope to welcome you back again soon. And if you have
          questions about owning a mountain home or vacation property of your own, we&apos;d be
          happy to help however we can.
        </p>

        <p style={{ marginTop: 30, marginBottom: 50 }}>
          <Link href="/" className="about-cta">Check availability</Link>
        </p>
      </div>
    </main>
  );
}
