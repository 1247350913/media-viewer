import { useState } from "react";
import type { ScreenProps } from "../../shared";

type LaunchProps = ScreenProps["Launch"];

function Launch({ onLoaded }: LaunchProps) {
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
    <div className="screen--wrap launch--wrap">
      <h1>Vault Viewer</h1>
      <button className="btn btn--launch btn--md btn--oval" onClick={handleLoad}>Load Vault</button>
      <p style={{opacity:.7,marginTop:8}}>{status !== "Loaded" ? status : null}</p>
    </div>
  );
}

export default Launch;