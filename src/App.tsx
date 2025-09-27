import { useState } from "react";
import "./App.css";
import * as Shared from "../shared";
import { Launch, Browse, Selection, Seasons, SeriesList, Show, Franchise} from "./screens";

type ScreenName = Shared.ScreenName;
type MediaCard = Shared.MediaCard;

function App() {
  const [screenName, setScreenName] = useState<ScreenName>("Launch");
  const [contentPath, setContentPath] = useState<string>("");
  const [selectedCard, setSelectedCard] = useState<MediaCard>({title: "", kind: "all"});
  const [seasons, setSeasons] = useState<Shared.SeasonTuple>(null);

  const handleLoaded = (folderPath: string) => {
    setContentPath(folderPath);
    setScreenName("Browse");
  };

  const handleOpenCard = (card: MediaCard) => {
    setSelectedCard(card);
    if (card.isFranchise) {
      setScreenName("Franchise");
    } else if (card.kind === "show") {
      setScreenName("Show");
    } else if (card.kind === "movie" && card.isSeries) {
      setScreenName("SeriesList");
    } else {
      setScreenName("Selection");
    }
  }

  const handleFranchiseGoClick = (mediaCard: MediaCard) => {
    setSelectedCard(mediaCard);
    setScreenName("Seasons");
  }

  const handleShowGoClick = (seasons: Shared.SeasonTuple) => {
    setSeasons(seasons);
    setScreenName("Seasons");
  }

  switch (screenName) {
    case "Launch": 
      return (<Launch onLoaded={handleLoaded}/>);
    case "Browse":
      return (<Browse contentPath={contentPath} onOpenCard={handleOpenCard}/>);
    case "Franchise":
      return (<Franchise mediaCard={selectedCard} onGo={handleFranchiseGoClick} onBack={() => setScreenName("Browse")}/>);
    case "Show":
      return (<Show mediaCard={selectedCard} onGo={handleShowGoClick} onBack={() => setScreenName("Browse")}/>);
    case "Seasons":
      return (<Seasons mediaCard={selectedCard} seasons={seasons} onBack={() => setScreenName("Show")}/>);
    case "SeriesList":
      return (<SeriesList mediaCard={selectedCard} onBack={() => setScreenName("Browse")}/>);
    case "Selection":
      return (<Selection mediaCard={selectedCard} onBack={() => setScreenName("Browse")}/>);
  }
}

export default App;