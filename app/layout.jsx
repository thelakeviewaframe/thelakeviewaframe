import './globals.css';

export const metadata = {
  title: 'Lakeview A-Frame | Grand Lake, CO',
  description: 'Book the Lakeview A-Frame directly — no platform fees.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
