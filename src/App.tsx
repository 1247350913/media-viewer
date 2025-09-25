import { useState } from "react";
import "./App.css";
import { Launch, Browse, Selection, Seasons, SeriesList, Show, type Screen, type MediaCard} from "./screens";


function App() {
  const [screen, setScreen] = useState<Screen>({name: "Launch"});
  const [contentPath, setContentPath] = useState<string>("");

  const handleLoaded = (folderPath: string) => {
    setScreen({name: "Browse"});
    setContentPath(folderPath);
  };

  const handleOpenCard = (card: MediaCard) => {
    if (card.kind === "shows") {
      setScreen({ name: "Show", mediaCard: card });
    } else if (card.kind === "movies" && card.isSeries) {
      setScreen({ name: "SeriesList", mediaCard: card });
    } else {
      setScreen({ name: "Selection", mediaCard: card });
    }
  }
   
  switch (screen.name) {
    case "Launch": 
      return (<Launch onLoaded={handleLoaded}/>);
    case "Browse":
      return (<Browse contentPath={contentPath} onOpenCard={handleOpenCard}/>);
    case "Selection":
      return (<Selection mediaCard={screen.mediaCard} onBack={() => setScreen({name: "Browse"})}/>);
    case "Seasons":
      return (<Seasons mediaCard={screen.mediaCard} onBack={() => setScreen({name: "Browse"})}/>);
    case "SeriesList":
      return (<SeriesList mediaCard={screen.mediaCard} onBack={() => setScreen({name: "Browse"})}/>);
    case "Show":
      return (<Show  mediaCard={screen.mediaCard} onBack={() => setScreen({name: "Browse"})}/>);
  }
}

export default App;