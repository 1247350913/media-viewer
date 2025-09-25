import { useState } from "react";
import "./App.css";
import { Launch, Browse, Selection, Seasons, SeriesList, Show, type ScreenName, type MediaCard} from "./screens";


function App() {
  const [screenName, setScreenName] = useState<ScreenName>("Launch");
  const [contentPath, setContentPath] = useState<string>("");
  const [selectedCard, setSelectedCard] = useState<MediaCard>({title: "", kind: "all"});

  const handleLoaded = (folderPath: string) => {
    setContentPath(folderPath);
    setScreenName("Browse");
  };

  const handleOpenCard = (card: MediaCard) => {
    setSelectedCard(card);
    if (card.kind === "shows") {
      setScreenName("Show");
    } else if (card.kind === "movies" && card.isSeries) {
      setScreenName("SeriesList");
    } else {
      setScreenName("Selection");
    }
  }
   
  switch (screenName) {
    case "Launch": 
      return (<Launch onLoaded={handleLoaded}/>);
    case "Browse":
      return (<Browse contentPath={contentPath} onOpenCard={handleOpenCard}/>);
    case "Selection":
      return (<Selection mediaCard={selectedCard} onBack={() => setScreenName("Browse")}/>);
    case "Seasons":
      return (<Seasons mediaCard={selectedCard} onBack={() => setScreenName("Browse")}/>);
    case "SeriesList":
      return (<SeriesList mediaCard={selectedCard} onBack={() => setScreenName("Browse")}/>);
    case "Show":
      return (<Show  mediaCard={selectedCard} onBack={() => setScreenName("Browse")}/>);
  }
}

export default App;