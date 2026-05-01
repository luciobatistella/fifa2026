import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from '../album-copa-2026.jsx';
import PaginaTrocasPublica from './components/PaginaTrocasPublica.jsx';
import './styles/tailwind.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/trocas/:username" element={<PaginaTrocasPublica />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
