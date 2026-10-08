import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { I18nProvider } from './context/I18nContext';

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline fallback for development
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <I18nProvider>
    <App />
  </I18nProvider>
);
