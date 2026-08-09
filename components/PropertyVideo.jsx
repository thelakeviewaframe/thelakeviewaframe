export default function PropertyVideo() {
  return (
    <div className="section">
      <style>{`
        .lv-video-frame {
          position: relative;
          width: 100%;
          max-width: 300px;
          margin: 0 auto;
          aspect-ratio: 9 / 16;
          border-radius: 3px;
          overflow: hidden;
          background: #000;
          box-shadow: 0 6px 28px rgba(84, 84, 84, 0.18);
        }
        .lv-video-frame iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }
        .lv-video-caption {
          max-width: 400px;
          margin: 16px auto 0;
          text-align: center;
          font-size: 13.5px;
          line-height: 1.7;
          color: #9a9a9a;
        }
      `}</style>

      <h2>Video Tour</h2>

      <div className="lv-video-frame">
        <iframe
          src="https://www.youtube.com/embed/uhVNr1dka6g?rel=0&playsinline=1"
          title="The Lakeview A-Frame video tour"
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      <p className="lv-video-caption">
        A walk through the A-Frame &mdash; vaulted wood ceilings, accordion doors
        onto the deck, and the hot tub under the pines.
      </p>
    </div>
  );
}
