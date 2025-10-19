import { useState } from "react";

import type { ScreenName, ScreenProps } from "../../types";
import { HeaderBar, Poster, ActionButtonsRow } from "../../components";
import { formatHMM, pixelQualityToText } from "../../lib";

const screenName: ScreenName = "Selection"
type Props = ScreenProps[typeof screenName];


function Selection({ mediaCard, onBack, onProfileClick }: Props) {
  const [showMeta, setShowMeta] = useState(false);

  return (!mediaCard ?
    (<div> No Media Card. Code Error. Refer to Admin.</div>):
    (
    <div className="screen--wrap selection--wrap">
      {/* Standard Header */}
      <HeaderBar screenName={screenName} onBack={onBack} onProfileClick={onProfileClick}/>

      {/* Selection Main Screen */}
      <div className="selection-main-screen--wrap">

        {/* Left Side - Poster */}
        <Poster path={mediaCard.posterPath} title={mediaCard.title} screenName={screenName}/>

        {/* Right Side - Body */}
        <div className="selection__body">
          <h1 className="selection__title">{mediaCard?.title ?? "Untitled"}</h1>
          
          <ActionButtonsRow screenName={screenName} mediaCard={mediaCard} />
          
          <p className="selection__overview">{mediaCard.overview ?? "No description available."}</p>

          <button 
            className={`btn btn--md btn--meta selection__meta-button${showMeta ? " is-active" : ""}`}
            onClick={()=>setShowMeta(!showMeta)}>{showMeta ? "Close" : "Meta"}
          </button>
          
          {!showMeta ? null : (
          <div className="meta-row--wrap">
            {mediaCard.year && <span className="meta-row__item">{mediaCard.year}</span>}
            {mediaCard.runtimeSeconds && <span className="meta-row__item">{formatHMM(mediaCard.runtimeSeconds)}</span>}
            {mediaCard.quality && <span className="meta-row__item">{pixelQualityToText(mediaCard.quality)}</span>}
          </div>
          )}
        </div>

      </div>  
    </div>
    )
  );
}

export default Selection;