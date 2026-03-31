import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// 1. Import your AuthProvider to handle the 'login' logic globally
import { AuthProvider } from './context/AuthContext'; 

/** * 2. Style Check: 
 * Using style.css to match your project's sidebar and avoid "Failed to resolve" errors.
 */
import './style.css'; 

/**
 * 3. Component Import:
 * Ensure this is 'App' (Capital A) to match App.jsx. 
 * This is a common cause of 500 Internal Server errors in Vite.
 */
import App from './App';

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      {/* Wrap App with AuthProvider:
        This provides the 'login', 'user', and 'loading' states 
        to all routes inside your application.
      */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>
  );
} else {
  // Helpful debugging for your index.html setup
  console.error("Target container 'root' not found. Ensure <div id='root'></div> exists in index.html");
}