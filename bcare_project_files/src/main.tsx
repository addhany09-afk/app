import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Step1Vehicle } from './pages/Step1Vehicle';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Step1Vehicle />
    </BrowserRouter>
  </React.StrictMode>
);
