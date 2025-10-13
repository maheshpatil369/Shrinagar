// FILENAME: src/main.jsx
//
// This is the main entry point for the Vite application.
// Its key responsibility is to wrap the entire App component
// with the AuthProvider, making authentication state globally available.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; // Import the AuthProvider
import './index.css'; // Import Tailwind CSS styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

