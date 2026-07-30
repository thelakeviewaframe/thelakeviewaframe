import Link from 'next/link';
import SiteNav from '../../components/SiteNav';

export default function AboutPage() {
  return (
    <main className="container">
      <SiteNav />

      <h1>About us</h1>
      <p className="subtitle">Koren &amp; Jess · Your hosts</p>

      <div style={{ maxWidth: 640 }}>
        <img
          src="/photos/hosts.jpg"
          alt="Koren and Jess"
          style={{
            width: 180, height: 180, objectFit: 'cover',
            borderRadius: '50%', display: 'block', marginBottom: 24,
          }}
        />

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

        <p style={{ marginTop: 28 }}>
          <Link
            href="/"
            style={{
              display: 'inline-block', background: '#2f4f3e', color: '#fff',
              padding: '11px 20px', borderRadius: 8, textDecoration: 'none', fontSize: 15,
            }}
          >
            Check availability
          </Link>
        </p>
      </div>
    </main>
  );
}
