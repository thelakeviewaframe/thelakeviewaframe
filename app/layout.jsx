import './globals.css';

const SITE_TITLE = 'Lakeview A-Frame with Hot Tub near RMNP | Grand Lake, CO';
const SITE_DESCRIPTION =
  'Book direct: renovated A-frame cabin in Grand Lake, CO. Sleeps 8, private hot tub, dog-friendly, 8 minutes from Rocky Mountain National Park.';

export const metadata = {
  metadataBase: new URL('https://www.thelakeviewaframe.com'),
  title: {
    default: SITE_TITLE,
    template: '%s | Lakeview A-Frame, Grand Lake, CO',
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: 'Lakeview A-Frame',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/photos/hero-1.jpg',
        width: 1448,
        height: 965,
        alt: 'Lakeview A-Frame cabin in Grand Lake, Colorado',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/photos/hero-1.jpg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
