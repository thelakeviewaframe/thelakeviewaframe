export default function BookingConfirmed() {
    return (
          <main className="container">
                <div className="section" style={{ textAlign: 'center', paddingTop: 60 }}>
                        <h1>Request received!</h1>
                        <p>
                                  Thanks for requesting to book directly. Your card has been authorized (not charged)
                                  and your dates are held while we review your request. You'll get an email as soon as
                                  it's approved -- that's the only time your card is actually charged.
                        </p>
                        <p><a href="/">Back to home</a></p>
                </div>
          </main>
        );
}
