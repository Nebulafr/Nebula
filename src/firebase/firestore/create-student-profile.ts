
'use client';

import { doc, setDoc, serverTimestamp, type Firestore } from 'firebase/firestore';

export async function createStudentProfile(
  db: Firestore,
  userId: string,
  data: {
    interestedProgram: string;
    skillLevel: string;
    commitment: string;
  },
) {
  const studentRef = doc(db, 'students', userId);
  const studentData = {
    ...data,
    userRef: doc(db, 'users', userId),
    createdAt: serverTimestamp(),
  };
  return setDoc(studentRef, studentData, { merge: true });
}
