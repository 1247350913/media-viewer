import { useState } from 'react'
import './App.css'

function App() {
  const [titles, setTitles] = useState<string[]>([]);

  const loadVault = async () => {
    try {
      const result = await window.api.selectAndIndexVault();
      if (result && Array.isArray(result)) {
        setTitles(result);
      } else {
        console.error('Unexpected result:', result);
      }
    } catch (err) {
      console.error('Vault loading failed:', err);
    }
  };

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
