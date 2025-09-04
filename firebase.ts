// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA4Wc5CXMg-19GdBSzLT1cbD4dBnpYFfF0",
  authDomain: "pawpal-28f28.firebaseapp.com",
  projectId: "pawpal-28f28",
  storageBucket: "pawpal-28f28.firebasestorage.app",
  messagingSenderId: "363119788687",
  appId: "1:363119788687:web:af8b4c7914078ff6d9a6fa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
