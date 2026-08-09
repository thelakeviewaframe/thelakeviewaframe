export default function PropertyVideo() {
  return (
    <section className="lv-video-section">
      <style dangerouslySetInnerHTML={{ __html: `
        .lv-video-section {
          padding: 72px 20px;
        }
        .lv-video-inner {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 36px;
        }
        .lv-video-copy {
          text-align: center;
          max-width: 460px;
        }
        .lv-video-eyebrow {
          display: block;
          color: #bb8e65;
          font-size: 13px;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .lv-video-copy h2 {
          color: #545454;
          font-size: 34px;
          line-height: 1.2;
          margin: 0 0 16px;
          font-weight: 500;
        }
        .lv-video-copy p {
          color: #545454;
          font-size: 17px;
          line-height: 1.7;
          margin: 0;
          opacity: 0.85;
        }
        .lv-video-frame {
          position: relative;
          width: 100%;
          max-width: 320px;
          aspect-ratio: 9 / 16;
          border-radius: 20px;
          overflow: hidden;
          background: #000;
          box-shadow: 0 14px 40px rgba(84, 84, 84, 0.22);
          flex-shrink: 0;
        }
        .lv-video-frame iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }
        @media (min-width: 900px) {
          .lv-video-inner {
            flex-direction: row;
            justify-content: center;
            align-items: center;
            gap: 64px;
          }
          .lv-video-copy {
            text-align: left;
          }
        }
      ` }} />
      <div className="lv-video-inner">
        <div className="lv-video-copy">
          <span className="lv-video-eyebrow">Video Tour</span>
          <h2>Step inside the A-Frame</h2>
          <p>
            Soaring wood ceilings, accordion doors that open to the deck, and a
            private hot tub under the pines &mdash; eight minutes from the west
            entrance of Rocky Mountain National Park.
          </p>
        </div>
        <div className="lv-video-frame">
          <iframe
            src="https://www.youtube.com/embed/uhVNr1dka6g?rel=0&playsinline=1"
            title="The Lakeview A-Frame video tour"
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
