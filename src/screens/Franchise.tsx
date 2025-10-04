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
    <div className="screen-wrap franchise-wrap">

      {/* Standard Header */}
      <div className="header-bar-wrap">
        <button className="back-button" onClick={onBack} aria-label="Back">←</button>
        <div className="profile-wrap" title="Profile">
          <img src="../../public/default-profile-icon.png" alt="Profile Image" className="profile-icon"/>
        </div>
      </div>

      {/* Options List */}
      {cards === null ? (
      <div>Loading…</div>
      ) : (
      <div className="franchise-list">
        {cards.map((card) => (
          <article key={card.title} className="franchise-row">

            {/* Left Side */}
            <Poster path={card.posterPath} title={card.title} screenName="Selection" />

            {/* Right Side */}
            <div className="franchise-row-body">
              <h2 className="franchise-row-title">{card.title}</h2>
              <div className="franchise-row-actions">
                <button className="action-button go-button" onClick={() => onGo(card)}>Go</button>
              </div>
              <div className="meta-wrap">
                <button className="btn subtle" onClick={() => toggleMeta(card.title)}>
                  {metaOpen[card.title] ? "Close" : "Meta"}
                </button>
                {metaOpen[card.title] && (
                  <div className="series-meta-row">
                    {card.year && <span>{card.year}</span>}
                    {card.runtimeSeconds && <span>{Shared.formatHMM(card.runtimeSeconds)}</span>}
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