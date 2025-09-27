import { useState, useEffect } from "react";
import Poster from "../components/Poster";
import * as Shared from "../../shared";

type Props = Shared.ScreenProps["Seasons"];


function Seasons({ mediaCard, onBack }: Props) {
  const [seasons, setSeasons] = useState<Array<[number, [Shared.MediaCard, Shared.MediaCard[]]]> | null>(null);
  const [open, setOpen] = useState<Set<number>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const seasons = (await (window as any).api?.listSeasonsAndEpisodes(mediaCard)) ?? [];
        setSeasons(seasons);
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

  return (
    <div className="seasons-wrap">
      <div className="nav">
        <button className="back" onClick={onBack}>&larr;</button>
        <div className="nav-center" />
        <div className="profile" title="Profile">🙂</div>
      </div>
      <div className="seasons-grid">
        <aside className="seasons-left">
          <h2 className="show-title">{mediaCard.title}</h2>
          <div className="show-poster">
            {mediaCard.posterPath ? (
              <Poster path={mediaCard.posterPath} title={mediaCard.title} screenName="Seasons" />
            ) : (
              <div className="poster-fallback" aria-hidden />
            )}
          </div>
        </aside>
        <main className="seasons-right">
          {!seasons ? (
          <div className="empty">Loading...</div>
          ) : (
          <div className="season-list">
            {seasons.map(seasonTuple => {
              const isOpen = open.has(seasonTuple[0]);
              return (
                <div className="season-block" key={seasonTuple[0]}>
                  <button
                    className="season-row"
                    onClick={() => toggle(seasonTuple[0])}
                    aria-expanded={isOpen}
                    aria-controls={`season-${seasonTuple[0]}-episodes`}
                  >
                    <span className="season-num">Season {seasonTuple[0]}</span>
                    <span className="season-title">{seasonTuple[1][0].title}</span>
                    <span className="spacer" />
                    <span className="episode-count">{seasonTuple[1][1].length} Ep</span>
                    <span className={`chev ${isOpen ? "open" : ""}`} aria-hidden>▾</span>
                  </button>
                  {isOpen && (
                    <div id={`season-${seasonTuple[0]}-episodes`} className="episodes">
                      {seasonTuple[1][1].map(epCard => (
                        <div className="episode-row" key={`${seasonTuple[0]}-${epCard.episodeNumber}`}>
                          <span className="ep-num">E{epCard.episodeNumber}</span>
                          <button className="play-btn" title="Play">▶</button>
                          <span className="ep-title">{epCard.title}</span>
                          <span className="overall">#{epCard.episodeOverallNumber}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Seasons;