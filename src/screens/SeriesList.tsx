import { useEffect, useState } from "react";

import * as Shared from "../../shared";
import Poster from "../components/Poster";

type Props = Shared.ScreenProps["SeriesList"];
type MediaCard = Shared.MediaCard;

function SeriesList({ mediaCard, onGo, onBack }: Props) {
  const [cards, setCards] = useState<MediaCard[] | null>(null);
  const [metaOpen, setMetaOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list: MediaCard[] =
          (await (window as any).api?.listSeries(mediaCard)) ?? [];
        if (!alive) return;
        const sorted = list
          .slice()
          .sort((a, b) => {
            const y = (a.year ?? 0) - (b.year ?? 0);
            return y !== 0
              ? y
              : a.title.localeCompare(b.title, undefined, {
                  sensitivity: "base",
                });
          });
        setCards(sorted);
      } catch (e) {
        console.error("[SeriesList] listSeriesMovies failed:", e);
        if (alive) setCards([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [mediaCard]);

  return !mediaCard ? (
    <div>No Media Card. Code Error. Refer to Admin.</div>
  ) : (
    <div className="screen-wrap serieslist-wrap">
      {/* Standard Header */}
      <div className="header-bar-wrap">
        <button className="back-button" onClick={onBack} aria-label="Back">←</button>
        <div className="serieslist-title">{mediaCard.title}</div>
        <div className="profile-wrap" title="Profile">
          <img src="../../public/default-profile-icon.png" alt="Profile Image" className="profile-icon"/>
        </div>
      </div>
      {/* Top-level toggles */}
      <div className="subheader-buttons-bar-wrap">
        <button className="subheader-button">Order</button>
        <button className="subheader-button" onClick={() => setMetaOpen((v) => !v)}>{metaOpen ? "Close" : "Meta"}</button>
      </div>
      {/* List */}
      {cards === null ? (
        <div>Loading…</div>
      ) : (
        <div className="serieslist-table">
          {cards.map((card, idx) => (
            <article key={card.title} className="serieslist-row">
              {/* Index */}
              <div className="serieslist-index">{idx + 1}</div>
              {/* Poster */}
              {card.posterPath ? 
              (<Poster path={card.posterPath} title={card.title}screenName="SeriesList"/>) : 
              (<div className="serieslist-poster-fallback" aria-hidden />)
              }
              {/* Body */}
              <div className="serieslist-body">
                <h2 className="serieslist-row-title">{card.title}</h2>
                <button className="go-button" onClick={() => onGo(card)}>Go</button>
                {metaOpen && (
                <div className="serieslist-meta">
                  {card.year && <span>{card.year}</span>}
                  {card.runtimeSeconds && <span>{Shared.formatHMM(card.runtimeSeconds)}</span>}
                  {card.quality && <span>{Shared.pixelQualityToText(card.quality)}</span>}
                </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default SeriesList;