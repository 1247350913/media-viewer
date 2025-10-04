import { useState, useEffect } from "react";

import * as Shared from "../../shared";
import Poster from "../components/Poster";

type Props = Shared.ScreenProps["Show"];


function Show({ mediaCard, onGo, onBack }: Props) {
  const [showMeta, setShowMeta] = useState(false);
  const [seasons, setSeasons] = useState<Shared.SeasonTuple>(null);

  useEffect(() => {
    (async () => {
      if (!mediaCard) { return }
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
    if (!mediaCard) {return }
    switch(mediaCard.completionStatus) {
      case "Y": return "meta-item status-Y";
      case "O": return "meta-item status-O";
      case "U": return "meta-item status-U";
      default:  return "meta-item status-U";
    }
  }

  return (!mediaCard ?
    (<div> No Media Card. Code Error. Refer to Admin.</div>):
    (
    <div className="screen-wrap show-wrap">

      {/* Standard Header */}
      <div className="header-bar-wrap">
        <button className="back-button" onClick={onBack} aria-label="Back">←</button>
        <div className="profile-wrap" title="Profile">
          <img src="../../public/default-profile-icon.png" alt="Profile Image" className="profile-icon"/>
        </div>
      </div>

      {/* Left Side */}
      <div className="show-main-screen">
        <Poster path={mediaCard.posterPath} title={mediaCard.title} screenName={"Selection"}/>

        {/* Right Side */}
        <div className="show-body">
          <div className="show-title">{mediaCard?.title ?? "Untitled"}</div>
          <div className="show-actions">
            <button className="trailer-button" disabled={!mediaCard?.sampleFilePath}>
              Trailer
            </button>
            <button className="go-button" onClick={() => onGo(seasons)}>
              Go
            </button>
          </div>
          <div className="show-overview">
            <p>{mediaCard?.overview ?? "No description available."}</p>
          </div>
          <button className="meta-button" onClick={()=>setShowMeta(!showMeta)}>{showMeta ? "Close" : "Meta"}</button>
          {!showMeta ? null : (
          <div className="meta-wrap">
            <span className="meta-item">{mediaCard.year}</span>
            <span className={determineCompletionStatusClassName()}>{Shared.completionStatusToText(mediaCard.completionStatus)}</span>
            <span className="meta-item">{mediaCard.numberOfEpisodesObtained}/{mediaCard.totalNumberOfEpisodes} episodes</span>
          </div>
          )}
        </div>
      </div>
    </div>
    )
  )
}

export default Show;