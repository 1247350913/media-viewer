import React from 'react';
import { createRoot } from 'react-dom/client';

// Reuse the exact same UI source as Electron renderer:
import App from '../../desktop/renderer/src/App';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
