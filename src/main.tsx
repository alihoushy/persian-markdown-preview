import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/vazirmatn/400.css';
import '@fontsource/vazirmatn/500.css';
import '@fontsource/vazirmatn/700.css';
import './styles/app.css';
import './styles/markdown.css';
import './styles/print.css';
import App from './App';
import { applyTheme, readStoredTheme } from './lib/themes';

// Before the first paint, so the page never flashes the default theme and
// Mermaid picks the right palette on its very first render.
applyTheme(readStoredTheme());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
