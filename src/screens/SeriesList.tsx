import { useEffect, useState } from "react";

import * as Shared from "../../shared";
import Poster from "../components/Poster";
import { handlePlay } from ".";

type Props = Shared.ScreenProps["SeriesList"];
type MediaCard = Shared.MediaCard;


function SeriesList({ mediaCard, onBack }: Props) {
  const [cards, setCards] = useState<MediaCard[] | null>(null);
  const [metaOpen, setMetaOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list: MediaCard[] = (await (window as any).api?.listSeries(mediaCard)) ?? [];
        if (!alive) return;
        const sorted = list.slice().sort((a, b) => {
          const y = (a.year ?? 0) - (b.year ?? 0);
          return y !== 0 ? y : a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
        });
        setCards(sorted);
      } catch (e) {
        console.error("[SeriesList] listSeriesMovies failed:", e);
        if (alive) setCards([]);
      }
    })();
    return () => { alive = false; };
  }, [mediaCard]);

  function toggleMeta(cardTitle: string) {
    setMetaOpen((s) => ({ ...s, [cardTitle]: !s[cardTitle] }));
  }

  return (
    <div className="series-wrap">
      <header className="series-header">
        <button className="btn subtle" onClick={onBack} aria-label="Back">← Back</button>
        <div />
        <div className="profile" title="Profile">🙂</div>
      </header>
      <h1 className="series-title">{mediaCard.title}</h1>
      {cards === null ? (
      <div className="loading">Loading…</div>
      ) : (
      <div className="series-list">
        {cards.map((card) => (
          <article key={card.title} className="series-row">
            <div className="series-poster">
              {card.posterPath ? (
                <Poster path={card.posterPath} title={card.title} screenName="Selection" />
              ) : (
                <div className="poster-fallback" aria-hidden />
              )}
            </div>
            <div className="series-body">
              <h2 className="series-item-title">{card.title}</h2>
              <div className="series-actions">
                <button className="btn ghost" disabled={!mediaCard?.sampleFilePath}>
                  Trailer
                </button>
                <button className="btn primary" onClick={() => handlePlay(mediaCard)} disabled={!mediaCard?.videoFilePath}>
                  ▶ Play
                </button>
              </div>
              <p className="series-desc">{card.description} This is the description that is super long and has a lot of words about the description because it really needs all of this in order to feel like it is okay and pretty good and stuff because it really just needs all this text about the film to describe how it works overall and all the things that go into it.</p>
              <div className="series-meta">
                <button className="btn subtle" onClick={() => toggleMeta(card.title)}>
                  {metaOpen[card.title] ? "Close" : "Meta"}
                </button>
                {metaOpen[card.title] && (
                  <div className="series-meta-row">
                    {card.year && <span>{card.year}</span>}
                    {card.runtimeSeconds && <span>{Shared.formatHHMMSS(card.runtimeSeconds)}</span>}
                    {card.quality && <span>{Shared.pixelQualityToText(card.quality)}</span>}
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      )}
    </div>
  );
}

export default SeriesList;