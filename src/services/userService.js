/**
 * User Service
 * Handles user preferences and settings storage
 */

import { db } from '../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/**
 * Get user preferences from Firestore
 * @returns {Promise<Object>} - User preferences
 */
export const getUserPreferences = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data().preferences || {};
    } else {
      // Create default preferences if user document doesn't exist
      const defaultPreferences = {
        autoSchedule: true,
        dailySummary: true,
        summaryTime: '18:00',
        workStartTime: '09:00',
        workEndTime: '17:00',
        lunchTime: '12:00',
        lunchDuration: 60,
        importantContacts: ''
      };
      
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        preferences: defaultPreferences,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return defaultPreferences;
    }
  } catch (error) {
    console.error('Error getting user preferences:', error);
    
    // Return default preferences if there's an error
    return {
      autoSchedule: true,
      dailySummary: true,
      summaryTime: '18:00',
      workStartTime: '09:00',
      workEndTime: '17:00',
      lunchTime: '12:00',
      lunchDuration: 60,
      importantContacts: ''
    };
  }
};

/**
 * Update user preferences in Firestore
 * @param {Object} preferences - User preferences to update
 * @returns {Promise<void>}
 */
export const updateUserPreferences = async (preferences) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // Update existing document
      await updateDoc(userRef, {
        'preferences': preferences,
        'updatedAt': serverTimestamp()
      });
    } else {
      // Create new document with preferences
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        preferences: preferences,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

/**
 * Get user profile data
 * @returns {Promise<Object>} - User profile data
 */
export const getUserProfile = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};
