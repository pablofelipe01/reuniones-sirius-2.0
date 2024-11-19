import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA4FsL8YZhyHWsBiHXuNVAJbE-ZDcnvxLQ",
  authDomain: "sirius-reunion.firebaseapp.com",
  projectId: "sirius-reunion",
  storageBucket: "sirius-reunion.firebasestorage.app", // Updated to match your actual bucket
  messagingSenderId: "501385238151",
  appId: "1:501385238151:web:bd735f0e6c4937c3da4a22",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
const storage = getStorage(app);

// Initialize Firebase Auth
const auth = getAuth(app);

export { app, storage, auth };
