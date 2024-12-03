// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCPlUi2vFVKYeURPbtwcf8_ifTTaUP-6uo",
  authDomain: "travelshare-8e170.firebaseapp.com",
  projectId: "travelshare-8e170",
  storageBucket: "travelshare-8e170.firebasestorage.app",
  messagingSenderId: "443334298812",
  appId: "1:443334298812:web:44140c07797f3b00a8d4b9"
};
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

// Obtener instancias de servicios
export const db = getFirestore(app);
export const auth = getAuth(app);

console.log('Firebase configurado correctamente'); // Debug