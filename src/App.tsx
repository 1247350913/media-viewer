import { useState } from "react";
import "./App.css";
import { Launch, Browse, type Screen } from "./screens";


function App() {
  const [screen, setScreen] = useState<Screen>("Launch");
  const [contentPath, setContentPath] = useState<string | null>(null);

  const handleLoaded = (folderPath: string) => {
    setContentPath(folderPath);
    setScreen("Browse");
  };

  if (screen === "Launch") { return ( <Launch onLoaded={handleLoaded} /> ); }
  if (screen === "Browse" && contentPath) { return ( <Browse contentPath={contentPath} onBack={() => setScreen("Launch")} /> ); }

  return null;
}

export default App;