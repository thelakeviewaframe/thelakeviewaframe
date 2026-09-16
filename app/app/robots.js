const SITE_URL = 'https://www.thelakeviewaframe.com';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/booking-confirmed'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
