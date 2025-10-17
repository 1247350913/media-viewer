import { useState } from "react";
import * as Shared from "../../shared";
import * as Components from "../components";

const screenName: Shared.ScreenName = "Launch"
type LaunchProps = Shared.ScreenProps[typeof screenName];

function Launch({ onLoaded, onBack, onProfileClick }: LaunchProps) {
  const [status, setStatus] = useState("Select the Content folder");

  const handleLoad = async () => {
    setStatus("Loading…");
    try {
      const folderPath: string | null = await (window as any).api?.selectVault();
      if (!folderPath) {
        setStatus("Canceled");
        return;
      }
      setStatus("Loaded");
      onLoaded(folderPath);
    } catch (err: any) {
      setStatus(`Error: ${err?.message ?? String(err)}`);
      console.error(err);
    }
  };

  return (
  <div>
    <Components.HeaderBar screenName={screenName} onBack={onBack} onProfileClick={onProfileClick}/>
    <div className="screen--wrap launch--wrap">
      <h1>Vault Viewer</h1>
      <button className="btn btn--launch btn--md btn--oval" onClick={handleLoad}>Load Vault</button>
      <p style={{opacity:.7,marginTop:8}}>{status !== "Loaded" ? status : null}</p>
    </div>
  </div>
  );
}

export default Launch;