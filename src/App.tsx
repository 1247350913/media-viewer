import { useState } from "react";
import "./App.css";
import * as Shared from "../shared";
import { Launch, Browse, Selection, Seasons, SeriesList, Show, Franchise} from "./screens";

type MediaCard = Shared.MediaCard;
type HistoryEntry = Shared.HistoryEntry;
type SeasonTuple = Shared.SeasonTuple;


function App() {
  const [historyStack, setHistoryStack] = useState<HistoryEntry[]>([{screenName: "Launch", mediaCard: null}]);
  const [contentPath, setContentPath] = useState<string>("");
  const [seasons, setSeasons] = useState<SeasonTuple>(null);

  const go = (entry: HistoryEntry) => setHistoryStack((s) => [...s, entry]);
  const back = () => setHistoryStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  const current = historyStack[historyStack.length - 1];

  const onProfileClick = () => { go({ screenName: "Profile", mediaCard: null})}

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

  const handleShowGoClick = (seasons: Shared.SeasonTuple) => {
    setSeasons(seasons);
    go({ screenName: "Seasons", mediaCard: current.mediaCard! });
  }

  switch (current.screenName) {
    case "Launch":
      return (<Launch onLoaded={handleLoaded}/>);
    case "Browse":
      return (<Browse contentPath={contentPath} onOpenCard={handleOpenCard} onBack={back} onProfileClick={onProfileClick}/>);
    case "Franchise":
      return (<Franchise mediaCard={current.mediaCard!} onGo={handleFranchiseGoClick} onBack={back} onProfileClick={onProfileClick}/>);
    case "Show":
      return (<Show mediaCard={current.mediaCard} onGo={handleShowGoClick} onBack={back} onProfileClick={onProfileClick}/>);
    case "Seasons":
      return (<Seasons mediaCard={current.mediaCard} seasons={seasons} onBack={back} onProfileClick={onProfileClick}/>);
    case "SeriesList":
      return (<SeriesList mediaCard={current.mediaCard} onGo={handleSeriesListGoClick} onBack={back} onProfileClick={onProfileClick}/>);
    case "Selection":
      return (<Selection mediaCard={current.mediaCard} onBack={back} onProfileClick={onProfileClick}/>);
  }
}

export default App;