import { useState, useEffect } from "react";

import * as Shared from "../../shared";
import Poster from "../components/Poster";

type Props = Shared.ScreenProps["Show"];


function Show({ mediaCard, onGo, onBack }: Props) {
  const [showMeta, setShowMeta] = useState(false);
  const [seasons, setSeasons] = useState<Shared.SeasonTuple>(null);

  useEffect(() => {
    (async () => {
      try {
        const rval = (await (window as any).api?.listSeasonsAndEpisodes(mediaCard)) ?? [];
        mediaCard.numberOfEpisodesObtained = rval.numberOfEpisodesObtained;
        setSeasons(rval.seasons);
      } catch (e) {
        console.error("[Seasons] listSeasonsAndEpisodes failed:", e);
        setSeasons(null);
      }
    })();
  }, [mediaCard]);

  const determineCompletionStatusClassName = () => {
    switch(mediaCard.isComplete) {
      case "Y": return "meta-item status-Y";
      case "O": return "meta-item status-O";
      case "U": return "meta-item status-U";
      default:  return "meta-item status-U";
    }
  }
  
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
            <button className="btn primary" onClick={() => onGo(seasons)}>
              Go
            </button>
          </div>
          <div className="sel-desc">
            <p>{mediaCard?.overview ?? "No description available."}</p>
          </div>
          <div className="sel-meta">
            <button className="btn subtle" onClick={()=>setShowMeta(!showMeta)}>{showMeta ? "Close" : "Meta"}</button>
            {!showMeta ? null : (
            <div className="sel-meta-row">
              <span className="meta-item">{mediaCard.year}</span>
              <span className={determineCompletionStatusClassName()}>{Shared.completionStatusToText(mediaCard.completionStatus)}</span>
              <span className="meta-item">{mediaCard.numberOfEpisodesObtained}/{mediaCard.totalNumberOfEpisodes} episodes</span>
            </div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Show;