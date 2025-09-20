# 🐾 PawPal

PawPal is a mobile application built with **React Native + Expo** to help pet owners manage their pets' health records, tasks, and vaccinations.  
It includes features such as **pet categories (dog/cat), breed selection, vaccination reminders, and health record uploads**.

---

## ✨ Features
- Add pets by category (**dog/cat**)
- Select breed & view **vaccination schedule**
- Upload & view **health records**
- Task & **clinic visit reminders**
- Modern, mobile-friendly UI

---

## 🛠️ Tech Stack
- [React Native (Expo)](https://expo.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Firebase (Auth, Firestore, Storage)](https://firebase.google.com/)
- [React Navigation](https://reactnavigation.org/)

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Shimara-Appuhami/PawPal.git
cd pawpal

🔥 Firebase Configuration
1. Create a Firebase Project

Go to Firebase Console
.

Click Add Project → enter project name (e.g., PawPal).

Enable Firestore Database and Authentication (Email/Password or Google).

### 2. Register Your App

In Firebase Console → Project settings → Add app → Select Web app (</>).

Copy the Firebase SDK config snippet:

const firebaseConfig = {
  apiKey: "AIzaSy***************",
  authDomain: "pawpal-app.firebaseapp.com",
  projectId: "pawpal-app",
  storageBucket: "pawpal-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456",
};

### 3. Install Firebase SDK
npm install firebase

### 4. Create a Firebase Config File

Create src/firebase.ts:

// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your config from Firebase console
const firebaseConfig = {
  apiKey: "AIzaSy***************",
  authDomain: "pawpal-app.firebaseapp.com",
  projectId: "pawpal-app",
  storageBucket: "pawpal-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

📱 Navigation

This project uses React Navigation for moving between screens:

Home

Pet Categories (Dog/Cat)

Vaccinations

Health Records

Tasks / Reminders

Help / Guidelines

Next Steps
----------

Add .env file to store Firebase credentials securely

Deploy using Expo EAS for Android/iOS builds
npm install
npm start

build file - https://expo.dev/accounts/shimara-appuhami/projects/pawpal/builds/177302a2-a924-4040-8bb9-04013334ada3
