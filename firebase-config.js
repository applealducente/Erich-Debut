// Firebase Configuration for Erich Enchants
const firebaseConfig = {
  apiKey: "AIzaSyC23EdjuCmwmhR4AQZELE3ojyQEzKUS8KQ",
  authDomain: "erich-enchants.firebaseapp.com",
  databaseURL: "https://erich-enchants-default-rtdb.firebaseio.com",
  projectId: "erich-enchants",
  storageBucket: "erich-enchants.firebasestorage.app",
  messagingSenderId: "717900637787",
  appId: "1:717900637787:web:62aa390acd88d50bd9817e",
  measurementId: "G-YDPSQ4E2HL"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

console.log('Firebase initialized');
