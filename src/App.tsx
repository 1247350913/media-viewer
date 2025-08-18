import { useState } from "react";
import "./App.css";

function App() {
  const [status, setStatus] = useState("Pick a vault to start");

  const loadVault = async (): Promise<void> => {
    
    setStatus("Loading…");
    try {
      const folderPath: string | null = await (window as any).api?.selectAndIndexVault();
      if (!folderPath) {
        setStatus("Canceled");
        return;
      }
      setStatus(`Loaded: ${folderPath}`);

    } catch (err: any) {
      setStatus(`Error: ${err?.message ?? String(err)}`);
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Vault Viewer</h1>
      <button onClick={loadVault}>Load Vault</button>
      <div style={{ marginTop: 8 }}>{status}</div>
    </div>
  );
}

export default App;
