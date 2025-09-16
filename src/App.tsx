import { useState } from "react";
import "./App.css";
import { Launch, MediaType, Browse, type MediaKind, type Screen } from "./screens";


function App() {
  const [screen, setScreen] = useState<Screen>("Launch");
  const [contentPath, setContentPath] = useState<string | null>(null);
  const [kind, setKind] = useState<MediaKind>("all");

  const handleLoaded = (folderPath: string) => {
    setContentPath(folderPath);
    setScreen("MediaType");
  };
  const handlePick = (k: MediaKind) => {
    setKind(k);
    setScreen("Browse");
  };

  if (screen === "Launch") { return ( <Launch onLoaded={handleLoaded} /> ); }
  if (screen === "MediaType") { return ( <MediaType value={kind} onPick={handlePick} /> ); }
  if (screen === "Browse" && contentPath) { return ( <Browse contentPath={contentPath} kind={kind} onBack={() => setScreen("MediaType")} /> ); }

  return null;
}

export default App;