import { useState } from "react";

import * as Shared from "../../shared";
import Poster from "../components/Poster";
import { handlePlay } from ".";

type Props = Shared.ScreenProps["Selection"];


function Selection({ mediaCard, onBack }: Props) {
  const [showMeta, setShowMeta] = useState(false);
  
  return (
    <div className="sel-wrap">
      <header className="sel-header">
        <button className="btn subtle" onClick={onBack} aria-label="Back">
          ← Back
        </button>
      </header>
      <div className="sel-grid">
        {mediaCard.posterPath ? (
          <Poster path={mediaCard.posterPath} title={mediaCard.title} screenName={"Selection"}/>
        ) : (
          <div className="sel-poster-fallback" aria-hidden />
        )}
        <div className="sel-body">
          <h1 className="sel-title">{mediaCard?.title ?? "Untitled"}</h1>
          <div className="sel-actions">
            <button className="btn ghost" disabled={!mediaCard?.sampleFilePath}>
              Trailer
            </button>
            <button className="btn primary" onClick={() => handlePlay(mediaCard)} disabled={!mediaCard?.videoFilePath}>
              ▶ Play
            </button>
          </div>
          <div className="sel-desc">{mediaCard.overview ?? "No description available."}</div>
          <div className="sel-meta">
            <button className="btn subtle" onClick={()=>setShowMeta(!showMeta)}>{showMeta ? "Close" : "Meta"}</button>
            {!showMeta ? null : (<div>
              {mediaCard.year && <span>{mediaCard.year}</span>}
              {mediaCard.runtimeSeconds && <span >{Shared.formatHHMMSS(mediaCard.runtimeSeconds)}</span>}
              {mediaCard.quality && <span>{Shared.pixelQualityToText(mediaCard.quality)}p</span>}
            </div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Selection;