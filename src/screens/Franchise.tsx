import { useEffect, useState } from "react";

import * as Shared from "../../shared";
import * as Components from "../components";

const screenName: Shared.ScreenName = "Franchise"
type Props = Shared.ScreenProps[typeof screenName];


function Franchise({ mediaCard, onGo, onBack, onProfileClick }: Props) {
  const [cards, setCards] = useState<Shared.MediaCard[] | null>(null);
  const [metaOpen, setMetaOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const cards: Shared.MediaCard[] = (await (window as any).api?.listFranchise(mediaCard)) ?? [];
        setCards(cards);
      } catch (e) {
        console.error("[Franchise] listFranchise failed:", e);
      }
    })();
  }, [mediaCard]);

  return (!mediaCard ?
    (<div> No Media Card. Code Error. Refer to Admin.</div>):
    (
    <div className="screen--wrap franchise--wrap">

      {/* Standard Header */}
      <Components.HeaderBar screenName={screenName} onBack={onBack} onProfileClick={onProfileClick} mediaCard={mediaCard} count={cards?.length}/>

      {/* Top-level meta toggle */}
      <div className="subheader-bar--wrap">
        <div className="subheader-bar__btn-wrap">
          <button className="btn btn--secondary btn--oval btn--md btn--filter">Order</button>
        </div>
        <div className="subheader-bar__btn-wrap">
          <button className={`btn btn--secondary btn--oval btn--md btn--filter${metaOpen ? " is-active" : ""}`} onClick={() => setMetaOpen((v) => !v)}>{metaOpen ? "Close" : "Meta"}</button>
        </div>
      </div>

      {/* Cards List */}
      {cards === null ? (
      <div>Loading…</div>
      ) : (
      <div className="franchise__column">
        {cards.map((card, idx) => (
          <div key={card.title} className="franchise__row">
            
            {/* Index */}
            <div className="franchise__index">{idx + 1}</div>

            {/* Poster*/}
            <Components.Poster path={card.posterPath} title={card.title} screenName="Franchise" />

            {/* Body */}
            <div className="franchise-row__body">
              <div className="franchise-row__title">{card.title}</div>
              <button className="btn btn--go" onClick={() => onGo(card)}>Go</button>
              {metaOpen && (
              <div className="franchise__meta-row--wrap">
                {card.year && <span className="meta-row__item">{card.year}</span>}
              </div>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
    )
  );
}

export default Franchise;