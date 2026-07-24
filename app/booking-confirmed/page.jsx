export default function BookingConfirmed() {
  return (
    <main className="container">
      <div className="section" style={{ textAlign: 'center', paddingTop: 60 }}>
        <h1>You're booked!</h1>
        <p>
          Thanks for booking directly — a confirmation email is on its way from Stripe.
          Your dates are now reserved and blocked across all calendars.
        </p>
        <p><a href="/">Back to home</a></p>
      </div>
    </main>
  );
}
