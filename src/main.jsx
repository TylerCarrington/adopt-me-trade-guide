import React from 'react';
import ReactDOM from 'react-dom/client';
import { PetDataProvider } from './context/PetDataContext';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PetDataProvider>
      <App />
    </PetDataProvider>
  </React.StrictMode>
);
