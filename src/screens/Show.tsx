import { useState, useEffect } from "react";

import * as Shared from "../../shared";
import * as Components from "../components";

const screenName: Shared.ScreenName = "Show"
type Props = Shared.ScreenProps[typeof screenName];


function Show({ mediaCard, onGo, onBack, onProfileClick }: Props) {
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
    return mediaCard.completionStatus?? "U"
  }

  return (!mediaCard ?
    (<div> No Media Card. Code Error. Refer to Admin.</div>):
    (
    <div className="screen--wrap show--wrap">
      {/* Standard Header */}
      <Components.HeaderBar screenName={screenName} onBack={onBack} onProfileClick={onProfileClick}/>
      
      <div className="show__main-screen">
        {/* Left Side */}
        <Components.Poster path={mediaCard.posterPath} title={mediaCard.title} screenName={"Show"}/>

        {/* Right Side */}
        <div className="show__body">
          <div className="show__title">{mediaCard?.title ?? "Untitled"}</div>

          <Components.ActionButtonsRow screenName={screenName} mediaCard={mediaCard} onGo={() => onGo(seasons)}/>
          
          <div className="show__overview">
            <p>{mediaCard?.overview ?? "No description available."}</p>
          </div>

          <button className="btn btn--sm btn--meta" onClick={()=>setShowMeta(!showMeta)}>{showMeta ? "Close" : "Meta"}</button>
          
          {!showMeta ? null : (
          <div className="meta-row--wrap">
            <span className="meta-row__item">{mediaCard.year}</span>
            <span  className={`meta-row__item--completion-status-${determineCompletionStatusClassName()}`}>{Shared.completionStatusToText(mediaCard.completionStatus)}</span>
            <span className="meta-row--item">{mediaCard.numberOfEpisodesObtained}/{mediaCard.totalNumberOfEpisodes} episodes</span>
          </div>
          )}
        </div>

      </div>
    </div>
    )
  )
}

export default Show;