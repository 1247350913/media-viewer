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
      <Components.HeaderBar screenName={screenName} onBack={onBack} onProfileClick={onProfileClick}/>

      {/* Top-level meta toggle */}
      <div className="subheader-bar--wrap">
        <div className="subheader-bar__btn--wrap">
          <button className="btn btn--meta" onClick={() => setMetaOpen((v) => !v)}>{metaOpen ? "Close" : "Meta"}</button>
        </div>
      </div>

      {/* Cards List */}
      {cards === null ? (
      <div>Loading…</div>
      ) : (
      <div className="franchise__list">
        {cards.map((card) => (
          <div key={card.title} className="franchise__row">

            {/* Left Side */}
            <Components.Poster path={card.posterPath} title={card.title} screenName="Franchise" />

            {/* Right Side */}
            <div className="franchise-row__body">
              <div className="franchise-row__title">{card.title}</div>
              <div className="franchise-row__actions">
                <button className="btn btn--go" onClick={() => onGo(card)}>Go</button>
              </div>
              <div className="meta--wrap">
                {metaOpen && (
                  <div className="meta--wrap">
                    {card.year && <span className="meta__item">{card.year}</span>}
                    {card.runtimeSeconds && <span className="meta__item">{Shared.formatHMM(card.runtimeSeconds)}</span>}
                    {card.quality && <span className="meta__item">{Shared.pixelQualityToText(card.quality)}</span>}
                  </div>
                )}
              </div>
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