import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

// Immediate background warm-up ping for free-tier cloud backend
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://vyuha-backend-rjgb.onrender.com/api/v1' : 'http://localhost:5000/api/v1');
fetch(`${API_URL}/health`).catch(() => {});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
