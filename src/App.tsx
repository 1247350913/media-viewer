import { useState } from 'react'
import './App.css'

function App() {
  const [titles, setTitles] = useState<string[]>([]);

  const browserSelectFolder = async (): Promise<string[]> =>  {
    if (!('showDirectoryPicker' in window)) {
      alert('Folder picker not supported here. Use Chrome/Edge on localhost or the Electron app.');
      return [];
    }
    // @ts-ignore: File System Access API
    const dir = await window.showDirectoryPicker();
    const titles: string[] = [];
    // @ts-ignore
    for await (const entry of dir.values()) {
      titles.push(entry.kind === 'directory' ? `${entry.name}/` : entry.name);
    }
    return titles;
  }

  const loadVault = async () => {
    try {
      const w = window as any;
      if (w.api?.selectAndIndexVault) {
        const result = await w.api.selectAndIndexVault();
        if (Array.isArray(result)) setTitles(result);
        else console.error('Unexpected result:', result);
        return;
      }
      // Web fallback
      const list = await browserSelectFolder();
      setTitles(list);
    } catch (err) {
      console.error('Vault loading failed:', err);
    }
  }
  
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Vault Viewer</h1>
      <button onClick={loadVault}>Load Vault</button>
      <ul>
        {titles.map((title, idx) => (
          <li key={idx}>{title}</li>
        ))}
      </ul>
    </div>
  );
}

export default App
