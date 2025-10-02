import { useEffect, useState } from "react";

import * as Shared from "../../shared";
import Poster from "../components/Poster";

type Props = Shared.ScreenProps["Franchise"];
type MediaCard = Shared.MediaCard;


function Franchise({ mediaCard, onGo, onBack }: Props) {
  const [cards, setCards] = useState<MediaCard[] | null>(null);
  const [metaOpen, setMetaOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        const cards: MediaCard[] = (await (window as any).api?.listFranchise(mediaCard)) ?? [];
        setCards(cards);
      } catch (e) {
        console.error("[Franchise] listFranchise failed:", e);
      }
    })();
  }, [mediaCard]);

  function toggleMeta(cardTitle: string) {
    setMetaOpen((s) => ({ ...s, [cardTitle]: !s[cardTitle] }));
  }

  return (!mediaCard ? 
    (<div> No Media Card. Code Error. Refer to Admin.</div>):
    (
    <div className="series-wrap">
      <header className="series-header">
        <button className="btn subtle" onClick={onBack} aria-label="Back">← Back</button>
        <div />
        <div className="profile" title="Profile">🙂</div>
      </header>
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
                <button className="btn primary" onClick={() => onGo(card)}>Go</button>
              </div>
              <p className="series-desc">{card.overview}</p>
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
    )
  );
}

export default Franchise;