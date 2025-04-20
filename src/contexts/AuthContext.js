import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState(null);

  // Google sign in
  const signInWithGoogle = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      
      // Add scopes for Google Calendar API access with explicit prompting to ensure user consent
      provider.addScope('https://www.googleapis.com/auth/calendar');
      provider.addScope('https://www.googleapis.com/auth/calendar.events');
      
      // Force account selection to ensure proper scopes
      provider.setCustomParameters({
        prompt: 'select_account consent'
      });
      
      console.log("Starting Google sign-in with calendar scopes");
      const result = await signInWithPopup(auth, provider);
      
      // Get the Google Access Token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      if (token) {
        console.log("Successfully obtained Google access token");
        // Store the token in localStorage for Calendar API access
        localStorage.setItem('googleAccessToken', token);
        setToken(token);
      } else {
        console.error("No access token received during Google sign-in");
        setError('Failed to get access token. Please try again.');
      }
      
      return result;
    } catch (err) {
      console.error("Google sign-in error:", err);
      // Handle specific Firebase auth errors
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else {
        setError('Failed to sign in with Google: ' + (err.message || 'Unknown error'));
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('googleAccessToken');
      setToken(null);
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
      setError('Failed to log out: ' + err.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      
      // Try to get the token from localStorage on auth state change
      const savedToken = localStorage.getItem('googleAccessToken');
      if (savedToken) {
        setToken(savedToken);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    token,
    signInWithGoogle,
    logout,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
