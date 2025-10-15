import { useState } from "react";

import * as Shared from "../shared";
import * as Screens from "./screens";
import "./App.css";


function App() {
  const [historyStack, setHistoryStack] = useState<Shared.NavHistoryEntry[]>([{screenName: "Login", mediaCard: null}]);
  const [contentPath, setContentPath] = useState<string>("");
  const [seasons, setSeasons] = useState<Shared.SeasonTuple>(null);

  const current = historyStack[historyStack.length - 1];
  const go = (entry: Shared.NavHistoryEntry) => setHistoryStack((s) => [...s, entry]);
  const back = () => setHistoryStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  const onProfileClick = () => { go({ screenName: "Profile", mediaCard: null})}

  const handleLoginSuccess = () => {
     go({ screenName: "Launch", mediaCard: null });
  }
  const handleLoaded = (folderPath: string) => {
    setContentPath(folderPath);
    go({ screenName: "Browse", mediaCard: null });
  };

  const handleOpenCard = (mediaCard: Shared.MediaCard) => {
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

  const handleFranchiseGoClick = (mediaCard: Shared.MediaCard) => {
    go({ screenName: "Show", mediaCard });
  }

  const handleSeriesListGoClick = (mediaCard: Shared.MediaCard) => {
    go({ screenName: "Selection", mediaCard });
  }

  const handleShowGoClick = (seasons: Shared.SeasonTuple) => {
    setSeasons(seasons);
    go({ screenName: "Seasons", mediaCard: current.mediaCard! });
  }

  switch (current.screenName) {
    case "Login":
      return (<Screens.Login onSuccess={handleLoginSuccess}/>)
    case "Launch":
      return (<Screens.Launch onLoaded={handleLoaded}/>);
    case "Browse":
      return (<Screens.Browse contentPath={contentPath} onOpenCard={handleOpenCard} onBack={back} onProfileClick={onProfileClick}/>);
    case "Franchise":
      return (<Screens.Franchise mediaCard={current.mediaCard!} onGo={handleFranchiseGoClick} onBack={back} onProfileClick={onProfileClick}/>);
    case "Show":
      return (<Screens.Show mediaCard={current.mediaCard} onGo={handleShowGoClick} onBack={back} onProfileClick={onProfileClick}/>);
    case "Seasons":
      return (<Screens.Seasons mediaCard={current.mediaCard} seasons={seasons} onBack={back} onProfileClick={onProfileClick}/>);
    case "SeriesList":
      return (<Screens.SeriesList mediaCard={current.mediaCard} onGo={handleSeriesListGoClick} onBack={back} onProfileClick={onProfileClick}/>);
    case "Selection":
      return (<Screens.Selection mediaCard={current.mediaCard} onBack={back} onProfileClick={onProfileClick}/>);
    case "Profile":
      return (<Screens.Profile onBack={back} />);
  }
}

export default App;