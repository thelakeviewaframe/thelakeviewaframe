import BookingCard from '../components/BookingCard';

// ---- PLACEHOLDER CONTENT ----
// Swap these values (and the /public photos) for the real copy, photos, and
// amenities from your Airbnb listing. Keeping it all at the top like this
// makes it a five-minute edit instead of hunting through the page.
const PROPERTY = {
  name: 'Lakeview A-Frame',
  location: 'Grand Lake, Colorado',
  tagline: 'A classic A-frame cabin steps from the water, with mountain views from every window.',
  description: `Wake up to lake views in this cozy, fully-renovated A-frame cabin on Grand Lake.
Vaulted wood-beam ceilings, a wraparound deck, and a private dock make this the perfect basecamp
for a mountain getaway — 10 minutes from Rocky Mountain National Park's west entrance.`,
  amenities: [
    'Lake access & private dock',
    'Hot tub',
    'Wood-burning fireplace',
    'Full kitchen',
    'Free WiFi',
    'Washer & dryer',
    'Parking for 2 cars',
    'Pet friendly',
  ],
  photos: [
    '/photos/hero-1.jpg',
    '/photos/hero-2.jpg',
    '/photos/hero-3.jpg',
  ],
};

export default function HomePage() {
  const nightlyRate = Number(process.env.NIGHTLY_RATE_USD || 350);
  const cleaningFee = Number(process.env.CLEANING_FEE_USD || 150);
  const depositPercent = Number(process.env.DEPOSIT_PERCENT || 100);

  return (
    <main className="container">
      <div className="hero">
        <img src={PROPERTY.photos[0]} alt={PROPERTY.name} />
        <div className="hero-side">
          <img src={PROPERTY.photos[1]} alt="" />
          <img src={PROPERTY.photos[2]} alt="" />
        </div>
      </div>

      <h1>{PROPERTY.name}</h1>
      <p className="subtitle">{PROPERTY.location} · {PROPERTY.tagline}</p>

      <div className="layout">
        <div>
          <div className="section">
            <h2>About this place</h2>
            <p>{PROPERTY.description}</p>
          </div>
          <div className="section">
            <h2>Amenities</h2>
            <ul className="amenities">
              {PROPERTY.amenities.map((a) => <li key={a}>{a}</li>)}
            </ul>
          </div>
        </div>

        <BookingCard
          nightlyRate={nightlyRate}
          cleaningFee={cleaningFee}
          depositPercent={depositPercent}
          propertyName={PROPERTY.name}
        />
      </div>
    </main>
  );
}
