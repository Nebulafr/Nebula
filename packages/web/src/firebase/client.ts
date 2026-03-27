import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { publicEnv } from "@/config/env";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: publicEnv.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: publicEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: publicEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: publicEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: publicEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: publicEnv.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export default app;
