import { useState, useEffect } from "react";

import * as Shared from "../../shared";
import * as Components from "../components";

const screenName: Shared.ScreenName = "Show"
type Props = Shared.ScreenProps[typeof screenName];


function Show({ mediaCard, onGo, onBack, onProfileClick }: Props) {
  const [showMeta, setShowMeta] = useState(true);
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
    return mediaCard.completionStatus?? "U"
  }

  return (!mediaCard ?
    (<div> No Media Card. Code Error. Refer to Admin.</div>):
    (
    <div className="screen--wrap show--wrap">
      {/* Standard Header */}
      <Components.HeaderBar screenName={screenName} onBack={onBack} onProfileClick={onProfileClick}/>
      
      <div className="show__main-screen--wrap">
        {/* Left Side - Poster */}
        <Components.Poster path={mediaCard.posterPath} title={mediaCard.title} screenName={"Show"}/>

        {/* Right Side - Body */}
        <div className="show__body">
          <h1 className="show__title">{mediaCard?.title ?? "Untitled"}</h1>

          <Components.ActionButtonsRow screenName={screenName} mediaCard={mediaCard} onGo={() => onGo(seasons)}/>
    
          <p className="show__overview">{mediaCard?.overview ?? "No description available."}</p>

          <button 
            className={`btn btn--md btn--meta show__meta-button${showMeta ? " is-active" : ""}`}
            onClick={()=>setShowMeta(!showMeta)}>{showMeta ? "Close" : "Meta"}
          </button>
          
          {!showMeta ? null : (
          <div className="meta-row--wrap">
            <span className="meta-row__item">{mediaCard.year}</span>
            <span  className={`meta-row__item meta-row__item--completion-status-${determineCompletionStatusClassName()}`}>{Shared.completionStatusToText(mediaCard.completionStatus)}</span>
            <span className="meta-row__item">{mediaCard.numberOfEpisodesObtained}/{mediaCard.totalNumberOfEpisodes} Ep</span>
          </div>
          )}
        </div>

      </div>
    </div>
    )
  )
}

export default Show;