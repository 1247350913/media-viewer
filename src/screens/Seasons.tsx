import { useState, useEffect } from "react";

import * as Shared from "../../shared";
import * as Components from "../components";
import * as lib from "../lib";

const screenName: Shared.ScreenName = "Seasons"
type Props = Shared.ScreenProps[typeof screenName];

function Seasons({ mediaCard, onBack, onProfileClick}: Props) {
  const [seasons, setSeasons] = useState<Array<[number, [Shared.MediaCard, Shared.MediaCard[]]]> | null>(null);  //[seasonNum, [seasonCard, [episodeCards..]]]
  const [open, setOpen] = useState<Set<number>>(new Set());

  useEffect(() => {
    (async () => {
      if (!mediaCard) { return }
      try {
        const rval = (await (window as any).api?.listSeasonsAndEpisodes(mediaCard)) ?? [];
        mediaCard.numberOfEpisodesObtained = rval.numberOfEpisodesObtained;
        setSeasons(rval.seasons);
      } catch (e) {
        console.error("[Seasons] listSeasonsAndEpisodes failed:", e);
        setSeasons([]);
      }
    })();
  }, [mediaCard]);

  const toggle = (n: number) => {
    setOpen(prev => {
      const next = new Set(prev);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  };

  return (!mediaCard ?
    (<div> No Media Card. Code Error. Refer to Admin.</div>):
    (
    <div className="screen--wrap seasons--wrap">

      {/* Standard Header */}
      <Components.HeaderBar screenName={screenName} onBack={onBack} onProfileClick={onProfileClick}/>

      {/* Seasons Screen */}
      <div className="seasons__layout">

        <h1 className="seasons__title-bar">{mediaCard.title}</h1>

        <div className="seasons__main-screen">

          {/* Left Side */}
          <div className="seasons__left">
            <Components.Poster path={mediaCard.posterPath} title={mediaCard.title} screenName="Seasons" />
          </div>

          {/* Right Side */}
          <div className="seasons__right">
            {!seasons ? (
            <div>Loading...</div>) :
            mediaCard.noSeasons ? (
            <div className="seasons__episodes-list--wrap">
              {/* Flat */}

              {seasons.length > 0 && seasons[0][1][1].map(epCard => (
              <div className="seasons__episode-row" key={epCard.episodeOverallNumber}>
                <span className="seasons__episode-number">E{epCard.episodeNumber}</span>
                <button className="btn btn--sm btn--circle btn--play-episode" title="Play" onClick={() => lib.handlePlay(epCard)}>▶</button>
                <span className="seasons__episode-title">{lib.cleanEpisodeTitle(epCard.title)}</span>
                <span className="seasons__overall-episode-number">#{epCard.episodeOverallNumber}</span>
              </div>
                ))}
            </div>
            ) : (
            <div className="seasons-list">
              {/* Seasons*/}

              {seasons.map((seasonTuple, idx) => {
                const isOpen = open.has(seasonTuple[0]);
                return (
                  <div className="season-row--wrap" key={seasonTuple[0]}>

                    {/* Season Button Row*/}
                    <button
                      className={`season-row-button ${
                        seasonTuple[1][0]?.totalNumberOfEpisodes &&
                        seasonTuple[1][0].totalNumberOfEpisodes > seasonTuple[1][1].length
                          ? "has-missing"
                          : ""
                      }`}
                      onClick={() => toggle(seasonTuple[0])}
                      aria-expanded={isOpen}
                      aria-controls={`season-${seasonTuple[0]}-episodes`}
                    >
                      <div className="season-row__number">{idx+1}</div>

                      <h2 className="season-row__title">{seasonTuple[1][0].title}</h2>
                      
                      {seasonTuple[1][0]?.totalNumberOfEpisodes && (seasonTuple[1][0].totalNumberOfEpisodes > seasonTuple[1][1].length) ? (
                      <span className="season-row__episode-count">{seasonTuple[1][1].length} / {seasonTuple[1][0].totalNumberOfEpisodes} Ep</span>) : (
                      <span className="season-row__episode-count">{seasonTuple[1][1].length} Ep</span>
                      )}

                      <span className={`season-row__chev ${isOpen ? "open" : ""}`} aria-hidden>▾</span>
                    </button>

                    {/* Opened */}
                    {isOpen && (
                    <div className="seasons__episodes-list--wrap" id={`season-${seasonTuple[0]}-episodes`}>
                      {seasonTuple[1][1].map(epCard => (
                      <div className="seasons__episode-row" key={`${seasonTuple[0]}-${epCard.episodeNumber}`}>
                        <span className="seasons__episode-number">E{epCard.episodeNumber}</span>
                        <button className="btn btn--sm btn--circle btn--play-episode" title="Play" onClick={() => lib.handlePlay(epCard)}>▶</button>
                        <span className="seasons__episode-title">{lib.cleanEpisodeTitle(epCard.title)}</span>
                        <span className="seasons__overall-episode-number">#{epCard.episodeOverallNumber}</span>
                      </div>
                      ))}
                    </div>
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </div>  {/* Rigth Side */}
        </div>  {/* Main Screen */}
      </div>  {/* Layout */}
    </div>
    )
  );
}

export default Seasons;