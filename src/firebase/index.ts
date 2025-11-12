
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseApp } from './config';
import { FirebaseClientProvider } from './client-provider';
import {
  FirebaseProvider,
  useAuth,
  useFirebase,
  useFirebaseApp,
  useFirestore,
} from './provider';
import { useUser } from './auth/use-user';
import type { FirebaseApp } from 'firebase/app';

let auth: Auth;
let db: Firestore;

function initializeFirebase(): { app: FirebaseApp; auth: Auth; db: Firestore } {
  if (!auth || !db) {
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
  }
  return {
    app: firebaseApp,
    auth,
    db,
  };
}

export {
  FirebaseClientProvider,
  FirebaseProvider,
  useAuth,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  initializeFirebase,
  useUser,
  db,
};
