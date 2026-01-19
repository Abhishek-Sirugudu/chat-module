// src/auth/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import axios from 'axios'; // Import Axios

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Define the Sync Function
  const syncUserToPostgres = async (user, role) => {
    try {
      await axios.post('http://localhost:3001/api/sync-user', {
        firebase_uid: user.uid,
        email: user.email,
        full_name: user.displayName || 'User',
        role: role || 'student'
      });
      console.log("✅ Synced user to Postgres");
    } catch (error) {
      console.error("❌ Failed to sync user to Postgres:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // 1. Get Role from Firebase (Existing Logic)
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          let role = 'student';
          
          if (docSnap.exists()) {
            role = docSnap.data().role;
            setUserRole(role);
          }
          
          // 2. Sync to Postgres (New Logic)
          await syncUserToPostgres(user, role);
          
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = () => {
    return signOut(auth);
  };

  const value = { currentUser, userRole, loading, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}