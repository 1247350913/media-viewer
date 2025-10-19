import { useState } from "react";

import * as S from "./screens";
import type { MediaCard } from '@packages/types';
import type { NavHistoryEntry, SeasonTuple } from "./types";S

function App() {
  const [historyStack, setHistoryStack] = useState<NavHistoryEntry[]>([{screenName: "Login", mediaCard: null}]);
  const [contentPath, setContentPath] = useState<string>("");
  const [seasons, setSeasons] = useState<SeasonTuple>(null);

  const current = historyStack[historyStack.length - 1];
  const go = (entry: NavHistoryEntry) => setHistoryStack((s) => [...s, entry]);
  const back = () => setHistoryStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  const onProfileClick = () => { go({ screenName: "Profile", mediaCard: null})}

  const handleLoginSuccess = () => {
     go({ screenName: "Launch", mediaCard: null });
  }
  const handleLoaded = (folderPath: string) => {
    setContentPath(folderPath);
    go({ screenName: "Browse", mediaCard: null });
  };

  const handleOpenCard = (mediaCard: MediaCard) => {
    if (mediaCard.isFranchise) {
      go({ screenName: "Franchise", mediaCard });
    } else if (mediaCard.kind === "show") {
      go({ screenName: "Show", mediaCard });
    } else if (mediaCard.kind === "movie" && mediaCard.isSeries) {
      go({ screenName: "SeriesList", mediaCard });
    } else {
      go({ screenName: "Selection", mediaCard });
    }
  }

  const handleFranchiseGoClick = (mediaCard: MediaCard) => {
    go({ screenName: "Show", mediaCard });
  }

  const handleSeriesListGoClick = (mediaCard: MediaCard) => {
    go({ screenName: "Selection", mediaCard });
  }

  const handleShowGoClick = (seasons: SeasonTuple) => {
    setSeasons(seasons);
    go({ screenName: "Seasons", mediaCard: current.mediaCard! });
  }

  switch (current.screenName) {
    case "Login":
      return (<S.Login onSuccess={handleLoginSuccess}/>)
    case "Launch":
      return (<S.Launch onLoaded={handleLoaded} onBack={back} onProfileClick={onProfileClick}/>);
    case "Browse":
      return (<S.Browse contentPath={contentPath} onOpenCard={handleOpenCard} onBack={back} onProfileClick={onProfileClick}/>);
    case "Franchise":
      return (<S.Franchise mediaCard={current.mediaCard!} onGo={handleFranchiseGoClick} onBack={back} onProfileClick={onProfileClick}/>);
    case "Show":
      return (<S.Show mediaCard={current.mediaCard} onGo={handleShowGoClick} onBack={back} onProfileClick={onProfileClick}/>);
    case "Seasons":
      return (<S.Seasons mediaCard={current.mediaCard} seasons={seasons} onBack={back} onProfileClick={onProfileClick}/>);
    case "SeriesList":
      return (<S.SeriesList mediaCard={current.mediaCard} onGo={handleSeriesListGoClick} onBack={back} onProfileClick={onProfileClick}/>);
    case "Selection":
      return (<S.Selection mediaCard={current.mediaCard} onBack={back} onProfileClick={onProfileClick}/>);
    case "Profile":
      return (<S.Profile onBack={back} />);
  }
}

export default App;