import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvMiJ-jt3XCbKGER9_r6pr1HhZAKfCfYs",
  authDomain: "aaronix-chat.firebaseapp.com",
  projectId: "aaronix-chat",
  storageBucket: "aaronix-chat.firebasestorage.app",
  messagingSenderId: "770811346394",
  appId: "1:770811346394:web:4699dbd458de6b4b9d94e3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);// Firebase Configuration
