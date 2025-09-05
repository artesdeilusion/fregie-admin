import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

function initializeFirebase() {
  if (app) return { app, db, auth };

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID as string | undefined,
  };

  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  
  return { app, db, auth };
}

export function getFirebaseApp(): FirebaseApp {
  const { app } = initializeFirebase();
  if (!app) {
    throw new Error("Firebase app not initialized");
  }
  return app;
}

export function getFirebaseDB(): Firestore {
  const { db } = initializeFirebase();
  if (!db) {
    throw new Error("Firebase database not initialized");
  }
  return db;
}

export function getFirebaseAuth(): Auth {
  const { auth } = initializeFirebase();
  if (!auth) {
    throw new Error("Firebase auth not initialized");
  }
  return auth;
}

export { app, db, auth };
export default app;
