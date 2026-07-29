import React from 'react';
import ReactDOM from 'react-dom/client';
// حطينا الأقواس {} علشان ده Named Export
import { Step1Vehicle } from './pages/Step1Vehicle';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Step1Vehicle />
  </React.StrictMode>
);
