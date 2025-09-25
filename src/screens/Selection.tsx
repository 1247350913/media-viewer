import type { ScreenProps } from "./";
import Poster from "../components/Poster";


type Props = ScreenProps["Selection"];

function Selection({ mediaCard, onBack }: Props) {

  async function handlePlay() {
    if (mediaCard.videoFilePath) { 
      await (window as any).api?.play(mediaCard.videoFilePath);
    } else { 
      console.warn("No video file path available to play.") 
    };
  }

  return (
    <div className="sel-wrap">
      <header className="sel-header">
        <button className="btn subtle" onClick={onBack} aria-label="Back">
          ← Back
        </button>
      </header>
      <div className="sel-grid">
        <div className="poster">
        {mediaCard.posterPath ? (
          <Poster path={mediaCard.posterPath} title={mediaCard.title} />
        ) : (
          <div className="poster-fallback" aria-hidden />
        )}
        </div>
        <div className="sel-body">
          <h1 className="sel-title">{mediaCard?.title ?? "Untitled"}</h1>
          {(mediaCard?.year || mediaCard?.runtimeMin) && (
            <div className="sel-meta">
              {mediaCard.year && <span>{mediaCard.year}</span>}
              {mediaCard.year && mediaCard.runtimeMin && <span className="dot">•</span>}
              {mediaCard.runtimeMin && <span>{mediaCard.runtimeMin} min</span>}
            </div>
          )}
          {mediaCard?.description && (
            <p className="sel-desc">{mediaCard.description}</p>
          )}
          {(mediaCard?.audio?.length || mediaCard?.subs?.length) && (
            <div className="sel-langs">
              {mediaCard.audio && mediaCard.audio.length > 0 && (
                <div className="lang-row">
                  <span className="label">Audio</span>
                  <div className="chips">
                    {mediaCard.audio.map((a) => (
                      <span className="chip" key={`a-${a}`}>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {mediaCard.subs && mediaCard.subs.length > 0 && (
                <div className="lang-row">
                  <span className="label">Subs</span>
                  <div className="chips">
                    {mediaCard.subs.map((s) => (
                      <span className="chip" key={`s-${s}`}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="sel-actions">
            <button className="btn primary" onClick={handlePlay} disabled={!mediaCard?.videoFilePath}>
              ▶ Play
            </button>
            <button className="btn" onClick={onBack}>
              Back
            </button>
            {/* Example extra button (non-functional shell) */}
            <button className="btn ghost" disabled>
              Trailer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Selection;