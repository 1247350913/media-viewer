import { useState } from "react";

import * as Shared from "../../shared";
import Poster from "../components/Poster";
import { handlePlay } from ".";

type Props = Shared.ScreenProps["Selection"];


function Selection({ mediaCard, onBack, onProfileClick }: Props) {
  const [showMeta, setShowMeta] = useState(false);

  return (!mediaCard ?
    (<div> No Media Card. Code Error. Refer to Admin.</div>):
    (
    <div className="screen-wrap selection-wrap">

      {/* Standard Header */}
      <div className="header-bar-wrap">
        <button className="back-button" onClick={onBack} aria-label="Back">←</button>
        <div></div>
        <button className="profile-button" title="Profile" onClick={onProfileClick}>
          <img src="../../public/default-profile-icon.png" alt="Profile Image" className="profile-icon"/>
        </button>
      </div>

      {/* Selection Main Screen */}
      <div className="selection-main-screen-wrap">

        {/* Poster */}
        <Poster path={mediaCard.posterPath} title={mediaCard.title} screenName={"Selection"}/>

        {/* Body */}
        <div className="selection-body">
          <div className="selection-title">{mediaCard?.title ?? "Untitled"}</div>
          <div className="selection-actions">
            <button className="action-button trailer-button selection-action-button" disabled={!mediaCard?.sampleFilePath}>
              Trailer
            </button>
            <button className="action-button play-button selection-action-button" onClick={() => handlePlay(mediaCard)} disabled={!mediaCard?.videoFilePath}>
              ▶ Play
            </button>
          </div>
          <div className="selection-overview">{mediaCard.overview ?? "No description available."}</div>
          <button className="selection-meta-button" onClick={()=>setShowMeta(!showMeta)}>{showMeta ? "Close" : "Meta"}</button>
          {!showMeta ? null : (
          <div className="meta-row">
            {mediaCard.year && <span className="meta-item">{mediaCard.year}</span>}
            {mediaCard.runtimeSeconds && <span className="meta-item">{Shared.formatHMM(mediaCard.runtimeSeconds)}</span>}
            {mediaCard.quality && <span className="meta-item">{Shared.pixelQualityToText(mediaCard.quality)}</span>}
          </div>
          )}
        </div>
      </div>
    </div>
    )
  );
}

export default Selection;