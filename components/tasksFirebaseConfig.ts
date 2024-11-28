import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const tasksFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_TASKS_FIREBASE_API_KEY,
  authDomain: "sirius-tasks.firebaseapp.com",
  projectId: "sirius-tasks",
  storageBucket: "sirius-tasks.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_TASKS_MESSAGING_SENDER_ID,
  appId: "1:792210545680:web:27c329b291bbcbbac13e95",
};

// Initialize Firebase for tasks
let tasksApp;
if (typeof window !== 'undefined') {
  if (!getApps().length) {
    tasksApp = initializeApp(tasksFirebaseConfig);
  } else {
    tasksApp = getApp();
  }
}

const tasksStorage = getStorage(tasksApp);
const tasksAuth = getAuth(tasksApp);
const tasksDb = getDatabase(tasksApp);

export { tasksApp, tasksStorage, tasksAuth, tasksDb };
