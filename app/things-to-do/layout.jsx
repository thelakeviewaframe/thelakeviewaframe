const PAGE_TITLE = 'Things to Do in Grand Lake, CO | Lakeview A-Frame';
const PAGE_DESCRIPTION =
  'Things to do near the Lakeview A-Frame in Grand Lake, Colorado: Rocky Mountain National Park, boating, beaches, snowmobiling, skiing and more, in every season.';

export const metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/things-to-do' },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: '/things-to-do',
    siteName: 'Lakeview A-Frame',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/photos/rmnp-peaks.jpg',
        alt: 'Snow-lined peaks above pine forest in Rocky Mountain National Park',
      },
    ],
  },
};

export default function ThingsToDoLayout({ children }) {
  return children;
}
