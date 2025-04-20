/**
 * Application configuration 
 * Centralizes all environment variables and configuration settings
 */

const config = {
  firebase: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
  },
  
  google: {
    apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    clientSecret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
    scopes: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events"
  },
  
  gemini: {
    apiKey: process.env.REACT_APP_GEMINI_API_KEY
  },
  
  // Flag to enable/disable mock data for development
  // Setting to true because OAuth is not configured for localhost
  useMockData: true,
  
  // App settings
  appTitle: "Smart Meeting Scheduler"
};

export default config;
