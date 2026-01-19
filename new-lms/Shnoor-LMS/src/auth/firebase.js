import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBmrcuw21jbqnL6dP2OQufvhhEibRHMU50",
  authDomain: "shnoor-lms-e1f44.firebaseapp.com",
  projectId: "shnoor-lms-e1f44",
  storageBucket: "shnoor-lms-e1f44.firebasestorage.app",
  messagingSenderId: "628973656264",
  appId: "1:628973656264:web:e6373537b71e2985372dfd",
  measurementId: "G-51X474W04J"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const messaging = getMessaging(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, storage, messaging, googleProvider };