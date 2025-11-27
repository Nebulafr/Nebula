import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyByA_xtg5L6Vmj_e4tsyOs2c3ekVblOnTU",
  authDomain: "nebula-experiment-234646-4d174.firebaseapp.com",
  projectId: "nebula-experiment-234646-4d174",
  storageBucket: "nebula-experiment-234646-4d174.firebasestorage.app",
  messagingSenderId: "187194032912",
  appId: "1:187194032912:web:d8d9046d77fd7df5bfdb95",
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const storage = getStorage(app);
export const provider = new GoogleAuthProvider();

export default app;
