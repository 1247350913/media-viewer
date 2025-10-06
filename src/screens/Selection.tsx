import { useState } from "react";

import * as Shared from "../../shared";
import Poster from "../components/Poster";
import HeaderBar from "../components/HeaderBar";
import { handlePlay } from ".";

const screenName = "Selection"
type Props = Shared.ScreenProps["Selection"];


function Selection({ mediaCard, onBack, onProfileClick }: Props) {
  const [showMeta, setShowMeta] = useState(false);

  return (!mediaCard ?
    (<div> No Media Card. Code Error. Refer to Admin.</div>):
    (
    <div className="screen-wrap selection-wrap">

      {/* Standard Header */}
      <HeaderBar screenName={screenName} onBack={onBack} onProfileClick={onProfileClick}/>

      {/* Selection Main Screen */}
      <div className="selection-main-screen-wrap">

        {/* Poster */}
        <Poster path={mediaCard.posterPath} title={mediaCard.title} screenName={"Selection"}/>

        {/* Body */}
        <div className="selection-body">
          <div className="selection-title">{mediaCard?.title ?? "Untitled"}</div>
          <div className="selection-actions">
            <button className="trailer-button" disabled={!mediaCard?.sampleFilePath}>
              Trailer
            </button>
            <button className="play-button" onClick={() => handlePlay(mediaCard)} disabled={!mediaCard?.videoFilePath}>
              ▶ Play
            </button>
          </div>
          <div className="selection-overview">{mediaCard.overview ?? "No description available."}</div>
          <button className="meta-button" onClick={()=>setShowMeta(!showMeta)}>{showMeta ? "Close" : "Meta"}</button>
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