import { useState, useEffect } from "react";

import * as Shared from "../../shared";
import * as Components from "../components";
import * as lib from "../lib";

type Props = Shared.ScreenProps["Seasons"];

function Seasons({ mediaCard, onBack }: Props) {
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
    <div className="screen-wrap seasons-wrap">

      {/* Standard Header */}
      <div className="header-bar-wrap">
        <button className="back-button" onClick={onBack}>&larr;</button>
        <div className="profile-wrap" title="Profile">
          <img src="../../public/default-profile-icon.png" alt="Profile Image" className="profile-icon"/>
        </div>
      </div>

      {/* Seasons Screen */}
      <div className="seasons-main-screen-wrap">

        {/* Left Side */}
        <div className="seasons-left-wrap">
          <div className="seasons-title">{mediaCard.title}</div>
          <div className="seasons-poster-wrap">
            <Components.Poster path={mediaCard.posterPath} title={mediaCard.title} screenName="Seasons" />
          </div>
        </div>

        {/* Right Side - FLAT*/}
        <div className="seasons-right-wrap">
          {!seasons ? (
          <div className="empty">Loading...</div>) :
          mediaCard.noSeasons ? (
          <div className="seasons-episodes-wrap">
            {seasons.length > 0 && seasons[0][1][1].map(epCard => (
            <div className="seasons-episode-row" key={epCard.episodeOverallNumber}>
              <span className="seasons-episode-number">E{epCard.episodeNumber}</span>
              <button className="play-button" title="Play" onClick={() => lib.handlePlay(epCard)}>▶</button>
              <span className="seasons-episode-title">{epCard.title}</span>
              <span className="seasons-episode-overall-number">#{epCard.episodeOverallNumber}</span>
            </div>
              ))}
          </div>
          ) : (
          <div className="seasons-list">

            {/* Right Side - Seasons*/}
            {seasons.map(seasonTuple => {
              const isOpen = open.has(seasonTuple[0]);
              return (
                <div className="season-row-wrap" key={seasonTuple[0]}>

                  {/* Season Button Row*/}
                  <button
                    className={`season-row ${
                      seasonTuple[1][0]?.totalNumberOfEpisodes &&
                      seasonTuple[1][0].totalNumberOfEpisodes > seasonTuple[1][1].length
                        ? "has-missing"
                        : ""
                    }`}
                    onClick={() => toggle(seasonTuple[0])}
                    aria-expanded={isOpen}
                    aria-controls={`season-${seasonTuple[0]}-episodes`}
                  >
                    <span className="season-title">{seasonTuple[1][0].title}</span>
                    <span className="season-spacer" />

                    {seasonTuple[1][0]?.totalNumberOfEpisodes && (seasonTuple[1][0].totalNumberOfEpisodes > seasonTuple[1][1].length) ? (
                    <span className="seasons-episode-count">{seasonTuple[1][1].length} / {seasonTuple[1][0].totalNumberOfEpisodes} Ep</span>) : (
                    <span className="seasons-episode-count">{seasonTuple[1][1].length} Ep</span>
                    )}

                    <span className={`chev ${isOpen ? "open" : ""}`} aria-hidden>▾</span>
                  </button>

                  {/* Opened */}
                  {isOpen && (
                  <div className="seasons-episodes-wrap" id={`season-${seasonTuple[0]}-episodes`}>
                    {seasonTuple[1][1].map(epCard => (
                    <div className="seasons-episode-row" key={`${seasonTuple[0]}-${epCard.episodeNumber}`}>
                      <span className="seasons-episode-number">E{epCard.episodeNumber}</span>
                      <button className="play-button" title="Play" onClick={() => lib.handlePlay(epCard)}>▶</button>
                      <span className="seasons-episode-title">{Shared.stripExtention(epCard.title)}</span>
                      <span className="seasons-episode-overall-number">#{epCard.episodeOverallNumber}</span>
                    </div>
                    ))}
                  </div>
                  )}
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>
    </div>
    )
  );
}

export default Seasons;