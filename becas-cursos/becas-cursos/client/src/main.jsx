import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource-variable/bricolage-grotesque/opsz.css';
import '@fontsource-variable/public-sans';
import './styles.css';
import App from './App.jsx';
import { ModoProvider } from './context/ModoContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ModoProvider>
        <App />
      </ModoProvider>
    </BrowserRouter>
  </StrictMode>
);
