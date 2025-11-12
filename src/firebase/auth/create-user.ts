
'use client';

import { doc, setDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import { firebaseApp } from '../config';
import type { User } from 'firebase/auth';

const db = getFirestore(firebaseApp);

export async function createUserDocument(
  user: User,
  role: 'student' | 'coach' | 'admin',
  fullName?: string | null,
) {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  const userData = {
    uid: user.uid,
    email: user.email,
    role: role,
    fullName: fullName,
    avatarUrl: user.photoURL,
    createdAt: serverTimestamp(),
  };
  return setDoc(userRef, userData, { merge: true });
}
