import { useEffect, useState } from "react";

import * as Shared from "../../shared";
import * as Components from "../components";

const screenName: Shared.ScreenName = "SeriesList"
type Props = Shared.ScreenProps[typeof screenName];


function SeriesList({ mediaCard, onGo, onBack, onProfileClick }: Props) {
  const [cards, setCards] = useState<Shared.MediaCard[] | null>(null);
  const [metaOpen, setMetaOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list: Shared.MediaCard[] =
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
    <div className="screen--wrap serieslist--wrap">
      {/* Standard Header */}
      <Components.HeaderBar screenName={screenName} onBack={onBack} onProfileClick={onProfileClick} mediaCard={mediaCard} count={cards?.length}/>

      {/* Standard Subheader */}
      <div className="subheader-bar--wrap">
        <div className="subheader-bar__btn-wrap">
          <button className="btn btn--secondary btn--oval btn--md">Order</button>
        </div>
        <div className="subheader-bar__btn-wrap">
          <button className="btn btn--secondary btn--oval btn--md" onClick={() => setMetaOpen((v) => !v)}>{metaOpen ? "Close" : "Meta"}</button>
        </div>
      </div>

      {/* List */}
      {cards === null ? (
        <div>Loading…</div>
      ) : (
        <div className="serieslist__column">
          {cards.map((card, idx) => (
            <article key={card.title} className="serieslist__row">
              {/* Index */}
              <div className="serieslist__index">{idx + 1}</div>

              {/* Poster */}
              <Components.Poster path={card.posterPath} title={card.title} screenName={screenName}/> 
         
              {/* Body */}
              <div className="serieslist__body">
                <h2 className="serieslist-row__title">{card.title}</h2>
                <button className="btn btn--md btn--oval" onClick={() => onGo(card)}>Go</button>
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