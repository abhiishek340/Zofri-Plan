import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import config from './config'; // Import the config

// Load Google API script
const loadGoogleApi = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("Google API script loaded successfully");
      // Further init Google client
      window.gapi.load('client:auth2', async () => {
        try {
          const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
          const SCOPES = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events";
          const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
          const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY || "";
          
          await window.gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES
          });
          
          console.log("Google API client initialized successfully");
          resolve();
        } catch (error) {
          console.error("Failed to initialize Google API client:", error);
          reject(error);
        }
      });
    };
    script.onerror = () => {
      console.error("Failed to load Google API script");
      reject(new Error("Failed to load Google API script"));
    };
    document.body.appendChild(script);
  });
};

// Conditionally load Google API only if not using mock data
if (!config.useMockData) {
  console.log("Attempting to load Google API...");
  loadGoogleApi()
    .then(() => {
      console.log("Google API loaded and initialized, rendering app");
    })
    .catch(error => {
      console.error("Error loading Google API:", error);
      // Proceed to render the app even if Google API fails to load in non-mock mode
    });
} else {
  console.log("Using mock data, skipping Google API load.");
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
