
'use client';

import { useEffect } from 'react';
import { FirebaseProvider, FirebaseContextValue } from './provider';
import { getRedirectResult, getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { createUserDocument } from './auth/create-user';
import { useRouter } from 'next/navigation';

let app: FirebaseContextValue;

// This function checks if a user is new by comparing creation and last sign-in times.
const isNewUser = (user: any): boolean => {
  if (!user.metadata.creationTime || !user.metadata.lastSignInTime) {
    return false;
  }
  const creationTime = new Date(user.metadata.creationTime).getTime();
  const lastSignInTime = new Date(user.metadata.lastSignInTime).getTime();
  // If the times are very close (e.g., within a few seconds), it's likely a new user sign-up.
  return Math.abs(creationTime - lastSignInTime) < 5000;
};

export const FirebaseClientProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: FirebaseContextValue;
}) => {
  if (!app) {
    app = value;
  }

  useEffect(() => {
    const auth = getAuth(app.app);
    const db = getFirestore(app.app);

    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const user = result.user;
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists() && isNewUser(user)) {
            const authRole = sessionStorage.getItem('authRole') || 'student';
            await createUserDocument(user, authRole as 'student' | 'coach' | 'admin', user.displayName);
            // No need to redirect here, the useUser hook will handle it.
            // Just ensure the user document is created.
          }
        }
      } catch (error) {
        console.error("Error handling redirect result:", error);
      }
    };
    
    handleRedirect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <FirebaseProvider>{children}</FirebaseProvider>;
};
