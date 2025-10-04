import { useEffect, useState } from "react";

import * as Shared from "../../shared";
import Poster from "../components/Poster";

type Props = Shared.ScreenProps["Franchise"];
type MediaCard = Shared.MediaCard;


function Franchise({ mediaCard, onGo, onBack }: Props) {
  const [cards, setCards] = useState<MediaCard[] | null>(null);
  const [metaOpen, setMetaOpen] = useState(false);

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

      {/* Top-level meta toggle */}
      <div className="subheader-buttons-bar-wrap">
        <button className="subheader-button" onClick={() => setMetaOpen((v) => !v)}>{metaOpen ? "Close" : "Meta"}</button>
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
              <div className="franchise-row-title">{card.title}</div>
              <div className="franchise-row-actions">
                <button className="action-button go-button" onClick={() => onGo(card)}>Go</button>
              </div>
              <div className="meta-wrap">
                {metaOpen && (
                  <div className="meta-wrap">
                    {card.year && <span className="meta-item">{card.year}</span>}
                    {card.runtimeSeconds && <span className="meta-item">{Shared.formatHMM(card.runtimeSeconds)}</span>}
                    {card.quality && <span className="meta-item">{Shared.pixelQualityToText(card.quality)}</span>}
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